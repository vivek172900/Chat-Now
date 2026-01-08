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

    // Check if chat already exists between two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [currentUser._id, userId], $size: 2 }
    }).populate('participants', '-__v -createdAt -updatedAt')
      .populate('latestMessage');

    if (chat) {
      // Get chat preferences
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

    // Create new chat
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    chat = new Chat({
      participants: [currentUser._id, otherUser._id],
      isGroupChat: false
    });

    await chat.save();

    // Populate participants
    chat = await Chat.findById(chat._id)
      .populate('participants', '-__v -createdAt -updatedAt');

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

    // Add current user to participants
    const allParticipants = [...new Set([currentUser._id.toString(), ...participants])];

    if (allParticipants.length < 3) {
      return res.status(400).json({ success: false, error: 'Group chat must have at least 3 participants' });
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

    // Get all chats where user is a participant
    let chats = await Chat.find({
      participants: currentUser._id
    })
    .populate('participants', '-__v -createdAt -updatedAt')
    .populate('latestMessage')
    .populate('admin', '-__v -createdAt -updatedAt')
    .sort({ updatedAt: -1 });

    // Get chat preferences
    const preferences = await ChatPreference.find({
      user: currentUser._id,
      chat: { $in: chats.map(chat => chat._id) }
    });

    const preferenceMap = preferences.reduce((map, pref) => {
      map[pref.chat.toString()] = pref;
      return map;
    }, {});

    // Attach preferences to chats
    chats = chats.map(chat => ({
      ...chat.toObject(),
      preference: preferenceMap[chat._id] || { isArchived: false, isFavorite: false, mutedUntil: null }
    }));

    // Filter based on request
    if (filter === 'unarchived') {
      chats = chats.filter(chat => !chat.preference.isArchived);
    } else if (filter === 'archived') {
      chats = chats.filter(chat => chat.preference.isArchived);
    } else if (filter === 'favorites') {
      chats = chats.filter(chat => chat.preference.isFavorite);
    }

    // Get unread counts for each chat
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

    // Add unread counts to chats
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
    const { isArchived, isFavorite, mutedUntil } = req.body;
    const currentUser = req.user;

    const preference = await ChatPreference.findOneAndUpdate(
      { user: currentUser._id, chat: chatId },
      { isArchived, isFavorite, mutedUntil },
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

    // Check if user is admin
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

    res.json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Update group chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOrCreateChat,
  createGroupChat,
  getUserChats,
  updateChatPreference,
  updateGroupChat
};