const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/sync', syncUser);
router.get('/clerk/:clerkUserId', getUserByClerkId); 
router.get('/id/:userId', getUserById);

router.post('/add-user-id', authenticate, addUserId);
router.get('/check-userid', checkUserId);
router.get('/me', authenticate, getCurrentUser);
router.get('/search', authenticate, searchUsers);
router.put('/status', authenticate, updateUserStatus);
router.put('/me', authenticate, updateProfile);

router.post('/set-pin', authenticate, setPin);
router.post('/verify-pin', authenticate, verifyPin);

module.exports = router;