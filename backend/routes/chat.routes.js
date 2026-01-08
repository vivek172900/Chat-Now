const express = require('express');
const router = express.Router();
const { 
  getOrCreateChat, 
  createGroupChat, 
  getUserChats, 
  updateChatPreference, 
  updateGroupChat 
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All routes are protected
router.use(authenticate);

router.post('/direct', getOrCreateChat);
router.post('/group', createGroupChat);
router.get('/', getUserChats);
router.put('/:chatId/preference', updateChatPreference);
router.put('/:chatId/group', updateGroupChat);

module.exports = router;