import { io } from "socket.io-client";

let socket = null;
const SOCKET_URL =
  process.env.REACT_APP_API_URL || "http://localhost:9000";

/**
 * Initialize socket connection
 * Must be called AFTER login
 */
export const initializeSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found in localStorage");
  }

  // 🔁 If socket already exists, update token & reconnect
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
  });

  return socket;
};

/**
 * Disconnect socket (on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Socket emit helpers
 */
export const socketEmit = {
  joinChat(chatId) {
    if (!socket) return;
    socket.emit("join_chat", { chatId });
  },

  leaveChat(chatId) {
    if (!socket) return;
    socket.emit("leave_chat", { chatId });
  },

  sendMessage(chatId, message) {
    if (!socket) return;
    socket.emit("send_message", { chatId, message });
  },

  markAsRead(messageId) {
    if (!socket) return;
    socket.emit("mark_as_read", { messageId });
  },

  typing(chatId, isTyping) {
    if (!socket) return;
    socket.emit("typing", { chatId, isTyping });
  },
};

export const getSocket = () => socket;
