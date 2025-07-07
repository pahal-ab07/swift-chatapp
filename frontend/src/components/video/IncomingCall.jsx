import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ringtone from '../../utils/ringtone';

const IncomingCall = ({ 
  isOpen, 
  callerName, 
  callerId, 
  onAccept, 
  onReject, 
  onClose 
}) => {
  const timeoutRef = useRef();

  useEffect(() => {
    if (isOpen) {
      // Start ringtone
      ringtone.play();
      
      // Auto-reject after 30 seconds
      timeoutRef.current = setTimeout(() => {
        handleReject();
      }, 30000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        ringtone.stop(); // Always stop on unmount
      };
    } else {
      // Stop ringtone when modal closes
      ringtone.stop();
    }
  }, [isOpen]);

  const handleAccept = () => {
    ringtone.stop();
    onAccept();
  };

  const handleReject = () => {
    ringtone.stop();
    onReject();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 text-center">

        {/* Caller Info */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Incoming Video Call</h2>
          <p className="text-gray-300">{callerName}</p>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors"
            title="Accept Call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>

          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
            title="Reject Call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>

        {/* Call Status */}
        <p className="text-gray-400 text-sm mt-4">Calling...</p>
      </div>
    </div>
  );
};

export default IncomingCall; 