import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

// Props: isOpen, onClose, myPeerId, remotePeerId
export default function VideoCall({ isOpen, onClose, myPeerId, remotePeerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [callObj, setCallObj] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    // 1. Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(localStream => {
      setStream(localStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      // 2. Create PeerJS instance
      const p = new Peer(myPeerId, { debug: 2 });
      setPeer(p);
      // 3. Listen for incoming calls
      p.on('call', call => {
        call.answer(localStream);
        setCallObj(call);
        call.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });
      // 4. If remotePeerId is provided, call them
      if (remotePeerId) {
        const call = p.call(remotePeerId, localStream);
        setCallObj(call);
        call.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      }
    });
    return () => {
      if (peer) peer.destroy();
      if (callObj) callObj.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [isOpen, myPeerId, remotePeerId]);

  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, zIndex: 1001, background: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Close</button>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 320, marginRight: 16, background: '#222', borderRadius: 8 }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 320, background: '#222', borderRadius: 8 }} />
      </div>
    </div>
  );
} 