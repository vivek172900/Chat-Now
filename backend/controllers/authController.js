const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT secret not set. Please set JWT_SECRET_KEY or JWT_SECRET in .env');
    throw new Error('JWT secret not configured');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

const syncUser = async (req, res) => {
  try {
    const { clerkUserId, email, username, profilePic, firstName, lastName } = req.body;

    let user = await User.findOne({ clerkUserId });

    if (user) {
      // Update existing user
      const updates = {};
      if (email && user.email !== email) updates.email = email;
      if (username && user.username !== username) updates.username = username;
      if (profilePic && user.profilePic !== profilePic) updates.profilePic = profilePic;
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      
      if (Object.keys(updates).length > 0) {
        user = await User.findOneAndUpdate(
          { clerkUserId },
          { $set: updates },
          { new: true }
        );
      }
    } else {
      // Create new user with generated userId
      user = new User({
        clerkUserId,
        email,
        username: username || firstName || email.split('@')[0],
        profilePic: profilePic || '',
        firstName: firstName || '',
        lastName: lastName || '',
        about: 'Hey there! I am using Chat App',
        isOnline: false,
        lastSeen: new Date()
      });
      
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        userId: user.userId,
        clerkUserId: user.clerkUserId,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        firstName: user.firstName,
        lastName: user.lastName,
        about: user.about,
        isOnline: user.isOnline
      },
      token
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const bcrypt = require('bcryptjs');

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        userId: user.userId,
        clerkUserId: user.clerkUserId,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        wallpaper: user.wallpaper,
        messageTheme: user.messageTheme,
        about: user.about,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasPin: !!user.pinHash
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Set or update PIN for archive protection
const setPin = async (req, res) => {
  try {
    const user = req.user;
    const { pin } = req.body || {};

    if (!pin || typeof pin !== 'string' || !/^[0-9]{4,8}$/.test(pin)) {
      return res.status(400).json({ success: false, error: 'PIN must be 4-8 numeric digits' });
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(pin, saltRounds);

    user.pinHash = hashed;
    user.pinEnabled = true;
    await user.save();

    res.json({ success: true, message: 'PIN set successfully' });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify a provided PIN
const verifyPin = async (req, res) => {
  try {
    const user = req.user;
    const { pin } = req.body || {};

    if (!user.pinHash) {
      return res.status(400).json({ success: false, error: 'No PIN set' });
    }

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ success: false, error: 'PIN required' });
    }

    const match = await bcrypt.compare(pin, user.pinHash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid PIN' });
    }

    res.json({ success: true, message: 'PIN verified' });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUser = req.user._id;

    if (!search || search.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser } },
        {
          $or: [
            { userId: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }).select('userId clerkUserId username email profilePic firstName lastName about isOnline lastSeen').limit(20);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = req.user;

    user.isOnline = isOnline || false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ 
      success: true, 
      user: { 
        userId: user.userId,
        isOnline: user.isOnline, 
        lastSeen: user.lastSeen 
      } 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update profile (username, profilePic, wallpaper)
const updateProfile = async (req, res) => {
  try {
    const { username, profilePic, wallpaper, theme, about } = req.body;
    const user = req.user;

    // Update only the fields that are provided
    if (typeof username !== 'undefined') user.username = username;
    if (typeof profilePic !== 'undefined') user.profilePic = profilePic;
    if (typeof wallpaper !== 'undefined') user.wallpaper = wallpaper;
    if (typeof theme !== 'undefined') user.messageTheme = theme;
    if (typeof about !== 'undefined') user.about = about;

    await user.save();

    // Return the updated user with all fields
    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        userId: user.userId,
        clerkUserId: user.clerkUserId,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        wallpaper: user.wallpaper,
        messageTheme: user.messageTheme,
        about: user.about,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add or set userId for a user (accepts desired userId or auto-generates)
const addUserId = async (req, res) => {
  try {
    const user = req.user;
    const { userId } = req.body || {};

    // If user already has userId and no new value provided, return it
    if (user.userId && !userId) {
      return res.json({
        success: true,
        message: 'User already has userId',
        user: {
          userId: user.userId,
          username: user.username,
          profilePic: user.profilePic,
          wallpaper: user.wallpaper,
          messageTheme: user.messageTheme
        }
      });
    }

    // Validation regex: allow letters, numbers, underscore, dot and hyphen, 3-30 chars
    const idPattern = /^[a-zA-Z0-9_.-]{3,30}$/;

    if (userId) {
      if (!idPattern.test(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid userId format. Use 3-30 letters, numbers, underscore, dot or hyphen.' });
      }

      // Check uniqueness
      const existing = await User.findOne({ userId });
      if (existing) {
        return res.status(409).json({ success: false, error: 'userId already taken' });
      }

      user.userId = userId;
      await user.save();

      return res.json({ success: true, message: 'userId set successfully', user });
    }

    // Auto-generate suggested userId from username
    let base = (user.username || user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 20);
    if (!base) base = 'user';

    let candidate = base;
    let suffix = 1;
    while (await User.findOne({ userId: candidate })) {
      candidate = `${base}${suffix++}`;
      if (candidate.length > 30) candidate = candidate.slice(0, 30);
    }

    user.userId = candidate;
    await user.save();

    res.json({ success: true, message: 'userId added successfully', user });
  } catch (error) {
    console.error('Add userId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by clerkUserId (for frontend)
const getUserByClerkId = async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    if (!clerkUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clerkUserId is required' 
      });
    }
    
    const user = await User.findOne({ clerkUserId })
      .select('userId clerkUserId username email profilePic firstName lastName about isOnline lastSeen wallpaper messageTheme');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Get user by clerkId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check userId availability (public)
const checkUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }
    const idPattern = /^[a-zA-Z0-9_.-]{3,30}$/;
    if (!idPattern.test(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid userId format' });
    }
    const existing = await User.findOne({ userId });
    res.json({ success: true, available: !existing });
  } catch (error) {
    console.error('Check userId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by userId (for frontend)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }
    
    const user = await User.findOne({ userId })
      .select('userId clerkUserId username email profilePic firstName lastName about isOnline lastSeen wallpaper messageTheme');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Get user by userId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  searchUsers,
  updateUserStatus,
  updateProfile,
  addUserId,
  checkUserId,
  getUserByClerkId,
  getUserById,
  setPin,
  verifyPin
};