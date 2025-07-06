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

// Function to get working TURN servers (multiple reliable free TURN servers)
const getWorkingTurnServers = () => {
  return [
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: [
        'turn:relay.metered.ca:80',
        'turn:relay.metered.ca:443',
        'turn:relay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ];
};

export { baseUrl, socketUrl, getWorkingTurnServers };