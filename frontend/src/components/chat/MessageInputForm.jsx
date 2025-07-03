import React from "react";

const MessageInputForm = ({
  selectedUserId,
  newMessage,
  setNewMessage,
  sendMessage,
}) => {
  return (
    <>
      {!!selectedUserId && (
        <form onSubmit={sendMessage} className="relative m-4 w-[85%] border-t border-gray-500 pt-1.5 flex items-center">
          <input
            type="search"
            id="search-dropdown"
            className="w-full px-4 py-3 rounded-xl bg-background outline-none text-white border border-primary/30 focus:border-primarySecond transition"
            placeholder="Your Message"
            value={newMessage}
            onChange={(ev) => setNewMessage(ev.target.value)}
            required
          />
          <button
            type="submit"
            className="absolute end-0 h-10 aspect-square flex items-center justify-center rounded-xl bg-primarySecond hover:bg-primary transition text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primarySecond focus:ring-offset-2 mr-1"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      )}
    </>
  );
};

export default MessageInputForm;