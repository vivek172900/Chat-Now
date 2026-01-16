const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatMessages, 
  markAsRead, 
  deleteMessage, 
  markChatAsRead,
  clearChat,
  uploadFileMessage
} = require('../controllers/message.controller');
const { authenticate, requireUserId } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 16 * 1024 * 1024
  }
});

router.use(authenticate, requireUserId);

router.post('/', sendMessage);
router.post('/upload', upload.single('file'), uploadFileMessage);
router.get('/chat/:chatId', getChatMessages);
router.put('/chat/:chatId/read', markChatAsRead);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);
router.delete('/chat/:chatId/clear', clearChat);

module.exports = router;