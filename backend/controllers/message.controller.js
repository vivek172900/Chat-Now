const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { getIO } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    let { chatId, recipientId, content, messageType = "text", mediaUrl, clientId } = req.body;
    const userId = req.user._id;

    let chat;

    if (!chatId) {
      if (!recipientId) {
        return res.status(400).json({ error: 'chatId or recipientId required' });
      }

      chat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [userId, recipientId], $size: 2 }
      });

      if (!chat) {
        chat = new Chat({ participants: [userId, recipientId], isGroupChat: false });
        await chat.save();

        chat = await Chat.findById(chat._id).populate('participants', '-__v -createdAt -updatedAt');

        try {
          const io = getIO();
          chat.participants.forEach(p => {
            io.to(`user_${p._id.toString()}`).emit('new_chat', {
              chat: {
                ...chat.toObject(),
                preference: { isArchived: false, isFavorite: false }
              }
            });
          });
        } catch (err) {
          console.error('Failed to emit new_chat after sendMessage:', err.message);
        }
      }

      chatId = chat._id;
    } else {
      chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json({ error: "Not allowed" });
      }
    }

    const message = await Message.create({
      sender: userId,
      chat: chatId,
      content,
      messageType,
      mediaUrl,
      status: "sent",
      readBy: [{ user: userId, readAt: new Date() }],
    });

    chat.latestMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePic userId");

    const io = getIO();
    io.to(`chat_${chatId}`).emit("new_message", {
      chatId,
      message: populatedMessage,
      clientId: clientId || null,
    });

    res.status(201).json({ success: true, message: populatedMessage, clientId: clientId || null, chat: chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadFileMessage = async (req, res) => {
  console.log('=== FILE UPLOAD REQUEST ===');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('User:', req.user._id);
  
  try {
    const { chatId, messageType = 'file', clientId } = req.body;
    const userId = req.user._id;

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = getFileType(req.file.mimetype);
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    console.log('Creating message with file:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: fullUrl
    });

    // SIMPLIFIED: Save only the URL string for now
    const message = await Message.create({
      sender: userId,
      chat: chatId,
      content: req.file.originalname,
      messageType: fileType,
      mediaUrl: fullUrl, // Save as string for now
      file: undefined, // Don't set file field
      status: "sent",
      readBy: [{ user: userId, readAt: new Date() }],
    });

    chat.latestMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePic userId");

    const io = getIO();
    io.to(`chat_${chatId}`).emit("new_message", {
      chatId,
      message: populatedMessage,
      clientId: clientId || null,
    });

    res.status(201).json({ 
      success: true, 
      message: populatedMessage, 
      clientId: clientId || null 
    });
  } catch (error) {
    console.error('File upload error details:', error);
    res.status(500).json({ error: 'Failed to upload file: ' + error.message });
  }
};

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
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
      // mark as seen
      message.status = 'seen';
      await message.save();

      // Emit single message read receipt to chat room
      const io = getIO();
      io.to(`chat_${message.chat}`).emit('message_read', { messageId, readBy: userId });
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

// Mark all unread messages in a chat as read by current user
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find messages in chat that haven't been read by this user
    const unreadMessages = await Message.find({
      chat: chatId,
      'readBy.user': { $ne: userId }
    });

    if (!unreadMessages || unreadMessages.length === 0) {
      return res.json({ success: true, updated: 0 });
    }

    const now = new Date();
    const updatedIds = [];

    for (const msg of unreadMessages) {
      // Only add if not already present
      const already = msg.readBy.some(r => r.user.toString() === userId.toString());
      if (!already) {
        msg.readBy.push({ user: userId, readAt: now });
        // For simplicity mark messages as seen when the user reads them
        msg.status = 'seen';
        await msg.save();
        updatedIds.push(msg._id);
      }
    }

    // Emit socket event so other clients see read receipts
    const io = getIO();
    io.to(`chat_${chatId}`).emit('messages_read', {
      chatId,
      messageIds: updatedIds,
      readBy: { user: userId, readAt: now }
    });

    res.json({ success: true, updated: updatedIds.length, messageIds: updatedIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear all messages in a chat (admin or participant) - emits chat_cleared
const clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await Message.deleteMany({ chat: chatId });

    // Also clear latestMessage on chat
    chat.latestMessage = null;
    await chat.save();

    // Emit socket so clients can clear UI
    const io = getIO();
    io.to(`chat_${chatId}`).emit('chat_cleared', { chatId });

    res.json({ success: true, cleared: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  sendMessage,
  getChatMessages,
  markAsRead,
  deleteMessage,
  markChatAsRead,
  clearChat,
  uploadFileMessage
};