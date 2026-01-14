const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
      // Create new user
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

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
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
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }).select('-__v -createdAt -updatedAt').limit(20);

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

    res.json({ success: true, user: { isOnline: user.isOnline, lastSeen: user.lastSeen } });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  searchUsers,
  updateUserStatus
};