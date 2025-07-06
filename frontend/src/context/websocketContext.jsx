import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useProfile } from './profileContext';
import { socketUrl } from '../../apiConfig';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { userDetails } = useProfile();
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    console.log('Attempting to connect WebSocket to:', socketUrl);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return; // Already connected
    }

    const websocket = new WebSocket(socketUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setWs(websocket);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setWs(null);
      
      // Attempt to reconnect after 3 seconds
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Set the WebSocket immediately so it's available
    setWs(websocket);
  };

  const sendMessage = (message) => {
    console.log('Attempting to send message:', message);
    console.log('WebSocket state:', ws ? ws.readyState : 'null');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending message via WebSocket');
      ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected. ReadyState:', ws ? ws.readyState : 'null');
      console.error('Message that failed to send:', message);
    }
  };

  useEffect(() => {
    console.log('WebSocket useEffect - userDetails:', userDetails ? 'available' : 'not available');
    
    if (userDetails && userDetails._id) {
      console.log('User details available, connecting WebSocket...');
      connectWebSocket();
    } else {
      console.log('User details not available yet, waiting...');
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [userDetails]);

  const value = {
    ws,
    isConnected,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 