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

// Function to get working ICE servers (STUN + TURN)
const getWorkingTurnServers = () => {
  return [
    // STUN servers (for direct connections when possible)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Reliable TURN servers that are known to work
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    // Additional TURN server for redundancy
    {
      urls: [
        'turn:relay.metered.ca:80',
        'turn:relay.metered.ca:443',
        'turn:relay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    // Free TURN server without authentication
    {
      urls: [
        'turn:stun.l.google.com:19302',
        'turn:stun1.l.google.com:19302'
      ]
    }
  ];
};

export { baseUrl, socketUrl, getWorkingTurnServers };