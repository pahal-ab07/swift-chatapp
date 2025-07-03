import React from "react";
import Avatar from "./Avatar";

const Contact = ({
  userId,
  username,
  selectedUserId,
  setSelectedUserId,
  isOnline,
  avatarLink,
}) => {
  return (
    <li
      key={userId}
      className={`transition-all duration-150 flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-primarySecond/30 select-none shadow-sm border border-transparent ${selectedUserId === userId ? "bg-primarySecond/60 border-primarySecond" : "bg-dark/40"}`}
      onClick={() => setSelectedUserId(userId)}
    >
      <Avatar
        userId={userId}
        username={username}
        isOnline={isOnline}
        avatarLink={avatarLink}
      />
      <span className="text-xs md:text-base text-white font-medium flex-1 truncate">{username}</span>
      {isOnline && (
        <span className="text-xs rounded-full bg-green-500 px-2 py-0.5 text-white font-semibold">Active</span>
      )}
    </li>
  );
};

export default Contact;