const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIO } = require('../socket/socket');

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
    cb(new Error('Invalid file type. Only images, videos, audio, PDF, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  }
}).single('file');

const uploadFile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const { chatId, messageType = 'file', clientId } = req.body;
      const userId = req.user._id;

      if (!chatId) {
        return res.status(400).json({ error: 'chatId is required' });
      }

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json({ error: "Not allowed" });
      }

      const fileType = getFileType(req.file.mimetype);
      const fileUrl = `/uploads/${req.file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

      const message = await Message.create({
        sender: userId,
        chat: chatId,
        content: req.file.originalname,
        messageType: fileType,
        file: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          url: fullUrl,
          thumbnailUrl: fileType === 'image' ? fullUrl : null
        },
        status: "sent",
        readBy: [{ user: userId, readAt: new Date() }],
      });

      chat.latestMessage = message._id;
      await chat.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username profilePic userId");

      const io = getIO();
      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message: populatedMessage,
        clientId: clientId || null,
      });

      res.status(201).json({ 
        success: true, 
        message: populatedMessage, 
        clientId: clientId || null 
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
};

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
};

module.exports = { uploadFile };