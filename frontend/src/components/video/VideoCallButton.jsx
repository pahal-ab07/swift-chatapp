import React, { useState } from 'react';
import VideoCall from './VideoCall';
import { useWebSocket } from '../../context/websocketContext';
import { useProfile } from '../../context/profileContext';
import { useVideoCall } from '../../context/videoCallContext';

function generatePeerId(userId) {
  // Use userId or a random string for PeerJS
  return userId ? `peer_${userId}` : `peer_${Math.random().toString(36).substr(2, 9)}`;
}

const VideoCallButton = ({ selectedUserId, selectedUserName }) => {
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const { sendMessage } = useWebSocket();
  const { userDetails } = useProfile();
  const { setIsInCall, setCurrentCallInfo } = useVideoCall();
  const myPeerId = generatePeerId(userDetails?._id);
  const remotePeerId = generatePeerId(selectedUserId);

  const handleVideoCall = () => {
    console.log('[VideoCallButton] Sending call-invite to:', selectedUserId, 'with myPeerId:', myPeerId);
    // Send call-invite to the other user with our peer ID
    sendMessage({
      type: 'call-invite',
      to: selectedUserId,
      from: userDetails?.username || userDetails?.name || 'Unknown',
      peerId: myPeerId,
    });
    console.log('[VideoCallButton] Setting currentCallInfo and isInCall', {
      userId: selectedUserId,
      userName: selectedUserName,
      peerId: remotePeerId,
      isCaller: true
    });
    setCurrentCallInfo({
      userId: selectedUserId,
      userName: selectedUserName,
      peerId: remotePeerId,
      isCaller: true
    });
    setIsInCall(true);
  };

  return (
    <>
      <button
        onClick={handleVideoCall}
        className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        title="Start Video Call"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      </button>

      {isVideoCallOpen && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          myPeerId={myPeerId}
          remotePeerId={remotePeerId}
        />
      )}
    </>
  );
};

export default VideoCallButton; 