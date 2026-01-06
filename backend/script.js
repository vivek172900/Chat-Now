const express = require("express");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

require("./db/connection");

const Users = require("./models/Users");
const Roomids = require("./models/Roomids");
const Conversation = require("./models/Conversation");
const Message = require("./models/Messages");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const JWT_SECRET = process.env.JWT_SECRET_KEY || "fallback_secret_key_change_in_production";

function getUserSettings(conversation, userId) {
  if (!conversation.memberSettings || !Array.isArray(conversation.memberSettings)) {
    return {
      archived: false,
      locked: false,
      favorite: false
    };
  }
  
  const userSetting = conversation.memberSettings.find(setting => setting.userId === userId);
  
  if (!userSetting) {
    return {
      archived: false,
      locked: false,
      favorite: false
    };
  }
  
  return {
    archived: Boolean(userSetting.archived),
    locked: Boolean(userSetting.locked),
    favorite: Boolean(userSetting.favorite)
  };
}

async function updateUserSettings(conversationId, userId, newSettings) {
  const conversation = await Conversation.findOne({ Conversation_id: conversationId });
  
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  
  let memberSettings = conversation.memberSettings || [];
  
  const existingIndex = memberSettings.findIndex(setting => setting.userId === userId);
  
  if (existingIndex >= 0) {
    memberSettings[existingIndex] = {
      ...memberSettings[existingIndex],
      ...newSettings
    };
  } else {
    memberSettings.push({
      userId,
      archived: newSettings.archived || false,
      locked: newSettings.locked || false,
      favorite: newSettings.favorite || false
    });
  }
  
  await Conversation.updateOne(
    { Conversation_id: conversationId },
    { $set: { memberSettings: memberSettings } }
  );
  
  return memberSettings.find(setting => setting.userId === userId);
}

app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the Chat App API", 
    version: "1.0.0",
    status: "active"
  });
});


app.get("/api/getConversationsWithMessages/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    const { filter = 'unarchived' } = req.query;
    
    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const conversations = await Conversation.find({
      members: { $in: [userid] }
    }).lean();

    if (conversations.length === 0) {
      return res.status(200).json({
        conversations: [],
        filter: filter,
        counts: {
          total: 0,
          unarchived: 0,
          archived: 0,
          favorites: 0,
          locked: 0
        }
      });
    }

    const conversationsWithMessages = [];

    for (const conversation of conversations) {
      try {
        const otherMemberId = conversation.members.find(member => member !== userid);
        
        if (!otherMemberId) {
          continue;
        }
        
        let otherMember = await Users.findOne({ email: otherMemberId }, {
          Fullname: 1,
          Username: 1,
          avatar: 1,
          State: 1,
          email: 1
        }).lean();

        if (!otherMember) {
          otherMember = {
            Fullname: otherMemberId.split('@')[0],
            Username: otherMemberId.split('@')[0],
            email: otherMemberId,
            avatar: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=",
            State: "Offline"
          };
        }

        const totalMessages = await Message.countDocuments({
          $or: [
            { senderid: userid, receiverid: otherMemberId },
            { senderid: otherMemberId, receiverid: userid }
          ]
        });

        const unreadCount = await Message.countDocuments({
          senderid: otherMemberId,
          receiverid: userid,
          msgRead: "no"
        });

        let latestMessage = null;
        if (totalMessages > 0) {
          latestMessage = await Message.findOne({
            $or: [
              { senderid: userid, receiverid: otherMemberId },
              { senderid: otherMemberId, receiverid: userid }
            ]
          }).sort({ timestamp: -1 }).lean();
        }

        // Get user settings using helper function
        const userSettings = getUserSettings(conversation, userid);

        const conversationData = {
          ...conversation,
          otherMember,
          latestMessage,
          unreadCount,
          totalMessages,
          hasMessages: totalMessages > 0,
          userSettings
        };

        conversationsWithMessages.push(conversationData);
      } catch (error) {
        console.error(`Error processing conversation:`, error);
        continue;
      }
    }

    let filteredConversations;
    
    switch(filter.toLowerCase()) {
      case 'archived':
        filteredConversations = conversationsWithMessages.filter(
          conv => conv.userSettings.archived === true
        );
        break;
        
      case 'favorites':
        filteredConversations = conversationsWithMessages.filter(
          conv => conv.userSettings.favorite === true
        );
        break;
        
      case 'locked':
        filteredConversations = conversationsWithMessages.filter(
          conv => conv.userSettings.locked === true
        );
        break;
        
      case 'unarchived':
        filteredConversations = conversationsWithMessages.filter(
          conv => conv.userSettings.archived === false
        );
        break;
        
      case 'all':
        filteredConversations = conversationsWithMessages;
        break;
        
      default:
        filteredConversations = conversationsWithMessages.filter(
          conv => conv.userSettings.archived === false
        );
    }

    filteredConversations.sort((a, b) => {
      if (a.latestMessage && b.latestMessage) {
        return new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp);
      }
      if (a.latestMessage && !b.latestMessage) return -1;
      if (!a.latestMessage && b.latestMessage) return 1;
      return 0;
    });

    const counts = {
      total: conversationsWithMessages.length,
      unarchived: conversationsWithMessages.filter(c => c.userSettings.archived === false).length,
      archived: conversationsWithMessages.filter(c => c.userSettings.archived === true).length,
      favorites: conversationsWithMessages.filter(c => c.userSettings.favorite === true).length,
      locked: conversationsWithMessages.filter(c => c.userSettings.locked === true).length
    };

    res.status(200).json({
      conversations: filteredConversations,
      filter: filter,
      counts: counts
    });
  } catch (error) {
    console.error("Error fetching conversations with messages:", error);
    res.status(500).json({ message: "Error fetching conversations with messages" });
  }
});


app.post("/api/updateConversationSettings", async (req, res) => {
  try {
    const { conversationId, userId, settings } = req.body;
    
    console.log("Updating conversation settings:", { conversationId, userId, settings });
    
    if (!conversationId || !userId || !settings) {
      return res.status(400).json({ 
        message: "Conversation ID, User ID, and settings are required" 
      });
    }

    const conversation = await Conversation.findOne({ Conversation_id: conversationId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(403).json({ message: "User is not a member of this conversation" });
    }

    // Use the helper function to update settings
    const updatedSettings = await updateUserSettings(conversationId, userId, settings);

    res.status(200).json({ 
      success: true,
      message: "Conversation settings updated",
      userId,
      conversationId,
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Error updating conversation settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/getConversation/:conversationId/:userId", async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    
    if (!conversationId || !userId) {
      return res.status(400).json({ message: "Conversation ID and User ID are required" });
    }

    const conversation = await Conversation.findOne({ Conversation_id: conversationId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userSettings = getUserSettings(conversation, userId);

    const otherMemberId = conversation.members.find(member => member !== userId);
    const otherMember = await Users.findOne({ email: otherMemberId }, {
      Fullname: 1,
      Username: 1,
      avatar: 1,
      State: 1,
      email: 1
    }).lean();

    const unreadCount = await Message.countDocuments({
      senderid: otherMemberId,
      receiverid: userId,
      msgRead: "no"
    });

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderid: userId, receiverid: otherMemberId },
        { senderid: otherMemberId, receiverid: userId }
      ]
    });

    res.status(200).json({
      ...conversation.toObject(),
      otherMember,
      userSettings,
      unreadCount,
      totalMessages
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/batchUpdateConversations", async (req, res) => {
  try {
    const { userId, updates } = req.body;
    
    if (!userId || !updates || !Array.isArray(updates)) {
      return res.status(400).json({ 
        message: "User ID and updates array are required" 
      });
    }

    const results = [];
    
    for (const update of updates) {
      const { conversationId, settings } = update;
      
      const conversation = await Conversation.findOne({ Conversation_id: conversationId });
      if (conversation && conversation.members.includes(userId)) {
        const updatedSettings = await updateUserSettings(conversationId, userId, settings);
        
        results.push({
          conversationId,
          success: true,
          settings: updatedSettings
        });
      } else {
        results.push({
          conversationId,
          success: false,
          error: "Conversation not found or user is not a member"
        });
      }
    }

    res.status(200).json({ 
      success: true,
      results 
    });
  } catch (error) {
    console.error("Error batch updating conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/resetConversationSettings", async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    
    if (!conversationId || !userId) {
      return res.status(400).json({ 
        message: "Conversation ID and User ID are required" 
      });
    }

    const conversation = await Conversation.findOne({ Conversation_id: conversationId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Reset to default settings
    const resetSettings = {
      archived: false,
      locked: false,
      favorite: false
    };

    const updatedSettings = await updateUserSettings(conversationId, userId, resetSettings);

    res.status(200).json({ 
      success: true,
      message: "Conversation settings reset to default",
      userId,
      conversationId,
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Error resetting conversation settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/getUserSettings/:conversationId/:userId", async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    
    if (!conversationId || !userId) {
      return res.status(400).json({ 
        message: "Conversation ID and User ID are required" 
      });
    }

    const conversation = await Conversation.findOne({ Conversation_id: conversationId });
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found",
        settings: {
          archived: false,
          locked: false,
          favorite: false
        }
      });
    }

    // Get user settings using helper function
    const userSettings = getUserSettings(conversation, userId);

    res.status(200).json({
      success: true,
      conversationId,
      userId,
      settings: userSettings
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      settings: {
        archived: false,
        locked: false,
        favorite: false
      }
    });
  }
});

app.post("/api/migrateToNewFormat", async (req, res) => {
  try {
    const conversations = await Conversation.find({}).lean();
    let migratedCount = 0;
    
    for (const conversation of conversations) {
      if (conversation.memberSettings) {
        let memberSettings = conversation.memberSettings;
        let newSettingsArray = [];
        
        // If it's a Map, convert to object
        if (memberSettings instanceof Map) {
          const plainObj = {};
          for (const [key, value] of memberSettings.entries()) {
            plainObj[key] = value;
          }
          memberSettings = plainObj;
        }
        
        // If it's an object with email keys, convert to array
        if (typeof memberSettings === 'object' && !Array.isArray(memberSettings)) {
          for (const [userId, settings] of Object.entries(memberSettings)) {
            newSettingsArray.push({
              userId: userId,
              archived: Boolean(settings.archived),
              locked: Boolean(settings.locked),
              favorite: Boolean(settings.favorite)
            });
          }
          
          await Conversation.updateOne(
            { Conversation_id: conversation.Conversation_id },
            { $set: { memberSettings: newSettingsArray } }
          );
          
          migratedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Migrated ${migratedCount} conversations to new format`,
      total: conversations.length,
      migrated: migratedCount
    });
  } catch (error) {
    console.error("Error migrating conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


const users_sockets = new Map();
const socket_users = new Map();

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("register", async (userid) => {
    try {
      if (!userid) {
        socket.emit("error", { message: "User ID is required for registration" });
        return;
      }

      if (users_sockets.has(userid)) {
        const oldSocketId = users_sockets.get(userid);
        socket_users.delete(oldSocketId);
      }

      users_sockets.set(userid, socket.id);
      socket_users.set(socket.id, userid);

      await Users.updateOne(
        { email: userid },
        { 
          $set: { 
            State: "Online",
            lastSeen: new Date()
          } 
        }
      );

      socket.broadcast.emit("userStatusUpdate", {
        userid: userid,
        status: "Online",
        lastSeen: new Date()
      });

      socket.emit("registered", { message: "Successfully registered", userid });
      console.log(`👤 User ${userid} registered with socket ID: ${socket.id}`);
    } catch (error) {
      console.error("Error registering user:", error);
      socket.emit("error", { message: "Registration failed" });
    }
  });

  socket.on("sendone2oneMSG", async ({ senderid, receiverid, message }) => {
    try {
      if (!senderid || !receiverid || !message) {
        socket.emit("error", { message: "Sender ID, Receiver ID, and message are required" });
        return;
      }

      if (message.trim().length === 0) {
        socket.emit("error", { message: "Message cannot be empty" });
        return;
      }

      const newMessage = new Message({
        senderid: senderid,
        receiverid: receiverid,
        message: message.trim()
      });

      await newMessage.save();

      const receiverSocketId = users_sockets.get(receiverid);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveone2one", {
          sender: socket.id,
          message: message.trim(),
          senderid,
          timestamp: newMessage.timestamp,
          messageId: newMessage._id
        });
      }

      socket.emit("messageSent", {
        messageId: newMessage._id,
        timestamp: newMessage.timestamp,
        status: receiverSocketId ? "delivered" : "sent"
      });

      console.log(`💬 Message sent from ${senderid} to ${receiverid}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("messageRead", async ({ senderid, receiverid }) => {
    try {
      if (!senderid || !receiverid) {
        return;
      }

      await Message.updateMany(
        { senderid: receiverid, receiverid: senderid, msgRead: "no" },
        { $set: { msgRead: "yes" } }
      );

      const senderSocketId = users_sockets.get(receiverid);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          receiverid: senderid
        });
      }
    } catch (error) {
      console.error("Error marking messages as read via socket:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const userid = socket_users.get(socket.id);
      
      if (userid) {
        await Users.updateOne(
          { email: userid },
          { 
            $set: { 
              State: "Offline",
              lastSeen: new Date()
            } 
          }
        );

        socket.broadcast.emit("userStatusUpdate", {
          userid: userid,
          status: "Offline",
          lastSeen: new Date()
        });

        users_sockets.delete(userid);
        socket_users.delete(socket.id);

        console.log(`❌ User ${userid} disconnected (${socket.id})`);
      } else {
        console.log(`❌ Unknown user disconnected (${socket.id})`);
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: Local MongoDB`);
  console.log(`🔧 New: Using array-based memberSettings format`);
});