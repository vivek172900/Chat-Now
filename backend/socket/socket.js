const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // 🔐 JWT AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
      if (!secret) {
        console.error('Socket auth error: JWT secret not configured');
        return next(new Error('Invalid token'));
      }

      const decoded = jwt.verify(token, secret);

      if (!decoded?.userId) {
        return next(new Error("Invalid token payload"));
      }

      const user = await User.findById(decoded.userId).select("_id");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("🟢 Socket connected:", socket.userId);

    // Mark user online
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Personal room
    socket.join(`user_${socket.userId}`);

    // Join chat rooms
    const chats = await Chat.find({
      participants: socket.userId,
    }).select("_id");

    chats.forEach((chat) => {
      socket.join(`chat_${chat._id}`);
    });

    // 🔹 JOIN CHAT
    socket.on("join_chat", ({ chatId }) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(`chat_${chatId}`);
    });

    // 💬 SEND MESSAGE
    socket.on("send_message", ({ chatId, message }) => {
      socket.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message,
        senderId: socket.userId,
      });
    });

    // 👀 READ RECEIPT
    socket.on("mark_as_read", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const already = message.readBy.some(r => r.user.toString() === socket.userId.toString());
        if (!already) {
          message.readBy.push({ user: socket.userId, readAt: new Date() });
          message.status = 'seen';
          await message.save();

          socket.broadcast.emit("message_read", {
            messageId,
            readBy: socket.userId,
          });
        }
      } catch (err) {
        console.error('mark_as_read socket error:', err.message);
      }
    });

    // DELIVERY ACK (clients should emit when they receive a new_message in real-time)
    socket.on('message_delivered', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // don't mark sender's own receipt
        if (message.sender && message.sender.toString() === socket.userId.toString()) return;

        // only update if not already seen
        if (message.status !== 'seen') {
          message.status = 'delivered';
          await message.save();

          // notify chat that message was delivered
          io.to(`chat_${message.chat}`).emit('message_delivered', { messageId, deliveredBy: socket.userId });
        }
      } catch (err) {
        console.error('message_delivered socket error:', err.message);
      }
    });

    // ✍️ TYPING
    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("typing_indicator", {
        chatId,
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      console.log("🔴 Socket disconnected:", socket.userId);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIO };










// const socketIO = require('socket.io');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const SocketSession = require('../models/SocketSession.js');
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');

// let io;

// const initializeSocket = (server) => {
//   io = socketIO(server, {
//     cors: {
//       origin: process.env.FRONTEND_URL || "http://localhost:3000",
//       credentials: true
//     }
//   });

//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
      
//       if (!token) {
//         return next(new Error('Authentication error: No token provided'));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);
      
//       if (!user) {
//         return next(new Error('Authentication error: User not found'));
//       }

//       socket.userId = user._id;
//       socket.user = user;
//       next();
//     } catch (error) {
//       next(new Error('Authentication error: Invalid token'));
//     }
//   });

//   io.on('connection', async (socket) => {
//     console.log(`✅ User connected: ${socket.userId}`);
    
//     try {
//       await User.findByIdAndUpdate(socket.userId, {
//         isOnline: true,
//         lastSeen: new Date()
//       });

//       await SocketSession.findOneAndUpdate(
//         { user: socket.userId },
//         {
//           socketId: socket.id,
//           connectedAt: new Date()
//         },
//         { upsert: true, new: true }
//       );

//       socket.join(`user_${socket.userId}`);

//       const userChats = await Chat.find({ participants: socket.userId });
//       userChats.forEach(chat => {
//         socket.join(`chat_${chat._id}`);
//       });

//       socket.broadcast.emit('user_status_change', {
//         userId: socket.userId,
//         isOnline: true,
//         lastSeen: new Date()
//       });

//       socket.on('send_message', async (data) => {
//         try {
//           const { chatId, content, messageType = 'text', mediaUrl } = data;
          
//           const chat = await Chat.findById(chatId);
//           if (!chat || !chat.participants.includes(socket.userId)) {
//             socket.emit('message_error', { error: 'Not authorized' });
//             return;
//           }
          
//           const message = new Message({
//             sender: socket.userId,
//             chat: chatId,
//             content,
//             messageType,
//             mediaUrl,
//             status: 'sent'
//           });

//           await message.save();

//           await Chat.findByIdAndUpdate(chatId, {
//             latestMessage: message._id,
//             updatedAt: new Date()
//           });

//           const populatedMessage = await Message.findById(message._id)
//             .populate('sender', '-__v -createdAt -updatedAt');

//           socket.to(`chat_${chatId}`).emit('new_message', {
//             message: populatedMessage,
//             chatId
//           });

//           socket.emit('message_sent', {
//             message: populatedMessage,
//             chatId
//           });

//           const participants = chat.participants.filter(
//             p => p.toString() !== socket.userId.toString()
//           );
          
//           for (const participantId of participants) {
//             const participantSession = await SocketSession.findOne({ 
//               user: participantId 
//             });
            
//             if (!participantSession) {
//               io.to(`user_${participantId}`).emit('message_notification', {
//                 message: populatedMessage,
//                 chatId
//               });
//             }
//           }

//         } catch (error) {
//           console.error('Socket send message error:', error);
//           socket.emit('message_error', { error: error.message });
//         }
//       });

//       socket.on('mark_as_read', async (data) => {
//         try {
//           const { messageId } = data;
          
//           const message = await Message.findById(messageId);
//           if (!message) return;

//           const chat = await Chat.findById(message.chat);
//           if (!chat.participants.includes(socket.userId)) return;

//           const alreadyRead = message.readBy.some(read => 
//             read.user.toString() === socket.userId.toString()
//           );

//           if (!alreadyRead) {
//             message.readBy.push({
//               user: socket.userId,
//               readAt: new Date()
//             });

//             const participants = chat.participants.filter(
//               participant => participant.toString() !== message.sender.toString()
//             );

//             if (message.readBy.length >= participants.length) {
//               message.status = 'seen';
//             } else {
//               message.status = 'delivered';
//             }

//             await message.save();

//             io.to(`chat_${message.chat}`).emit('message_read', {
//               messageId,
//               readBy: socket.userId,
//               status: message.status
//             });
//           }
//         } catch (error) {
//           console.error('Socket mark as read error:', error);
//         }
//       });

//       socket.on('typing', async (data) => {
//         try {
//           const { chatId, isTyping } = data;
          
//           socket.to(`chat_${chatId}`).emit('typing_indicator', {
//             userId: socket.userId,
//             chatId,
//             isTyping,
//             timestamp: new Date()
//           });
//         } catch (error) {
//           console.error('Socket typing error:', error);
//         }
//       });

//       socket.on('call_initiate', (data) => {
//         const { callId, chatId, receiverIds } = data;
        
//         if (receiverIds && Array.isArray(receiverIds)) {
//           receiverIds.forEach(receiverId => {
//             io.to(`user_${receiverId}`).emit('incoming_call', {
//               callId,
//               callerId: socket.userId,
//               timestamp: new Date()
//             });
//           });
//         }
//       });

//       socket.on('call_accept', (data) => {
//         const { callId, chatId } = data;
        
//         socket.to(`chat_${chatId}`).emit('call_accepted', {
//           callId,
//           acceptorId: socket.userId,
//           timestamp: new Date()
//         });
//       });

//       socket.on('call_end', (data) => {
//         const { callId, chatId } = data;
        
//         io.to(`chat_${chatId}`).emit('call_ended', {
//           callId,
//           endedBy: socket.userId,
//           timestamp: new Date()
//         });
//       });

//       socket.on('disconnect', async () => {
//         console.log(`❌ User disconnected: ${socket.userId}`);
        
//         try {
//           await User.findByIdAndUpdate(socket.userId, {
//             isOnline: false,
//             lastSeen: new Date()
//           });

//           await SocketSession.findOneAndDelete({ socketId: socket.id });

//           socket.broadcast.emit('user_status_change', {
//             userId: socket.userId,
//             isOnline: false,
//             lastSeen: new Date()
//           });
//         } catch (error) {
//           console.error('Disconnect error:', error);
//         }
//       });

//     } catch (error) {
//       console.error('Socket connection error:', error);
//       socket.disconnect();
//     }
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized');
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIO };