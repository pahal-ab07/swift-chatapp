import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const LandingNav = () => {
  const { isAuthenticated } = useAuth();
  return (
    <nav className="sticky top-0 z-50 bg-dark/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4 px-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Swift Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Swift-Chat
          </span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link
            to={isAuthenticated ? "/chathome" : "/login"}
            className="py-1 px-4 text-white hover:text-primarySecond text-lg font-medium rounded transition"
          >
            {isAuthenticated ? "Home" : "Login"}
          </Link>
          <Link
            to="#contact"
            className="py-1 px-4 text-white hover:text-primarySecond text-lg font-medium rounded transition"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;