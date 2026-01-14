require("dotenv").config();
console.log('JWT secret configured:', !!(process.env.JWT_SECRET_KEY || process.env.JWT_SECRET));
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./db/connection.js");
const { initializeSocket } = require("./socket/socket");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const callRoutes = require("./routes/call.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB;

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Raw body middleware for Clerk webhook
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" })
);

// JSON middleware for other routes
app.use(express.json());

// Test endpoints
app.get("/", (req, res) => {
  res.json({
    message: "Chat App Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/webhooks", webhookRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 CHAT APP BACKEND SERVER STARTED");
  // console.log("=".repeat(50));
  // console.log(`📍 Port: ${PORT}`);
  // console.log(`🔗 URL: http://localhost:${PORT}`);
  // console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  // console.log(`📞 Webhooks: http://localhost:${PORT}/api/webhooks/clerk`);
  // console.log("=".repeat(50));
  // console.log("📋 Available Endpoints:");
  // console.log("  GET  /health");
  // console.log("  POST /api/auth/sync");
  // console.log("  GET  /api/auth/me");
  // console.log("  GET  /api/auth/search?search=query");
  // console.log("  POST /api/chats/direct");
  // console.log("  POST /api/chats/group");
  // console.log("  GET  /api/chats?filter=all|unarchived|archived|favorites");
  // console.log("  POST /api/messages");
  // console.log("  GET  /api/messages/chat/:chatId");
  // console.log("  POST /api/calls");
  // console.log("  GET  /api/calls");
  // console.log("=".repeat(50) + "\n");
});