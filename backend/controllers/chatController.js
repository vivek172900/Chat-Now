const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatPreference = require('../models/ChatPreference');

const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [currentUser._id, userId], $size: 2 }
    }).populate('participants', '-__v -createdAt -updatedAt')
      .populate('latestMessage');

    if (chat) {
      const preference = await ChatPreference.findOne({
        user: currentUser._id,
        chat: chat._id
      });

      return res.json({
        success: true,
        chat: {
          ...chat.toObject(),
          preference: preference || { isArchived: false, isFavorite: false }
        }
      });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    chat = new Chat({
      participants: [currentUser._id, otherUser._id],
      isGroupChat: false
    });

    await chat.save();

    chat = await Chat.findById(chat._id)
      .populate('participants', '-__v -createdAt -updatedAt');

    try {
      const io = require('../socket/socket').getIO();
      chat.participants.forEach(p => {
        io.to(`user_${p._id.toString()}`).emit('new_chat', { chat: {
          ...chat.toObject(),
          preference: { isArchived: false, isFavorite: false }
        }});
      });
    } catch (err) {
      console.error('Failed to emit new_chat:', err.message);
    }

    res.status(201).json({
      success: true,
      chat: {
        ...chat.toObject(),
        preference: { isArchived: false, isFavorite: false }
      }
    });
  } catch (error) {
    console.error('Get/create chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createGroupChat = async (req, res) => {
  try {
    const { chatName, participants } = req.body;
    const currentUser = req.user;

    if (!chatName || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'Chat name and participants are required' });
    }

    const allParticipants = [...new Set([currentUser._id.toString(), ...participants])];

    if (allParticipants.length < 2) {
      return res.status(400).json({ success: false, error: 'Group chat must have at least 2 participants' });
    }

    const usersExist = await User.find({ 
      _id: { $in: allParticipants } 
    }).select('_id');
    
    if (usersExist.length !== allParticipants.length) {
      return res.status(400).json({ success: false, error: 'One or more participants not found' });
    }

    const chat = new Chat({
      chatName,
      participants: allParticipants,
      isGroupChat: true,
      admin: currentUser._id
    });

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', '-__v -createdAt -updatedAt')
      .populate('admin', '-__v -createdAt -updatedAt');

    try {
      const io = require('../socket/socket').getIO();
      populatedChat.participants.forEach(p => {
        io.to(`user_${p._id.toString()}`).emit('new_chat', { 
          chat: { 
            ...populatedChat.toObject(), 
            preference: { isArchived: false, isFavorite: false } 
          } 
        });
      });
    } catch (err) {
      console.error('Failed to emit new_chat for group creation:', err.message);
    }

    res.status(201).json({
      success: true,
      chat: populatedChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserChats = async (req, res) => {
  try {
    const currentUser = req.user;
    const { filter = 'all' } = req.query;

    console.log('GET /api/chats called by user:', currentUser?._id);

    let chats = await Chat.find({
      participants: currentUser._id
    })
    .populate('participants', '-__v -createdAt -updatedAt')
    .populate('latestMessage')
    .populate('admin', '-__v -createdAt -updatedAt')
    .sort({ updatedAt: -1 });

    console.log('Found chats count:', chats.length);

    const preferences = await ChatPreference.find({
      user: currentUser._id,
      chat: { $in: chats.map(chat => chat._id) }
    });

    const preferenceMap = preferences.reduce((map, pref) => {
      map[pref.chat.toString()] = pref;
      return map;
    }, {});

    chats = chats.map(chat => ({
      ...chat.toObject(),
      preference: preferenceMap[chat._id] || { isArchived: false, isFavorite: false, mutedUntil: null }
    }));

    if (filter === 'unarchived') {
      chats = chats.filter(chat => !chat.preference.isArchived);
    } else if (filter === 'archived') {
      chats = chats.filter(chat => chat.preference.isArchived);
    } else if (filter === 'favorites') {
      chats = chats.filter(chat => chat.preference.isFavorite);
    }

    const unreadCounts = await Promise.all(
      chats.map(async (chat) => {
        const count = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: currentUser._id },
          readBy: { $not: { $elemMatch: { user: currentUser._id } } }
        });
        return { chatId: chat._id, unreadCount: count };
      })
    );

    const unreadMap = unreadCounts.reduce((map, item) => {
      map[item.chatId.toString()] = item.unreadCount;
      return map;
    }, {});

    chats = chats.map(chat => ({
      ...chat,
      unreadCount: unreadMap[chat._id] || 0
    }));

    res.json({
      success: true,
      chats,
      totalUnreadCount: Object.values(unreadMap).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateChatPreference = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isArchived, isFavorite, mutedUntil, wallpaper } = req.body;
    const currentUser = req.user;

    const update = { };
    if (typeof isArchived !== 'undefined') update.isArchived = isArchived;
    if (typeof isFavorite !== 'undefined') update.isFavorite = isFavorite;
    if (typeof mutedUntil !== 'undefined') update.mutedUntil = mutedUntil;
    if (typeof wallpaper !== 'undefined') update.wallpaper = wallpaper;

    const preference = await ChatPreference.findOneAndUpdate(
      { user: currentUser._id, chat: chatId },
      update,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      preference
    });
  } catch (error) {
    console.error('Update chat preference error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { chatName, participants, admin } = req.body;
    const currentUser = req.user;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    if (chat.admin.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only admin can update group chat' });
    }

    if (chatName) chat.chatName = chatName;
    if (participants) chat.participants = participants;
    if (admin) chat.admin = admin;

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', '-__v -createdAt -updatedAt')
      .populate('admin', '-__v -createdAt -updatedAt');

    try {
      const io = require('../socket/socket').getIO();
      io.to(`chat_${updatedChat._id}`).emit('chat_updated', { chat: updatedChat });
      updatedChat.participants.forEach(p => {
        io.to(`user_${p._id.toString()}`).emit('new_chat', { chat: { ...updatedChat.toObject(), preference: { isArchived: false, isFavorite: false } } });
      });
    } catch (err) {
      console.error('Failed to emit chat_updated:', err.message);
    }

    res.json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Update group chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUser = req.user;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, error: 'Chat not found' });

    const participantIds = chat.participants.map(p => p.toString());

    if (!participantIds.includes(currentUser._id.toString())) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Message.deleteMany({ chat: chatId });
    await ChatPreference.deleteMany({ chat: chatId });

    await Chat.findByIdAndDelete(chatId);

    try {
      const io = require('../socket/socket').getIO();
      participantIds.forEach(pid => {
        io.to(`user_${pid}`).emit('chat_deleted', { chatId });
      });
    } catch (err) {
      console.error('Failed to emit chat_deleted:', err.message);
    }

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOrCreateChat,
  createGroupChat,
  getUserChats,
  updateChatPreference,
  updateGroupChat,
  deleteChat
};