const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { getIO } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = "text", mediaUrl, clientId } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const message = await Message.create({
      sender: userId,
      chat: chatId,
      content,
      messageType,
      mediaUrl,
      status: "sent",
    });

    chat.latestMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePic");

    // 🔥 SOCKET EMIT - include optional clientId so sender can correlate optimistic message
    const io = getIO();
    io.to(`chat_${chatId}`).emit("new_message", {
      chatId,
      message: populatedMessage,
      clientId: clientId || null,
    });

    res.status(201).json({ success: true, message: populatedMessage, clientId: clientId || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const alreadyRead = message.readBy.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({ user: userId, readAt: new Date() });
      await message.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Not found" });

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    message.content = "This message was deleted";
    await message.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getChatMessages,
  markAsRead,
  deleteMessage,
};

























// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const User = require('../models/User');

// const sendMessage = async (req, res) => {
//   try {
//     const { chatId, content, messageType = 'text', mediaUrl } = req.body;
//     const currentUser = req.user;

//     if (!chatId || (!content && !mediaUrl)) {
//       return res.status(400).json({ success: false, error: 'Chat ID and content/media are required' });
//     }

//     // Check if user is part of the chat
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     if (!chat.participants.includes(currentUser._id)) {
//       return res.status(403).json({ success: false, error: 'You are not a participant of this chat' });
//     }

//     // Create message
//     const message = new Message({
//       sender: currentUser._id,
//       chat: chatId,
//       content,
//       messageType,
//       mediaUrl,
//       status: 'sent'
//     });

//     await message.save();

//     // Update chat's latest message
//     chat.latestMessage = message._id;
//     await chat.save();

//     // Populate sender info
//     const populatedMessage = await Message.findById(message._id)
//       .populate('sender', '-__v -createdAt -updatedAt')
//       .populate('chat');

//     res.status(201).json({
//       success: true,
//       message: populatedMessage
//     });
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const getChatMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const currentUser = req.user;
//     const { page = 1, limit = 50 } = req.query;

//     // Check if user is part of the chat
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     if (!chat.participants.includes(currentUser._id)) {
//       return res.status(403).json({ success: false, error: 'You are not a participant of this chat' });
//     }

//     const skip = (page - 1) * limit;

//     const messages = await Message.find({ chat: chatId })
//       .populate('sender', '-__v -createdAt -updatedAt')
//       .populate('readBy.user', '-__v -createdAt -updatedAt')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalMessages = await Message.countDocuments({ chat: chatId });

//     res.json({
//       success: true,
//       messages: messages.reverse(), // Return in chronological order
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: totalMessages,
//         pages: Math.ceil(totalMessages / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get chat messages error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const markAsRead = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const currentUser = req.user;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ success: false, error: 'Message not found' });
//     }

//     // Check if user is part of the chat
//     const chat = await Chat.findById(message.chat);
//     if (!chat.participants.includes(currentUser._id)) {
//       return res.status(403).json({ success: false, error: 'You are not a participant of this chat' });
//     }

//     // Check if already read
//     const alreadyRead = message.readBy.some(read => 
//       read.user.toString() === currentUser._id.toString()
//     );

//     if (!alreadyRead) {
//       message.readBy.push({
//         user: currentUser._id,
//         readAt: new Date()
//       });

//       // Update message status if all participants have read it
//       const participants = chat.participants.filter(
//         participant => participant.toString() !== message.sender.toString()
//       );

//       if (message.readBy.length >= participants.length) {
//         message.status = 'seen';
//       } else {
//         message.status = 'delivered';
//       }

//       await message.save();
//     }

//     res.json({
//       success: true,
//       message
//     });
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const currentUser = req.user;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ success: false, error: 'Message not found' });
//     }

//     // Check if user is the sender
//     if (message.sender.toString() !== currentUser._id.toString()) {
//       return res.status(403).json({ success: false, error: 'You can only delete your own messages' });
//     }

//     // Soft delete by clearing content
//     message.content = 'This message was deleted';
//     message.mediaUrl = null;
//     message.messageType = 'text';
//     message.isDeleted = true;

//     await message.save();

//     res.json({
//       success: true,
//       message: 'Message deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete message error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// module.exports = {
//   sendMessage,
//   getChatMessages,
//   markAsRead,
//   deleteMessage
// };