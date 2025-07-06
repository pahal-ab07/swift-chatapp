import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useProfile } from '../../context/profileContext';
import { useWebSocket } from '../../context/websocketContext';
import { useVideoCall } from '../../context/videoCallContext';
import { twilioTurnUrls, twilioUsername, twilioCredential } from '../../../apiConfig';

const VideoCall = ({ isOpen, onClose, selectedUserId, selectedUserName }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [isInitialized, setIsInitialized] = useState(false);
  const [iceConnectionState, setIceConnectionState] = useState('new');
  const [peerConnectionState, setPeerConnectionState] = useState('new');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const { userDetails } = useProfile();
  const { ws, sendMessage } = useWebSocket();
  const { currentCallInfo } = useVideoCall();

  // WebRTC configuration with Twilio TURN servers
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Twilio TURN servers
      ...(twilioTurnUrls.length > 0 ? [{
        urls: twilioTurnUrls,
        username: twilioUsername,
        credential: twilioCredential
      }] : []),
      // Fallback free TURN servers (only if Twilio is not configured)
      ...(twilioTurnUrls.length === 0 ? [{
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }] : [])
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Log TURN server configuration for debugging
  useEffect(() => {
    console.log('TURN Server Configuration:', {
      twilioTurnUrls,
      twilioUsername: twilioUsername ? '***' : 'not set',
      twilioCredential: twilioCredential ? '***' : 'not set',
      hasTurnServers: twilioTurnUrls.length > 0
    });
    console.log('Full ICE Server Configuration:', configuration.iceServers);
  }, [twilioTurnUrls, twilioUsername, twilioCredential]);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    }

    return () => {
      cleanupCall();
    };
  }, [isOpen]);

  // Listen for WebSocket messages for video call signaling
  useEffect(() => {
    if (!ws) return;

    const handleWebSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('VideoCall received WebSocket message:', data);
        
        // Only process video call messages if the component is open and ready
        if (!isOpen || !localStream || !isInitialized) {
          console.log('VideoCall component not ready, ignoring message:', data.type);
          return;
        }

        // Don't process incoming call offers in VideoCall component (handled by context)
        if (data.type === 'video-call-offer' && !currentCallInfo) {
          console.log('Ignoring incoming call offer in VideoCall component');
          return;
        }
        
        switch (data.type) {
          case 'video-call-offer':
            console.log('Handling video call offer');
            handleCallOffer(data);
            break;
          case 'video-call-answer':
            console.log('Handling video call answer');
            handleCallAnswer(data);
            break;
          case 'ice-candidate':
            console.log('Handling ICE candidate');
            handleIceCandidate(data);
            break;
          case 'video-call-rejected':
            console.log('Handling call rejected');
            handleCallRejected();
            break;
          case 'call-ended':
            console.log('Handling call ended');
            handleCallEnded();
            break;
          default:
            console.log('Unknown message type:', data.type);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.addEventListener('message', handleWebSocketMessage);

    return () => {
      ws.removeEventListener('message', handleWebSocketMessage);
    };
  }, [ws, isOpen, localStream, isInitialized]);

  const initializeCall = async () => {
    try {
      // Check if userDetails is available
      if (!userDetails || !userDetails._id) {
        console.error('User details not available');
        toast.error('User authentication required');
        return;
      }

      // Check if WebSocket is connected
      if (!ws) {
        console.error('WebSocket not initialized');
        toast.error('Connection not available');
        return;
      }

      if (ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected, state:', ws.readyState);
        toast.error('Connection not available. Please wait...');
        return;
      }

      console.log('WebSocket is connected, proceeding with video call setup');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      localStreamRef.current = stream; // Store in ref for immediate access
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('Local stream initialized successfully');
      setIsInitialized(true);

      // If this is an incoming call, process the offer after a short delay
      if (currentCallInfo && currentCallInfo.offer) {
        console.log('Processing incoming call offer after stream setup');
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          handleCallOffer({
            from: currentCallInfo.userId,
            offer: currentCallInfo.offer
          });
        }, 500);
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const startCall = async () => {
    try {
      // Check if userDetails is available
      if (!userDetails || !userDetails._id) {
        console.error('User details not available');
        toast.error('User authentication required');
        return;
      }

      // Check if local stream is available
      if (!localStreamRef.current) {
        console.error('Local stream not available');
        toast.error('Camera/microphone not available');
        return;
      }

      setCallStatus('calling');
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Generated ICE candidate:', {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address,
            port: event.candidate.port,
            usernameFragment: event.candidate.usernameFragment,
            candidate: event.candidate.candidate?.substring(0, 100) + '...' // Log first 100 chars
          });
          
          // Check if this is a TURN candidate
          if (event.candidate.candidate && event.candidate.candidate.includes('typ relay')) {
            console.log('🎯 TURN candidate generated successfully!');
          }
          
          sendMessage({
            type: 'ice-candidate',
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            },
            to: selectedUserId
          });
        } else {
          console.log('ICE candidate gathering completed');
          // Log final ICE gathering state
          peerConnection.getStats().then(stats => {
            let candidateCount = { host: 0, srflx: 0, relay: 0 };
            stats.forEach(report => {
              if (report.type === 'local-candidate') {
                if (report.candidateType === 'host') candidateCount.host++;
                else if (report.candidateType === 'srflx') candidateCount.srflx++;
                else if (report.candidateType === 'relay') candidateCount.relay++;
              }
            });
            console.log('Final ICE candidate counts:', candidateCount);
          });
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        setIceConnectionState(state);
        console.log('ICE connection state changed:', state);
        
        if (state === 'failed' || state === 'disconnected') {
          console.error('ICE connection failed or disconnected');
          console.log('Current TURN configuration:', {
            hasTurnServers: twilioTurnUrls.length > 0,
            turnUrls: twilioTurnUrls,
            hasCredentials: !!(twilioUsername && twilioCredential)
          });
          
          // Log current connection statistics for debugging
          if (peerConnection.getStats) {
            peerConnection.getStats().then(stats => {
              console.log('Connection statistics:', stats);
              stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'failed') {
                  console.error('Failed candidate pair:', report);
                }
              });
            }).catch(err => console.error('Error getting stats:', err));
          }
          
          if (state === 'failed' && retryCount < 3 && !isRetrying) {
            setIsRetrying(true);
            setRetryCount(prev => prev + 1);
            console.log(`Attempting to restart ICE (attempt ${retryCount + 1}/3)...`);
            
            setTimeout(() => {
              try {
                peerConnection.restartIce();
                toast.info(`Retrying connection... (${retryCount + 1}/3)`);
              } catch (error) {
                console.error('Failed to restart ICE:', error);
              }
              setIsRetrying(false);
            }, 2000);
          } else if (retryCount >= 3) {
            console.error('Connection failed after multiple attempts. TURN server may not be configured properly.');
            toast.error('Connection failed. Please check TURN server configuration.');
            cleanupCall();
            onClose();
          } else {
            toast.error('Connection lost. Please try again.');
          }
        } else if (state === 'connected' || state === 'completed') {
          console.log('ICE connection established successfully');
          setRetryCount(0);
          setIsRetrying(false);
        } else if (state === 'checking') {
          console.log('ICE connection checking - attempting to establish connection...');
          // Add a timeout for the checking state
          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'checking') {
              console.warn('ICE connection stuck in checking state for too long');
              toast.info('Connection taking longer than expected...');
            }
          }, 10000); // 10 second timeout
        }
      };

      // Handle peer connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setPeerConnectionState(state);
        console.log('Peer connection state changed:', state);
        
        if (state === 'failed') {
          console.error('Peer connection failed');
          toast.error('Call connection failed. Please try again.');
          cleanupCall();
          onClose();
        } else if (state === 'connected') {
          console.log('Peer connection established successfully');
          toast.success('Call connected!');
        }
      };

      // Handle signaling state changes
      peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state changed:', peerConnection.signalingState);
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        console.log('Remote stream tracks:', event.streams[0].getTracks());
        
        // Validate the remote stream
        if (!event.streams[0] || event.streams[0].getTracks().length === 0) {
          console.error('Invalid remote stream received');
          toast.error('Remote user has no camera/microphone access');
          return;
        }
        
        setRemoteStream(event.streams[0]);
        
        // Use setTimeout to ensure the video element is ready
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.load(); // Prepare the video for playback
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log('Set remote video srcObject');
            // Handle play promise
            const playPromise = remoteVideoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Playback started
                })
                .catch(e => {
                  console.error('Error playing remote video:', e);
                  if (e.name === 'AbortError') {
                    console.log('Video play was interrupted, this is normal during connection setup');
                  } else {
                    toast.error('Failed to display remote video');
                  }
                });
            }
          }
        }, 100);
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      console.log('Sending video call offer to:', selectedUserId);
      sendMessage({
        type: 'video-call-offer',
        offer,
        to: selectedUserId,
        from: userDetails._id,
        fromName: `${userDetails.firstName} ${userDetails.lastName}`
      });

    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
      setCallStatus('idle');
    }
  };

  const handleCallOffer = async (data) => {
    console.log('Received video call offer from:', data.from);
    try {
      // Check if local stream is available (use ref for immediate access)
      if (!localStreamRef.current) {
        console.error('Local stream not available for incoming call, waiting for stream...');
        // Wait for stream to be available
        let attempts = 0;
        while (!localStreamRef.current && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
          console.log(`Waiting for stream... attempt ${attempts}`);
        }
        
        if (!localStreamRef.current) {
          console.error('Local stream still not available after waiting');
          toast.error('Camera/microphone not available');
          return;
        }
      }

      setCallStatus('calling');
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Generated ICE candidate:', {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address,
            port: event.candidate.port,
            usernameFragment: event.candidate.usernameFragment,
            candidate: event.candidate.candidate?.substring(0, 100) + '...' // Log first 100 chars
          });
          
          // Check if this is a TURN candidate
          if (event.candidate.candidate && event.candidate.candidate.includes('typ relay')) {
            console.log('🎯 TURN candidate generated successfully!');
          }
          
          sendMessage({
            type: 'ice-candidate',
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            },
            to: data.from
          });
        } else {
          console.log('ICE candidate gathering completed');
          // Log final ICE gathering state
          peerConnection.getStats().then(stats => {
            let candidateCount = { host: 0, srflx: 0, relay: 0 };
            stats.forEach(report => {
              if (report.type === 'local-candidate') {
                if (report.candidateType === 'host') candidateCount.host++;
                else if (report.candidateType === 'srflx') candidateCount.srflx++;
                else if (report.candidateType === 'relay') candidateCount.relay++;
              }
            });
            console.log('Final ICE candidate counts:', candidateCount);
          });
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        setIceConnectionState(state);
        console.log('ICE connection state changed:', state);
        
        if (state === 'failed' || state === 'disconnected') {
          console.error('ICE connection failed or disconnected');
          console.log('Current TURN configuration:', {
            hasTurnServers: twilioTurnUrls.length > 0,
            turnUrls: twilioTurnUrls,
            hasCredentials: !!(twilioUsername && twilioCredential)
          });
          
          // Log current connection statistics for debugging
          if (peerConnection.getStats) {
            peerConnection.getStats().then(stats => {
              console.log('Connection statistics:', stats);
              stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'failed') {
                  console.error('Failed candidate pair:', report);
                }
              });
            }).catch(err => console.error('Error getting stats:', err));
          }
          
          if (state === 'failed' && retryCount < 3 && !isRetrying) {
            setIsRetrying(true);
            setRetryCount(prev => prev + 1);
            console.log(`Attempting to restart ICE (attempt ${retryCount + 1}/3)...`);
            
            setTimeout(() => {
              try {
                peerConnection.restartIce();
                toast.info(`Retrying connection... (${retryCount + 1}/3)`);
              } catch (error) {
                console.error('Failed to restart ICE:', error);
              }
              setIsRetrying(false);
            }, 2000);
          } else if (retryCount >= 3) {
            console.error('Connection failed after multiple attempts. TURN server may not be configured properly.');
            toast.error('Connection failed. Please check TURN server configuration.');
            cleanupCall();
            onClose();
          } else {
            toast.error('Connection lost. Please try again.');
          }
        } else if (state === 'connected' || state === 'completed') {
          console.log('ICE connection established successfully');
          setRetryCount(0);
          setIsRetrying(false);
        } else if (state === 'checking') {
          console.log('ICE connection checking - attempting to establish connection...');
          // Add a timeout for the checking state
          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'checking') {
              console.warn('ICE connection stuck in checking state for too long');
              toast.info('Connection taking longer than expected...');
            }
          }, 10000); // 10 second timeout
        }
      };

      // Handle peer connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setPeerConnectionState(state);
        console.log('Peer connection state changed:', state);
        
        if (state === 'failed') {
          console.error('Peer connection failed');
          toast.error('Call connection failed. Please try again.');
          cleanupCall();
          onClose();
        } else if (state === 'connected') {
          console.log('Peer connection established successfully');
          toast.success('Call connected!');
        }
      };

      // Handle signaling state changes
      peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state changed:', peerConnection.signalingState);
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        console.log('Remote stream tracks:', event.streams[0].getTracks());
        
        // Validate the remote stream
        if (!event.streams[0] || event.streams[0].getTracks().length === 0) {
          console.error('Invalid remote stream received');
          toast.error('Remote user has no camera/microphone access');
          return;
        }
        
        setRemoteStream(event.streams[0]);
      };

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log('Sending video call answer to:', data.from);
      sendMessage({
        type: 'video-call-answer',
        answer,
        to: data.from
      });

    } catch (error) {
      console.error('Error handling call offer:', error);
      toast.error('Failed to accept call');
    }
  };

  const handleCallAnswer = async (data) => {
    console.log('Received video call answer from:', data.from);
    try {
      if (!peerConnectionRef.current) {
        console.error('Peer connection not available');
        return;
      }
      const pc = peerConnectionRef.current;
      // Only set remote description if in the correct signaling state
      if (
        pc.signalingState === 'have-local-offer' &&
        data.answer && data.answer.type === 'answer'
      ) {
        await pc.setRemoteDescription(data.answer);
        setCallStatus('connected');
        setIsCallActive(true);
        console.log('Video call connected successfully');
      } else {
        console.warn(
          `Skipping setRemoteDescription: signalingState=${pc.signalingState}, answerType=${data.answer?.type}`
        );
      }
    } catch (error) {
      console.error('Error handling call answer:', error);
    }
  };

  const handleCallAccepted = () => {
    setCallStatus('connected');
    setIsCallActive(true);
  };

  const handleCallRejected = (data) => {
    console.log('Call was rejected:', data);
    setCallStatus('idle');
    const message = data?.message || 'Call was rejected';
    toast.error(message);
    cleanupCall();
    onClose();
  };

  const handleCallEnded = () => {
    setCallStatus('idle');
    setIsCallActive(false);
    cleanupCall();
  };

  const handleIceCandidate = async (data) => {
    try {
      console.log('Received ICE candidate from:', data.from);
      
      if (peerConnectionRef.current && data.candidate) {
        // Reconstruct the RTCIceCandidate object from the received data
        const candidate = new RTCIceCandidate({
          candidate: data.candidate.candidate,
          sdpMid: data.candidate.sdpMid,
          sdpMLineIndex: data.candidate.sdpMLineIndex
        });
        
        console.log('Reconstructed ICE candidate:', {
          type: candidate.type,
          protocol: candidate.protocol,
          address: candidate.address,
          port: candidate.port,
          candidate: candidate.candidate
        });
        
        await peerConnectionRef.current.addIceCandidate(candidate);
        console.log('ICE candidate added successfully');
      } else {
        console.error('Peer connection not available for ICE candidate or candidate data missing');
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const endCall = () => {
    if (selectedUserId) {
      sendMessage({
        type: 'end-call',
        to: selectedUserId
      });
    }
    cleanupCall();
    onClose();
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setCallStatus('idle');
    setIsInitialized(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
        setIsScreenSharing(true);
        screenTrack.onended = async () => {
          // Switch back to camera
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const cameraTrack = cameraStream.getVideoTracks()[0];
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
          setIsScreenSharing(false);
        };
      } else {
        // Stop screen sharing, switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        const playPromise = remoteVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error('Error playing remote video:', e);
            if (e.name === 'AbortError') {
              console.log('Video play was interrupted, this is normal during connection setup');
            } else {
              toast.error('Failed to display remote video');
            }
          });
        }
      }
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">
            {callStatus === 'calling' ? `Calling ${selectedUserName}...` : 
             callStatus === 'connected' ? `Call with ${selectedUserName}` : 
             'Video Call'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden mb-4">
          {/* Remote Video */}
          {callStatus === 'connected' && remoteStream && remoteStream.getTracks().length > 0 ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-white">Remote Video Off</span>
            </div>
          )}
          
          {/* Local Video */}
          <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center">
            {isVideoOff ? (
              <span className="text-white">Video Off</span>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Video Status Indicators */}
          {!remoteStream && callStatus === 'connected' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Connecting video...</p>
                <p className="text-sm text-gray-300 mt-2">Make sure the other user has granted camera/microphone access</p>
              </div>
            </div>
          )}

          {/* No Remote Video Indicator */}
          {callStatus === 'connected' && remoteStream && remoteStream.getTracks().length === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-semibold">No Video Available</p>
                <p className="text-sm text-gray-300 mt-2">The other user may not have granted camera access</p>
              </div>
            </div>
          )}

          {/* Call Status Overlay */}
          {callStatus === 'calling' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Calling {selectedUserName}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {callStatus === 'idle' && !currentCallInfo && (
            <button
              onClick={startCall}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>Start Call</span>
            </button>
          )}

          {callStatus === 'idle' && currentCallInfo && (
            <div className="text-white text-center">
              <p>Processing incoming call...</p>
            </div>
          )}

          {callStatus === 'connected' && (
            <>
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'} hover:bg-opacity-80`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {isMuted ? (
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-600'} hover:bg-opacity-80`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {isVideoOff ? (
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  ) : (
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-opacity-80`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>

              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-full"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Additional Controls */}
        <div className="flex gap-4 justify-center my-4">
          <button onClick={toggleMute} className="px-4 py-2 bg-gray-700 text-white rounded">
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={toggleVideo} className="px-4 py-2 bg-gray-700 text-white rounded">
            {isVideoOff ? 'Show Video' : 'Hide Video'}
          </button>
          <button onClick={toggleScreenShare} className="px-4 py-2 bg-gray-700 text-white rounded">
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </button>
        </div>

        {/* Connection Status */}
        <div className="text-center mb-4">
          <div className="text-sm text-gray-300">
            ICE: {iceConnectionState} | Peer: {peerConnectionState}
            {retryCount > 0 && <span className="ml-2">| Retries: {retryCount}/3</span>}
          </div>
          {isRetrying && (
            <div className="text-yellow-400 text-sm mt-1">
              Retrying connection...
            </div>
          )}
          {(iceConnectionState === 'failed' || peerConnectionState === 'failed') && (
            <div className="text-red-400 text-sm mt-1">
              Connection failed. Please check your network and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 