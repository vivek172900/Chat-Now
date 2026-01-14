const express = require('express');
const router = express.Router();
const { 
  getOrCreateChat, 
  createGroupChat, 
  getUserChats, 
  updateChatPreference, 
  updateGroupChat,
  deleteChat
} = require('../controllers/chatController');
const { authenticate, requireUserId } = require('../middleware/auth');

// All routes require authenticated user and a userId
router.use(authenticate, requireUserId);

router.post('/direct', getOrCreateChat);
router.post('/group', createGroupChat);
router.get('/', getUserChats);
router.put('/:chatId/preference', updateChatPreference);
router.put('/:chatId/group', updateGroupChat);

// Delete chat
router.delete('/:chatId', deleteChat);

module.exports = router;