import React, { useEffect, useRef } from "react";

const ChatMessages = ({ messages, userDetails, selectedUserId }) => {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, messagesContainerRef]);

  // TopBar is about 60px (py-5), MessageInputForm is about 64px (h-16 + padding)
  // Add extra padding to ensure messages are not hidden
  return (
    <div
      className="flex-1 min-h-0 flex flex-col overflow-y-auto px-4 md:px-10 pt-20 pb-28 space-y-3 scrollbar-thin scrollbar-thumb-primarySecond scrollbar-track-primary/30"
      ref={messagesContainerRef}
    >
      {!!selectedUserId && (
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`max-w-[70%] md:max-w-[60%] break-words px-5 py-3 rounded-2xl shadow-md relative text-white text-base md:text-lg ${
                message.sender !== userDetails._id
                  ? "bg-primary self-start rounded-bl-none"
                  : "bg-primarySecond self-end rounded-br-none"
              }`}
            >
              {message.text}
              <div
                className={`absolute top-0 w-0 h-0 ${
                  message.sender !== userDetails._id
                    ? "border-r-primary -left-4 border-r-[20px]"
                    : "rounded-l-lg -right-4 border-l-primarySecond border-l-[20px]"
                } border-b-[20px] border-b-transparent`}
              ></div>
            </div>
          ))}
        </div>
      )}
      {selectedUserId && !messages.length && (
        <div className="text-gray-400 flex items-center justify-center h-full text-lg">
          Start a conversation
        </div>
      )}
    </div>
  );
};

export default ChatMessages;