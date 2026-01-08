const express = require('express');
const router = express.Router();
const { 
  syncUser, 
  getCurrentUser, 
  searchUsers, 
  updateUserStatus 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/sync', syncUser);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.get('/search', authenticate, searchUsers);
router.put('/status', authenticate, updateUserStatus);

module.exports = router;