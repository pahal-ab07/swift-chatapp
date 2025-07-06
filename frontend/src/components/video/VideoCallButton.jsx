import React, { useState } from 'react';
import VideoCall from './VideoCall';

const VideoCallButton = ({ selectedUserId, selectedUserName }) => {
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const handleVideoCall = () => {
    setIsVideoCallOpen(true);
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
          selectedUserId={selectedUserId}
          selectedUserName={selectedUserName}
        />
      )}
    </>
  );
};

export default VideoCallButton; 