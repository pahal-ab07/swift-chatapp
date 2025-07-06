// apiConfig.js
let baseUrl;
let socketUrl;
let twilioTurnUrls, twilioUsername, twilioCredential;

if (import.meta.env.VITE_NODE_ENV === "production") {
  // In production, these will be set by environment variables
  baseUrl = import.meta.env.VITE_API_URL || "https://your-app-name.onrender.com";
  socketUrl = import.meta.env.VITE_SOCKET_URL || "wss://your-app-name.onrender.com";
  twilioTurnUrls = (import.meta.env.VITE_TWILIO_TURN_URLS && import.meta.env.VITE_TWILIO_TURN_URLS.split(',')) || [];
  twilioUsername = import.meta.env.VITE_TWILIO_USERNAME || '';
  twilioCredential = import.meta.env.VITE_TWILIO_CREDENTIAL || '';
} else {
  baseUrl = "http://localhost:4000";
  socketUrl = "ws://localhost:4000";
  twilioTurnUrls = [];
  twilioUsername = '';
  twilioCredential = '';
}

export { baseUrl, socketUrl, twilioTurnUrls, twilioUsername, twilioCredential };