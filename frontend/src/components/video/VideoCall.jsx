import React from 'react';

const JITSI_ROOM_URL = "https://meet.jit.si/UMIJKhOBm30GgSvVf2M3";

export default function VideoCall({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 1000 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, zIndex: 1001, background: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Close</button>
      <iframe
        src={JITSI_ROOM_URL}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: "100vw", height: "100vh", border: 0 }}
        title="Jitsi Meet Video Call"
      />
    </div>
  );
} 