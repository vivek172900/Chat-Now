import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  syncUser: (userData) => api.post('/api/auth/sync', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  searchUsers: (search) => api.get(`/api/auth/search?search=${search}`),
  updateStatus: (isOnline) => api.put('/api/auth/status', { isOnline }),
};

// Chat API
export const chatAPI = {
  getOrCreateChat: (userId) => api.post('/api/chats/direct', { userId }),
  createGroupChat: (chatData) => api.post('/api/chats/group', chatData),
  getUserChats: (filter = 'all') => api.get(`/api/chats?filter=${filter}`),
  updateChatPreference: (chatId, preference) => 
    api.put(`/api/chats/${chatId}/preference`, preference),
  updateGroupChat: (chatId, chatData) => 
    api.put(`/api/chats/${chatId}/group`, chatData),
};

// Message API
export const messageAPI = {
  sendMessage: (messageData) => api.post('/api/messages', messageData),
  getChatMessages: (chatId, page = 1, limit = 50) => 
    api.get(`/api/messages/chat/${chatId}?page=${page}&limit=${limit}`),
  markAsRead: (messageId) => api.put(`/api/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/api/messages/${messageId}`),
};

// Call API
export const callAPI = {
  initiateCall: (callData) => api.post('/api/calls', callData),
  updateCallStatus: (callId, status) => 
    api.put(`/api/calls/${callId}/status`, { status }),
  getUserCalls: (page = 1, limit = 20) => 
    api.get(`/api/calls?page=${page}&limit=${limit}`),
  getCallDetails: (callId) => api.get(`/api/calls/${callId}`),
};

// Debug/Test API
export const debugAPI = {
  getUsers: () => api.get('/api/debug/users'),
  testWebhook: () => api.get('/api/webhooks/test'),
};

export default api;