import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

// Props: isOpen, onClose, myPeerId, remotePeerId
export default function VideoCall({ isOpen, onClose, myPeerId, remotePeerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [callObj, setCallObj] = useState(null);
  const [stream, setStream] = useState(null);
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let p, localStream, outgoingCall;
    let destroyed = false;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(ls => {
      localStream = ls;
      setStream(ls);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = ls;
      }
      p = new Peer(myPeerId, { debug: 2 });
      setPeer(p);
      // Callee: listen for incoming calls
      p.on('call', call => {
        call.answer(localStream);
        setCallObj(call);
        call.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        call.on('close', () => {
          setCallEnded(true);
          if (onClose) onClose();
        });
        call.on('error', () => {
          setCallEnded(true);
          if (onClose) onClose();
        });
      });
      // Caller: only if remotePeerId is provided
      if (remotePeerId) {
        outgoingCall = p.call(remotePeerId, localStream);
        setCallObj(outgoingCall);
        outgoingCall.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        outgoingCall.on('close', () => {
          setCallEnded(true);
          if (onClose) onClose();
        });
        outgoingCall.on('error', () => {
          setCallEnded(true);
          if (onClose) onClose();
        });
      }
    });
    return () => {
      destroyed = true;
      if (p) p.destroy();
      if (callObj) callObj.close();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
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
      {callEnded && (
        <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', color: 'white' }}>
          Call ended
        </div>
      )}
    </div>
  );
} 