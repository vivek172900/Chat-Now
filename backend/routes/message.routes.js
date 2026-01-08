const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatMessages, 
  markAsRead, 
  deleteMessage 
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes are protected
router.use(authenticate);

router.post('/', sendMessage);
router.get('/chat/:chatId', getChatMessages);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;