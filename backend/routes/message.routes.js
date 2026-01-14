const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatMessages, 
  markAsRead, 
  deleteMessage, 
  markChatAsRead,
  clearChat
} = require('../controllers/message.controller');
const { authenticate, requireUserId } = require('../middleware/auth');

// All routes require authenticated user and a userId
router.use(authenticate, requireUserId);

router.post('/', sendMessage);
router.get('/chat/:chatId', getChatMessages);
// Chat-level read must come before single-message read to avoid route collision
router.put('/chat/:chatId/read', markChatAsRead);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

// Clear all messages in a chat
router.delete('/chat/:chatId/clear', clearChat);

module.exports = router;