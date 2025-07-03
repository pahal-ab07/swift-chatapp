import React, { useState } from "react";
import Avatar from "./Avatar";
import Contact from "./Contact";

const OnlineUsersList = ({
  onlinePeople,
  offlinePeople,
  selectedUserId,
  setSelectedUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOnlinePeople = Object.keys(onlinePeople).filter((userId) => {
    const username = onlinePeople[userId].username || "";
    return username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredOfflinePeople = Object.keys(offlinePeople).filter((userId) => {
    const { firstName, lastName } = offlinePeople[userId];
    const fullName = `${firstName} ${lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <aside className="w-[90px] md:w-[220px] xl:w-[270px] py-4 px-2 md:px-4 bg-primary h-full border-r border-gray-800 flex flex-col">
      <div className="flex items-center gap-2 p-2 mb-6 bg-dark rounded-xl shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-white placeholder-gray-400"
        />
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
        {filteredOnlinePeople.map((userId) => {
          const { username, avatarLink } = onlinePeople[userId];
          return (
            <Contact
              key={userId}
              userId={userId}
              username={username}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              isOnline={true}
              avatarLink={avatarLink}
            />
          );
        })}
        {filteredOfflinePeople.map((userId) => {
          const { _id, firstName, lastName, avatarLink } = offlinePeople[userId];
          return (
            <Contact
              key={_id}
              userId={_id}
              username={`${firstName} ${lastName}`}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              isOnline={false}
              avatarLink={avatarLink}
            />
          );
        })}
      </ul>
    </aside>
  );
};

export default OnlineUsersList;