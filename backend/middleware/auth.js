const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secret) {
      console.error('Auth middleware error: JWT secret not configured');
      return res.status(500).json({ error: 'Server JWT config error' });
    }

    const decoded = jwt.verify(token, secret);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Require that the authenticated user has a valid userId
const requireUserId = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { userId } = req.user;

  if (!userId || String(userId).length < 6) {
    return res.status(403).json({ success: false, error: 'userId required. Please complete account setup.' });
  }

  next();
};

module.exports = { authenticate, requireUserId };