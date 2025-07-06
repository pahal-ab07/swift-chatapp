import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProfile } from './profileContext';
import { useWebSocket } from './websocketContext';
import IncomingCall from '../components/video/IncomingCall';
import RingtoneSettings from '../components/video/RingtoneSettings';
import { toast } from 'react-hot-toast';

const VideoCallContext = createContext();

export const VideoCallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallInfo, setCurrentCallInfo] = useState(null);
  const [showRingtoneSettings, setShowRingtoneSettings] = useState(false);
  const { userDetails } = useProfile();
  const { ws, sendMessage } = useWebSocket();

  useEffect(() => {
    if (userDetails && ws) {
      // Listen for incoming call offers only
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'video-call-offer' && !isInCall) {
            console.log('Incoming call from:', data.fromName);
            setIncomingCall({
              callerId: data.from,
              callerName: data.fromName,
              offer: data.offer
            });
            
            // Show notification
            toast.success(`Incoming call from ${data.fromName}`, {
              duration: 10000,
              icon: '📞'
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.addEventListener('message', handleMessage);

      return () => {
        ws.removeEventListener('message', handleMessage);
      };
    }
  }, [userDetails, ws, isInCall]);

  const acceptCall = () => {
    if (incomingCall) {
      // Set current call info and open video call
      setCurrentCallInfo({
        userId: incomingCall.callerId,
        userName: incomingCall.callerName,
        offer: incomingCall.offer
      });
      setIsInCall(true);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      sendMessage({
        type: 'video-call-rejected',
        to: incomingCall.callerId,
        message: 'Call was rejected'
      });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (currentCallInfo) {
      sendMessage({
        type: 'end-call',
        to: currentCallInfo.userId
      });
    }
    setIsInCall(false);
    setCurrentCallInfo(null);
    setIncomingCall(null);
  };

  const value = {
    incomingCall,
    isInCall,
    setIsInCall,
    currentCallInfo,
    acceptCall,
    rejectCall,
    endCall,
    showRingtoneSettings: () => setShowRingtoneSettings(true)
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
      
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCall
          isOpen={!!incomingCall}
          callerName={incomingCall.callerName}
          callerId={incomingCall.callerId}
          onAccept={acceptCall}
          onReject={rejectCall}
          onClose={() => setIncomingCall(null)}
        />
      )}

      {/* Ringtone Settings Modal */}
      {showRingtoneSettings && (
        <RingtoneSettings
          isOpen={showRingtoneSettings}
          onClose={() => setShowRingtoneSettings(false)}
        />
      )}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
}; 