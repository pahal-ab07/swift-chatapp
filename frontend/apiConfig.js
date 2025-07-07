// apiConfig.js
let baseUrl;
let socketUrl;

if (import.meta.env.VITE_NODE_ENV === "production") {
  // In production, these will be set by environment variables
  baseUrl = import.meta.env.VITE_API_URL || "https://your-app-name.onrender.com";
  socketUrl = import.meta.env.VITE_SOCKET_URL || "wss://your-app-name.onrender.com";
} else {
  baseUrl = "http://localhost:4000";
  socketUrl = "ws://localhost:4000";
}

export { baseUrl, socketUrl };