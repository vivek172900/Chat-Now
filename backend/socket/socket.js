const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SocketSession = require('../models/SocketSession.js');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);
    
    try {
      // Update user online status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Store socket session
      await SocketSession.findOneAndUpdate(
        { user: socket.userId },
        {
          socketId: socket.id,
          connectedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Join user's personal room
      socket.join(`user_${socket.userId}`);

      // Get user's chat rooms and join them
      const userChats = await Chat.find({ participants: socket.userId });
      userChats.forEach(chat => {
        socket.join(`chat_${chat._id}`);
      });

      // Notify others about user's online status
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        isOnline: true,
        lastSeen: new Date()
      });

      // Handle messaging
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, messageType = 'text', mediaUrl } = data;
          
          // Verify user is part of chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            socket.emit('message_error', { error: 'Not authorized' });
            return;
          }
          
          // Create message in database
          const message = new Message({
            sender: socket.userId,
            chat: chatId,
            content,
            messageType,
            mediaUrl,
            status: 'sent'
          });

          await message.save();

          // Update chat's latest message
          await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message._id,
            updatedAt: new Date()
          });

          // Populate message with sender info
          const populatedMessage = await Message.findById(message._id)
            .populate('sender', '-__v -createdAt -updatedAt');

          // Emit to ALL participants in the chat (including sender)
          io.to(`chat_${chatId}`).emit('new_message', {
            message: populatedMessage,
            chatId
          });

          // Send notification to offline participants (except sender)
          const participants = chat.participants.filter(
            p => p.toString() !== socket.userId.toString()
          );
          
          for (const participantId of participants) {
            const participantSession = await SocketSession.findOne({ 
              user: participantId 
            });
            
            // Only notify if user is offline or not connected
            if (!participantSession) {
              io.to(`user_${participantId}`).emit('message_notification', {
                message: populatedMessage,
                chatId
              });
            }
          }

        } catch (error) {
          console.error('Socket send message error:', error);
          socket.emit('message_error', { error: error.message });
        }
      });

      // Handle message read
      socket.on('mark_as_read', async (data) => {
        try {
          const { messageId } = data;
          
          const message = await Message.findById(messageId);
          if (!message) return;

          // Check if user is part of the chat
          const chat = await Chat.findById(message.chat);
          if (!chat.participants.includes(socket.userId)) return;

          // Check if already read
          const alreadyRead = message.readBy.some(read => 
            read.user.toString() === socket.userId.toString()
          );

          if (!alreadyRead) {
            message.readBy.push({
              user: socket.userId,
              readAt: new Date()
            });

            // Update status
            const participants = chat.participants.filter(
              participant => participant.toString() !== message.sender.toString()
            );

            if (message.readBy.length >= participants.length) {
              message.status = 'seen';
            } else {
              message.status = 'delivered';
            }

            await message.save();

            // Notify sender and all participants
            io.to(`chat_${message.chat}`).emit('message_read', {
              messageId,
              readBy: socket.userId,
              status: message.status
            });
          }
        } catch (error) {
          console.error('Socket mark as read error:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing', async (data) => {
        try {
          const { chatId, isTyping } = data;
          
          // Notify other participants in the chat (not the sender)
          socket.to(`chat_${chatId}`).emit('typing_indicator', {
            userId: socket.userId,
            chatId,
            isTyping,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Socket typing error:', error);
        }
      });

      // Handle call events
      socket.on('call_initiate', (data) => {
        const { callId, chatId, receiverIds } = data;
        
        // Notify receivers about incoming call
        if (receiverIds && Array.isArray(receiverIds)) {
          receiverIds.forEach(receiverId => {
            io.to(`user_${receiverId}`).emit('incoming_call', {
              callId,
              callerId: socket.userId,
              timestamp: new Date()
            });
          });
        }
      });

      socket.on('call_accept', (data) => {
        const { callId, chatId } = data;
        
        // Notify caller that call was accepted
        socket.to(`chat_${chatId}`).emit('call_accepted', {
          callId,
          acceptorId: socket.userId,
          timestamp: new Date()
        });
      });

      socket.on('call_end', (data) => {
        const { callId, chatId } = data;
        
        // Notify all participants that call ended
        io.to(`chat_${chatId}`).emit('call_ended', {
          callId,
          endedBy: socket.userId,
          timestamp: new Date()
        });
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
        
        try {
          // Update user online status
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });

          // Remove socket session
          await SocketSession.findOneAndDelete({ socketId: socket.id });

          // Notify others about user's offline status
          socket.broadcast.emit('user_status_change', {
            userId: socket.userId,
            isOnline: false,
            lastSeen: new Date()
          });
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };