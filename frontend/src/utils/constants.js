export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
};

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  SEEN: 'seen',
  FAILED: 'failed',
};

export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

export const CALL_STATUS = {
  RINGING: 'ringing',
  ONGOING: 'ongoing',
  ENDED: 'ended',
  MISSED: 'missed',
};

export const CHAT_FILTERS = {
  ALL: 'all',
  UNARCHIVED: 'unarchived',
  ARCHIVED: 'archived',
  FAVORITES: 'favorites',
  LOCKED: 'locked',
};

export const SIDEBAR_TABS = {
  CHATS: 'chats',
  USERS: 'users',
  ARCHIVE: 'archive',
  FAVORITES: 'favorites',
  LOCKED: 'locked',
  SETTINGS: 'settings',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Message events
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',
  
  // Typing events
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  TYPING_INDICATOR: 'typing_indicator',
  
  // User status events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_STATUS_CHANGE: 'user_status_change',
  
  // Call events
  CALL_INITIATE: 'call_initiate',
  CALL_ACCEPT: 'call_accept',
  CALL_REJECT: 'call_reject',
  CALL_END: 'call_end',
  CALL_RINGING: 'call_ringing',
  CALL_ANSWERED: 'call_answered',
  CALL_BUSY: 'call_busy',
  CALL_CANCELED: 'call_canceled',
  
  // Notification events
  NOTIFICATION: 'notification',
  MESSAGE_NOTIFICATION: 'message_notification',
  
  // Error events
  ERROR: 'error',
};

export const API_ENDPOINTS = {
  // Auth
  SYNC_USER: '/api/auth/sync',
  GET_CURRENT_USER: '/api/auth/me',
  SEARCH_USERS: '/api/auth/search',
  UPDATE_STATUS: '/api/auth/status',
  
  // Chats
  GET_OR_CREATE_CHAT: '/api/chats/direct',
  CREATE_GROUP_CHAT: '/api/chats/group',
  GET_USER_CHATS: '/api/chats',
  UPDATE_CHAT_PREFERENCE: '/api/chats/:chatId/preference',
  UPDATE_GROUP_CHAT: '/api/chats/:chatId/group',
  
  // Messages
  SEND_MESSAGE: '/api/messages',
  GET_CHAT_MESSAGES: '/api/messages/chat/:chatId',
  MARK_AS_READ: '/api/messages/:messageId/read',
  DELETE_MESSAGE: '/api/messages/:messageId',
  
  // Calls
  INITIATE_CALL: '/api/calls',
  UPDATE_CALL_STATUS: '/api/calls/:callId/status',
  GET_USER_CALLS: '/api/calls',
  GET_CALL_DETAILS: '/api/calls/:callId',
  
  // Webhooks
  CLERK_WEBHOOK: '/api/webhooks/clerk',
  
  // Debug
  DEBUG_USERS: '/api/debug/users',
  TEST_WEBHOOK: '/api/webhooks/test',
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SELECTED_CHAT: 'selectedChat',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  HI: 'hi',
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  SYSTEM: 'system',
  FRIEND_REQUEST: 'friend_request',
  GROUP_INVITE: 'group_invite',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SOCKET_ERROR: 'Connection lost. Reconnecting...',
};

export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully.',
  MESSAGE_DELETED: 'Message deleted.',
  CHAT_ARCHIVED: 'Chat archived.',
  CHAT_UNARCHIVED: 'Chat unarchived.',
  CHAT_FAVORITED: 'Chat added to favorites.',
  CHAT_UNFAVORITED: 'Chat removed from favorites.',
  CHAT_LOCKED: 'Chat locked.',
  CHAT_UNLOCKED: 'Chat unlocked.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN: 3,
    MAX: 30,
    PATTERN: /^[a-zA-Z0-9_.-]+$/,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  },
  CHAT_NAME: {
    MIN: 1,
    MAX: 100,
  },
  MESSAGE: {
    MAX: 5000,
  },
};

export const TIME_FORMATS = {
  SHORT_TIME: 'HH:mm',
  LONG_TIME: 'HH:mm:ss',
  SHORT_DATE: 'DD/MM/YYYY',
  LONG_DATE: 'DD MMMM YYYY',
  DATE_TIME: 'DD/MM/YYYY HH:mm',
  RELATIVE: 'relative', // '2 minutes ago', 'Yesterday', etc.
};

export const FILE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  FILE: 20 * 1024 * 1024, // 20MB
};

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  FILE: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
};

export const EMOJI_CATEGORIES = [
  { name: 'smileys', emoji: '😀' },
  { name: 'people', emoji: '👋' },
  { name: 'animals', emoji: '🐶' },
  { name: 'food', emoji: '🍎' },
  { name: 'travel', emoji: '✈️' },
  { name: 'activities', emoji: '⚽' },
  { name: 'objects', emoji: '💡' },
  { name: 'symbols', emoji: '❤️' },
  { name: 'flags', emoji: '🏁' },
];

export default {
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  CALL_TYPES,
  CALL_STATUS,
  CHAT_FILTERS,
  SIDEBAR_TABS,
  USER_STATUS,
  SOCKET_EVENTS,
  API_ENDPOINTS,
  LOCAL_STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  NOTIFICATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  TIME_FORMATS,
  FILE_LIMITS,
  ALLOWED_FILE_TYPES,
  EMOJI_CATEGORIES,
};