# 🎥 Video Call Feature Setup Guide

## **Overview**
This guide explains how to set up and use the video call feature in your Swift-Chat application.

## **Features Included**
- ✅ **Peer-to-Peer Video Calls** - Direct connection between users
- ✅ **Audio/Video Controls** - Mute, video toggle, screen sharing
- ✅ **Incoming Call Notifications** - Accept/reject calls
- ✅ **Call Management** - Start, end, and handle calls
- ✅ **Real-time Signaling** - WebRTC coordination via Socket.IO

## **Technology Stack**
- **WebRTC** - For peer-to-peer communication
- **Socket.IO** - For signaling and call coordination
- **React** - UI components and state management

## **Installation Steps**

### **1. Install Dependencies**

#### **Frontend (Vercel)**
```bash
cd frontend
npm install socket.io-client simple-peer
```

#### **Backend (Render)**
```bash
cd server
npm install socket.io
```

### **2. Environment Variables**

#### **Backend (Render)**
Add these to your existing environment variables:
```env
# Video Call Settings
VIDEO_CALL_ENABLED=true
STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
```

#### **Frontend (Vercel)**
Your existing environment variables should work:
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=wss://your-backend.onrender.com
VITE_NODE_ENV=production
```

## **How to Use**

### **Starting a Video Call**
1. **Navigate to a chat** with another user
2. **Click the video call button** (📹) in the top bar
3. **Wait for the other user to accept** the call
4. **Use the controls** to manage your call:
   - 🎤 Mute/Unmute audio
   - 📹 Turn video on/off
   - 🖥️ Share screen
   - 📞 End call

### **Receiving a Video Call**
1. **You'll see an incoming call notification**
2. **Click "Accept"** to join the call
3. **Click "Reject"** to decline
4. **The call will auto-reject after 30 seconds** if not answered

### **During a Call**
- **Local video** appears in the top-right corner
- **Remote video** fills the main screen
- **Controls** are at the bottom of the screen
- **Screen sharing** replaces your camera with your screen

## **File Structure**

```
frontend/src/
├── components/video/
│   ├── VideoCall.jsx          # Main video call interface
│   ├── VideoCallButton.jsx    # Button to start calls
│   └── IncomingCall.jsx       # Incoming call notification
├── context/
│   └── videoCallContext.jsx   # Global video call state
└── public/
    └── ringtone.mp3           # Incoming call sound

server/
├── videoCallServer.js         # Socket.IO server for signaling
└── index.js                   # Updated to include video server
```

## **Technical Details**

### **WebRTC Flow**
1. **Caller** creates peer connection and offer
2. **Signaling server** relays offer to callee
3. **Callee** creates answer and sends back
4. **ICE candidates** are exchanged for connection
5. **Direct peer-to-peer** connection established

### **Socket.IO Events**
- `call-offer` - Send call offer
- `call-answer` - Send call answer
- `ice-candidate` - Exchange ICE candidates
- `call-accepted` - Call accepted notification
- `call-rejected` - Call rejected notification
- `end-call` - End call signal

### **Security Features**
- **JWT Authentication** - Only authenticated users can make calls
- **CORS Protection** - Secure cross-origin requests
- **HTTPS Required** - Secure connections in production

## **Troubleshooting**

### **Common Issues**

#### **1. Camera/Microphone Access**
- **Issue**: "Failed to access camera/microphone"
- **Solution**: Check browser permissions and HTTPS requirement

#### **2. Call Connection Issues**
- **Issue**: Calls not connecting
- **Solution**: Check STUN servers and firewall settings

#### **3. Audio/Video Quality**
- **Issue**: Poor call quality
- **Solution**: Check internet connection and device capabilities

#### **4. Screen Sharing Not Working**
- **Issue**: Screen share button not working
- **Solution**: Ensure browser supports `getDisplayMedia()`

### **Browser Compatibility**
- ✅ **Chrome** - Full support
- ✅ **Firefox** - Full support
- ✅ **Safari** - Full support
- ✅ **Edge** - Full support

### **Mobile Support**
- ✅ **iOS Safari** - Supported
- ✅ **Android Chrome** - Supported
- ⚠️ **Mobile limitations** - May have reduced features

## **Performance Optimization**

### **Bandwidth Management**
- **Adaptive bitrate** - Automatically adjusts quality
- **Video constraints** - Optimized for chat calls
- **Audio optimization** - Echo cancellation enabled

### **Resource Usage**
- **Memory efficient** - Streams are properly cleaned up
- **CPU optimized** - Hardware acceleration when available
- **Battery friendly** - Efficient encoding/decoding

## **Future Enhancements**

### **Planned Features**
- 🎯 **Group Video Calls** - Multiple participants
- 🎯 **Call Recording** - Save call sessions
- 🎯 **Call History** - Track call logs
- 🎯 **Background Blur** - Privacy enhancement
- 🎯 **Virtual Backgrounds** - Custom backgrounds

### **Advanced Features**
- 🎯 **Call Analytics** - Quality metrics
- 🎯 **Bandwidth Control** - Manual quality settings
- 🎯 **Call Scheduling** - Pre-scheduled calls
- 🎯 **Integration APIs** - Third-party integrations

## **Deployment Notes**

### **Production Considerations**
1. **HTTPS Required** - WebRTC needs secure context
2. **STUN/TURN Servers** - For NAT traversal
3. **Bandwidth Limits** - Monitor server usage
4. **Scalability** - Consider load balancing for signaling

### **Monitoring**
- **Call Quality Metrics** - Track connection success rates
- **Server Performance** - Monitor Socket.IO server load
- **User Experience** - Gather feedback on call quality

## **Support**

If you encounter issues:
1. **Check browser console** for errors
2. **Verify environment variables** are set correctly
3. **Test with different browsers** to isolate issues
4. **Check network connectivity** and firewall settings

---

**🎉 Your video call feature is now ready to use!** 