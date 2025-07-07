import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useWebSocket } from '../../context/websocketContext';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

// Props: isOpen, onClose, myPeerId, remotePeerId
export default function VideoCall({ isOpen, onClose, myPeerId, remotePeerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [callObj, setCallObj] = useState(null);
  const [stream, setStream] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [callError, setCallError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [calleeReady, setCalleeReady] = useState(false);
  const { sendMessage, ws } = useWebSocket();

  // Store caller/callee role
  const isCaller = !!remotePeerId;
  console.log('[VideoCall] Rendered with:', { isOpen, myPeerId, remotePeerId, isCaller });

  // Listen for 'peer-ready' message if caller
  useEffect(() => {
    if (!isCaller || !ws) return;
    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[VideoCall] WS message (caller):', data);
        if (data.type === 'peer-ready' && data.peerId === remotePeerId) {
          setCalleeReady(true);
          console.log('[VideoCall] Callee is ready:', remotePeerId);
        }
      } catch (err) {
        console.error('[VideoCall] Error parsing WS message (caller):', err);
      }
    };
    ws.addEventListener('message', handler);
    return () => ws.removeEventListener('message', handler);
  }, [isCaller, ws, remotePeerId]);

  // Ensure PeerJS instance is created as soon as isOpen is true
  useEffect(() => {
    if (!isOpen) return;
    let p, localStream, outgoingCall;
    let destroyed = false;
    let hasCalled = false;
    let callCleanup;
    let retryTimeout = null;
    let peerOpen = false;

    console.log('[VideoCall] Getting user media...');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(ls => {
      localStream = ls;
      setStream(ls);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = ls;
      }
      console.log('[VideoCall] Creating PeerJS instance with ID:', myPeerId);
      p = new Peer(myPeerId, { debug: 2 });
      setPeer(p);
      // Callee: listen for incoming calls
      p.on('call', call => {
        if (hasCalled) return; // Prevent double answering
        hasCalled = true;
        console.log('[VideoCall] Incoming call, answering...', { myPeerId, remotePeerId });
        call.answer(localStream);
        setCallObj(call);
        call.on('stream', remoteStream => {
          console.log('[VideoCall] Received remote stream (callee)');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        call.on('close', () => {
          console.log('[VideoCall] Call closed (callee)');
          setCallEnded(true);
          if (onClose) onClose();
        });
        call.on('error', (err) => {
          console.error('[VideoCall] Call error (callee):', err);
          setCallEnded(true);
          setCallError('Call error: ' + err.message);
          if (onClose) onClose();
        });
        call.on('disconnected', () => {
          console.log('[VideoCall] Call disconnected (callee)');
          setCallEnded(true);
          if (onClose) onClose();
        });
        callCleanup = () => {
          call.close();
        };
      });
      // PeerJS open event
      p.on('open', () => {
        peerOpen = true;
        console.log('[VideoCall] PeerJS open:', myPeerId, 'isCaller:', isCaller, 'remotePeerId:', remotePeerId);
        // Callee: notify caller that peer is ready
        if (!isCaller && ws && remotePeerId) {
          console.log('[VideoCall] Callee sending peer-ready to:', remotePeerId);
          sendMessage({ type: 'peer-ready', peerId: myPeerId, to: remotePeerId });
        }
        // Caller: only call after callee is ready
        if (isCaller && remotePeerId) {
          console.log('[VideoCall] Caller waiting for calleeReady');
        }
      });
      p.on('error', (err) => {
        console.error('[VideoCall] PeerJS error:', err);
        setCallError('PeerJS error: ' + err.message);
        setCallEnded(true);
        if (onClose) onClose();
      });
    });
    return () => {
      destroyed = true;
      if (p) p.destroy();
      if (callCleanup) callCleanup();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (retryTimeout) clearTimeout(retryTimeout);
      console.log('[VideoCall] Cleanup complete');
    };
    // eslint-disable-next-line
  }, [isOpen, myPeerId, remotePeerId, ws]);

  // Caller: attempt call only after calleeReady
  useEffect(() => {
    if (!isCaller || !calleeReady || !peer || !stream) return;
    let outgoingCall;
    let callCleanup;
    let hasCalled = false;
    let retryTimeout = null;
    console.log('[VideoCall] Caller attempting call to:', remotePeerId);
    const doCall = (attempt = 1) => {
      if (hasCalled) return;
      hasCalled = true;
      outgoingCall = peer.call(remotePeerId, stream);
      setCallObj(outgoingCall);
      outgoingCall.on('stream', remoteStream => {
        console.log('[VideoCall] Received remote stream (caller)');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      outgoingCall.on('close', () => {
        console.log('[VideoCall] Call closed (caller)');
        setCallEnded(true);
        if (onClose) onClose();
      });
      outgoingCall.on('error', (err) => {
        console.error('[VideoCall] Call error (caller):', err);
        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt);
          retryTimeout = setTimeout(() => doCall(attempt + 1), RETRY_DELAY_MS);
        } else {
          setCallError('Could not connect to the other user. Please try again later.');
          setCallEnded(true);
          if (onClose) onClose();
        }
      });
      outgoingCall.on('disconnected', () => {
        console.log('[VideoCall] Call disconnected (caller)');
        setCallEnded(true);
        if (onClose) onClose();
      });
      callCleanup = () => {
        outgoingCall.close();
      };
    };
    doCall(1);
    return () => {
      if (callCleanup) callCleanup();
      if (retryTimeout) clearTimeout(retryTimeout);
      console.log('[VideoCall] Caller cleanup complete');
    };
    // eslint-disable-next-line
  }, [isCaller, calleeReady, peer, stream, remotePeerId, onClose]);

  // Optionally, listen for call-ended WebSocket message and clean up (if you add this to backend)
  // useEffect(() => {
  //   if (!ws) return;
  //   const handler = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data.type === 'call-ended') {
  //       setCallEnded(true);
  //       if (onClose) onClose();
  //     }
  //   };
  //   ws.addEventListener('message', handler);
  //   return () => ws.removeEventListener('message', handler);
  // }, [ws, onClose]);

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
          {callError ? callError : 'Call ended'}
        </div>
      )}
      {retryCount > 0 && !callEnded && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', color: 'yellow' }}>
          Retrying... (Attempt {retryCount + 1} of {MAX_RETRIES})
        </div>
      )}
      {isCaller && !calleeReady && !callEnded && (
        <div style={{ position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', color: 'yellow' }}>
          Waiting for the other user to be ready...
        </div>
      )}
    </div>
  );
} 