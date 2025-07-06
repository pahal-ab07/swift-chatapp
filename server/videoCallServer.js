const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const createVideoCallServer = (server) => {
  const io = new Server(server, {
    path: '/video-socket.io',
    cors: {
      origin: process.env.BASE_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store connected users for video calls
  const videoUsers = new Map();

  // Middleware to authenticate video call users
  io.use((socket, next) => {
    console.log('Video call authentication attempt');
    
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('authToken=')[1]?.split(';')[0];
    
    if (!token) {
      console.error('No token provided for video call');
      return next(new Error('Authentication error: No token'));
    }

    console.log('Token found, verifying...');

    jwt.verify(token, process.env.JWTPRIVATEKEY || process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return next(new Error('Authentication error: Invalid token'));
      }
      
      console.log('JWT verified successfully for user:', decoded._id);
      socket.userId = decoded._id;
      socket.userName = `${decoded.firstName} ${decoded.lastName}`;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`Video user connected: ${socket.userName} (${socket.userId})`);

    // Store user info
    videoUsers.set(socket.userId, {
      socketId: socket.id,
      userName: socket.userName
    });

    // Emit user online for video calls
    socket.emit('video-user-online', {
      userId: socket.userId,
      username: socket.userName
    });

    // Handle call offer
    socket.on('call-offer', (data) => {
      console.log(`Call offer from ${socket.userName} to ${data.to}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('call-offer', {
          offer: data.offer,
          from: socket.userId,
          fromName: socket.userName
        });
      } else {
        socket.emit('call-rejected', { message: 'User is not available' });
      }
    });

    // Handle call answer
    socket.on('call-answer', (data) => {
      console.log(`Call answer from ${socket.userName} to ${data.to}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('call-answer', {
          answer: data.answer,
          from: socket.userId
        });
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
      console.log(`ICE candidate from ${socket.userName} to ${data.to}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('ice-candidate', {
          candidate: data.candidate,
          from: socket.userId
        });
      }
    });

    // Handle call acceptance
    socket.on('call-accepted', (data) => {
      console.log(`Call accepted by ${socket.userName}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('call-accepted', {
          from: socket.userId
        });
      }
    });

    // Handle call rejection
    socket.on('call-rejected', (data) => {
      console.log(`Call rejected by ${socket.userName}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('call-rejected', {
          from: socket.userId,
          message: data.message || 'Call was rejected'
        });
      }
    });

    // Handle call end
    socket.on('end-call', (data) => {
      console.log(`Call ended by ${socket.userName}`);
      
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('call-ended', {
          from: socket.userId
        });
      }
    });

    // Handle user typing (optional - for chat integration)
    socket.on('typing', (data) => {
      const targetUser = videoUsers.get(data.to);
      if (targetUser) {
        socket.to(targetUser.socketId).emit('typing', {
          from: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Video user disconnected: ${socket.userName} (${socket.userId})`);
      videoUsers.delete(socket.userId);
      
      // Notify other users
      socket.broadcast.emit('video-user-offline', {
        userId: socket.userId
      });
    });
  });

  return io;
};

module.exports = createVideoCallServer; 