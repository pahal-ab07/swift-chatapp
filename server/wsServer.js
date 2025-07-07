const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const { User } = require("./models/userModel");

const createWebSocketServer = (server) => {
  const wss = new ws.WebSocketServer({ server });

  // Store connected users for video calls
  const videoUsers = new Map();

  wss.on("connection", (connection, req) => {
    const notifyAboutOnlinePeople = async () => {
      const onlineUsers = await Promise.all(
        Array.from(wss.clients).map(async (client) => {
          const { userId, username } = client;
          const user = await User.findById(userId);
          const avatarLink = user ? user.avatarLink : null;

          return {
            userId,
            username,
            avatarLink,
          };
        })
      );

      [...wss.clients].forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'online-users',
            online: onlineUsers,
          })
        );
      });
    };

    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlinePeople();
        console.log("dead");
      }, 1000);
    }, 5000);

    connection.on("pong", () => {
      clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;

    if (cookies) {
      const tokenString = cookies
        .split(";")
        .find((str) => str.startsWith("authToken="));

      if (tokenString) {
        const token = tokenString.split("=")[1];
        jwt.verify(token, process.env.JWTPRIVATEKEY, {}, (err, userData) => {
          if (err) console.log(err);

          const { _id, firstName, lastName } = userData;
          connection.userId = _id;
          connection.username = `${firstName} ${lastName}`;
          
          // Store user for video calls
          videoUsers.set(_id, {
            socketId: connection,
            userName: `${firstName} ${lastName}`
          });

          console.log('Server: User connected for video calls:', _id, `${firstName} ${lastName}`);
          console.log('Server: Total video users:', videoUsers.size);

          // Notify user is online for video calls
          connection.send(JSON.stringify({
            type: 'video-user-online',
            userId: _id,
            username: `${firstName} ${lastName}`
          }));
        });
      }
    }

    connection.on("message", async (message) => {
      try {
        const messageData = JSON.parse(message.toString());
        
        // Handle different message types
        if (messageData.type === 'video-call-offer') {
          console.log('Server: Handling video call offer from', connection.userId, 'to', messageData.to);
          console.log('Server: Available video users:', Array.from(videoUsers.keys()));
          
          // Handle video call offer
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            console.log('Server: Target user found, sending video call offer');
            targetUser.socketId.send(JSON.stringify({
              type: 'video-call-offer',
              offer: messageData.offer,
              from: connection.userId,
              fromName: connection.username
            }));
          } else {
            console.log('Server: Target user not found or not connected');
            console.log('Server: Target user ID:', messageData.to);
            console.log('Server: Target user in map:', targetUser);
            
            // Notify caller that target is not available
            connection.send(JSON.stringify({
              type: 'video-call-rejected',
              from: messageData.to,
              message: 'User is not available'
            }));
          }
        } else if (messageData.type === 'video-call-answer') {
          console.log('Server: Handling video call answer from', connection.userId, 'to', messageData.to);
          // Handle video call answer
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            console.log('Server: Sending video call answer to target user');
            targetUser.socketId.send(JSON.stringify({
              type: 'video-call-answer',
              answer: messageData.answer,
              from: connection.userId
            }));
          } else {
            console.log('Server: Target user not found for answer');
          }
        } else if (messageData.type === 'ice-candidate') {
          console.log('Server: Handling ICE candidate from', connection.userId, 'to', messageData.to);
          // Handle ICE candidate
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            console.log('Server: Sending ICE candidate to target user');
            targetUser.socketId.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: messageData.candidate,
              from: connection.userId
            }));
          } else {
            console.log('Server: Target user not found for ICE candidate');
          }
        } else if (messageData.type === 'video-call-rejected') {
          // Handle call rejection
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            targetUser.socketId.send(JSON.stringify({
              type: 'video-call-rejected',
              from: connection.userId,
              message: messageData.message || 'Call was rejected'
            }));
          }
        } else if (messageData.type === 'end-call') {
          // Handle call end
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            targetUser.socketId.send(JSON.stringify({
              type: 'call-ended',
              from: connection.userId
            }));
          }
        } else if (messageData.type === 'call-invite') {
          // Forward call-invite to the target user for PeerJS
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            targetUser.socketId.send(JSON.stringify({
              type: 'call-invite',
              from: connection.userId,
              fromName: connection.username,
              peerId: messageData.peerId
            }));
          } else {
            // Optionally notify the caller that the user is not available
            connection.send(JSON.stringify({
              type: 'video-call-rejected',
              from: messageData.to,
              message: 'User is not available'
            }));
          }
        } else if (messageData.type === 'peer-ready') {
          // Forward peer-ready to the intended caller
          const targetUser = videoUsers.get(messageData.to);
          if (targetUser && targetUser.socketId) {
            targetUser.socketId.send(JSON.stringify({
              type: 'peer-ready',
              peerId: messageData.peerId
            }));
          }
        } else {
          // Handle regular chat messages
          const { recipient, text } = messageData;
          const msgDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text,
          });

          if (recipient && text) {
            [...wss.clients].forEach((client) => {
              if (client.userId === recipient || client.userId === connection.userId) {
                client.send(
                  JSON.stringify({
                    type: 'chat-message',
                    sender: connection.userId,
                    recipient,
                    text,
                    id: msgDoc._id,
                  })
                );
              }
            });
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    connection.on("close", () => {
      // Remove user from video users when they disconnect
      if (connection.userId) {
        videoUsers.delete(connection.userId);
      }
      notifyAboutOnlinePeople();
    });

    notifyAboutOnlinePeople();
  });
};

module.exports = createWebSocketServer;