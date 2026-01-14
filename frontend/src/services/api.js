import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:9000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT if cookies ever used
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  syncUser: (userData) =>
    api.post('/api/auth/sync', userData),

  getCurrentUser: () =>
    api.get('/api/auth/me'),

  updateProfile: (profileData) =>
    api.put('/api/auth/me', profileData),

  addUserId: (data) =>
    api.post('/api/auth/add-user-id', data),

  checkUserId: (userId) =>
    api.get(`/api/auth/check-userid?userId=${encodeURIComponent(userId)}`),

  searchUsers: (search = '') =>
    api.get(`/api/auth/search?search=${encodeURIComponent(search)}`),

  updateStatus: (isOnline) =>
    api.put('/api/auth/status', { isOnline }),



  getUserByClerkId: (clerkUserId) =>
    api.get(`/api/auth/clerk/${clerkUserId}`),

  getUserById: (userId) =>
    api.get(`/api/auth/id/${userId}`),
  setPin: (pin) =>
    api.post('/api/auth/set-pin', { pin }),
  verifyPin: (pin) =>
    api.post('/api/auth/verify-pin', { pin }),
};

export const chatAPI = {
  getOrCreateChat: (userId) =>
    api.post('/api/chats/direct', { userId }),

  deleteChat: (chatId) =>
    api.delete(`/api/chats/${chatId}`),

  createGroupChat: (chatData) =>
    api.post('/api/chats/group', chatData),

  getUserChats: (filter = 'all') =>
    api.get(`/api/chats?filter=${filter}`),

  updateChatPreference: (chatId, preference) =>
    api.put(`/api/chats/${chatId}/preference`, preference),

  updateGroupChat: (chatId, chatData) =>
    api.put(`/api/chats/${chatId}/group`, chatData),
};

export const messageAPI = {
  sendMessage: (messageData) =>
    api.post('/api/messages', messageData),

  getChatMessages: (chatId, page = 1, limit = 50) =>
    api.get(
      `/api/messages/chat/${chatId}?page=${page}&limit=${limit}`
    ),

  markAsRead: (messageId) =>
    api.put(`/api/messages/${messageId}/read`),

  markChatAsRead: (chatId) =>
    api.put(`/api/messages/chat/${chatId}/read`),

  clearChat: (chatId) =>
    api.delete(`/api/messages/chat/${chatId}/clear`),

  deleteMessage: (messageId) =>
    api.delete(`/api/messages/${messageId}`),
};

export const callAPI = {
  initiateCall: (callData) =>
    api.post('/api/calls', callData),

  updateCallStatus: (callId, status) =>
    api.put(`/api/calls/${callId}/status`, { status }),

  getUserCalls: (page = 1, limit = 20) =>
    api.get(`/api/calls?page=${page}&limit=${limit}`),

  getCallDetails: (callId) =>
    api.get(`/api/calls/${callId}`),
};

export const debugAPI = {
  getUsers: () =>
    api.get('/api/debug/users'),

  testWebhook: () =>
    api.get('/api/webhooks/test'),
};

export default api;
