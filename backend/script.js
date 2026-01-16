require("dotenv").config();
console.log('JWT secret configured:', !!(process.env.JWT_SECRET_KEY || process.env.JWT_SECRET));
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./db/connection.js");
const path=require("path");
const { initializeSocket } = require("./socket/socket");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const callRoutes = require("./routes/call.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();
const server = http.createServer(app);

const Message = require('./models/Message');

console.log('=== Message Schema Debug ===');
console.log('Schema tree:', JSON.stringify(Message.schema.tree.file, null, 2));
console.log('Path type:', Message.schema.path('file').instance);
console.log('Path schema:', Message.schema.path('file').schema);

connectDB;

initializeSocket(server);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" })
);

app.use(express.json());

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

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 CHAT APP BACKEND SERVER STARTED");
});