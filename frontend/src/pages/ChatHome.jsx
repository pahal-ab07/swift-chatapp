import React, { useEffect, useState } from "react";
import { useProfile } from "../context/profileContext";
import { useWebSocket } from "../context/websocketContext";
import { useVideoCall } from "../context/videoCallContext";
import axios from "axios";
import ChatMessages from "../components/chat/ChatMessages";
import MessageInputForm from "../components/chat/MessageInputForm";
import Nav from "../components/chat/Nav";
import OnlineUsersList from "../components/chat/OnlineUserList";
import TopBar from "../components/chat/TopBar";
import VideoCall from "../components/video/VideoCall";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const ChatHome = () => {
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { userDetails } = useProfile();
  const { ws, sendMessage } = useWebSocket();
  const { isInCall, setIsInCall, currentCallInfo } = useVideoCall();
  const { isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ws) {
      ws.addEventListener("message", handleMessage);
    }
    return () => {
      if (ws) {
        ws.removeEventListener("message", handleMessage);
      }
    };
  }, [ws, selectedUserId]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedUserId) {
        try {
          const res = await axios.get(`/api/user/messages/${selectedUserId}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchData();
  }, [selectedUserId]);

  useEffect(() => {
    axios.get("/api/user/people").then((res) => {
      const offlinePeopleArr = res?.data
        .filter((p) => p._id !== userDetails?._id)
        .filter((p) => !onlinePeople[p._id]);

      const offlinePeopleWithAvatar = offlinePeopleArr.map((p) => ({
        ...p,
        avatarLink: p.avatarLink,
      }));

      setOfflinePeople(
        offlinePeopleWithAvatar.reduce((acc, p) => {
          acc[p._id] = p;
          return acc;
        }, {})
      );
    });
  }, [onlinePeople, userDetails]);

  useEffect(() => {
    const handleRealTimeMessage = (event) => {
      const messageData = JSON.parse(event.data);
      if ("text" in messageData) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === messageData.id || msg._id === messageData.id)) {
            return prev;
          }
          return [...prev, { ...messageData }];
        });
      }
    };
    if (ws) {
      ws.addEventListener("message", handleRealTimeMessage);
    }
    return () => {
      if (ws) {
        ws.removeEventListener("message", handleRealTimeMessage);
      }
    };
  }, [ws, selectedUserId]);

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username, avatarLink }) => {
      if (userId !== userDetails?._id) {
        people[userId] = {
          username,
          avatarLink,
        };
      }
    });

    setOnlinePeople(people);
  };

  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const sendChatMessage = (ev) => {
    if (ev) ev.preventDefault();
    sendMessage({ text: newMessage, recipient: selectedUserId });
    setNewMessage("");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedUserId) {
        try {
          const res = await axios.get(`/api/user/messages/${selectedUserId}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchData();
  }, [selectedUserId]);
  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      navigate("/");
    }
  }, []);
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Nav />
      <OnlineUsersList
        onlinePeople={onlinePeople}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        offlinePeople={offlinePeople}
      />
      <main className="flex-1 flex flex-col h-full">
        <section className="flex-1 flex flex-col h-full w-full bg-primary/80 rounded-none shadow-none relative overflow-hidden">
          {selectedUserId && (
            <TopBar
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              offlinePeople={offlinePeople}
              onlinePeople={onlinePeople}
            />
          )}
          <ChatMessages
            messages={messages}
            userDetails={userDetails}
            selectedUserId={selectedUserId}
          />
          <div className="absolute w-full bottom-0 flex justify-center items-center p-4 bg-primary/90">
            <MessageInputForm
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendChatMessage}
              selectedUserId={selectedUserId}
            />
          </div>
        </section>
      </main>

      {/* Video Call Component */}
      {isInCall && currentCallInfo && (
        <VideoCall
          isOpen={isInCall}
          onClose={() => setIsInCall(false)}
          selectedUserId={currentCallInfo.userId}
          selectedUserName={currentCallInfo.userName}
        />
      )}
    </div>
  );
};

export default ChatHome;