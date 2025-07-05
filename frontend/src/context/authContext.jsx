import Cookies from "js-cookie";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setAuthenticated = (value) => {
    setIsAuthenticated(value);
  };
  const checkAuth = () => {
    const token = Cookies.get("authToken");
    console.log("Checking authentication...", token ? "Token found" : "No token");
    if (token) {
      console.log("Token exists. Setting authenticated to true.");
      setAuthenticated(true);
    } else {
      console.log("Token does not exist. Setting authenticated to false.");
      setAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear server-side cookie
      await axios.post("/api/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear client-side cookie
      Cookies.remove("authToken");
      setAuthenticated(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setAuthenticated, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};