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

router.use(authenticate, requireUserId);

router.post('/direct', getOrCreateChat);
router.post('/group', createGroupChat);
router.get('/', getUserChats);
router.put('/:chatId/preference', updateChatPreference);
router.put('/:chatId/group', updateGroupChat);

router.delete('/:chatId', deleteChat);

module.exports = router;