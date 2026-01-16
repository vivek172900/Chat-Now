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
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.join(`user_${socket.userId}`);

    const chats = await Chat.find({
      participants: socket.userId,
    }).select("_id");

    chats.forEach((chat) => {
      socket.join(`chat_${chat._id}`);
    });

    socket.on("join_chat", ({ chatId }) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(`chat_${chatId}`);
    });

    socket.on("send_message", ({ chatId, message }) => {
      socket.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message,
        senderId: socket.userId,
      });
    });

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

    socket.on('message_delivered', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.sender && message.sender.toString() === socket.userId.toString()) return;

        if (message.status !== 'seen') {
          message.status = 'delivered';
          await message.save();

          io.to(`chat_${message.chat}`).emit('message_delivered', { messageId, deliveredBy: socket.userId });
        }
      } catch (err) {
        console.error('message_delivered socket error:', err.message);
      }
    });

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