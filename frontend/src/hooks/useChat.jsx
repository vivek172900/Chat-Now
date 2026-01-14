import { useState, useRef, useEffect, useCallback } from 'react';
import { authAPI, chatAPI, messageAPI } from '../services/api';
import { initializeSocket, socketEmit } from '../services/socket';

export const useChat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedChatRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);



  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) return;

    const user = JSON.parse(userData);
    setCurrentUser(user);

    const init = async () => {
      try {
        const socketInstance = initializeSocket();
        setSocket(socketInstance);

        socketInstance.on('new_message', ({ chatId, message, clientId }) => {
          const activeChat = selectedChatRef.current;

          // Handle messages array: prefer replacing an optimistic (temp) message if clientId matches
          setMessages(prev => {
            // If server message already exists, do nothing
            if (prev.some(m => m._id === message._id)) return prev;

            // If clientId provided and a temp message exists, replace it
            if (clientId) {
              const idx = prev.findIndex(m => m._id === clientId);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = message;
                return updated;
              }
            }

            // Otherwise append
            return activeChat?._id === chatId ? [...prev, message] : prev;
          });

          // Update chats list
          setChats(prev =>
            prev.map(chat =>
              chat._id === chatId
                ? {
                    ...chat,
                    latestMessage: message,
                    unreadCount:
                      activeChat?._id === chatId ? 0 : (chat.unreadCount || 0) + 1,
                  }
                : chat
            )
          );
        });

        socketInstance.on('message_read', ({ messageId, readBy }) => {
          setMessages(prev =>
            prev.map(msg =>
              msg._id === messageId
                ? {
                    ...msg,
                    readBy: [
                      ...(msg.readBy || []),
                      { user: readBy, readAt: new Date() },
                    ],
                  }
                : msg
            )
          );
        });

        socketInstance.on('typing_indicator', ({ chatId, userId, isTyping }) => {
          if (!isTyping) {
            setTypingUsers(prev => {
              const updated = { ...prev };
              if (updated[chatId]) {
                delete updated[chatId][userId];
              }
              return updated;
            });
            return;
          }
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: {
              ...prev[chatId],
              [userId]: Date.now(),
            },
          }));
        });
      } catch (err) {
        console.error('Socket init failed:', err);
      }
    };

    init();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await authAPI.getCurrentUser();
      if (res.data.success) {
        setCurrentUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const res = await authAPI.searchUsers(search);
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUserChats = useCallback(async (filter = 'all') => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getUserChats(filter);
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user chats when current user is set
  useEffect(() => {
    if (currentUser) {
      fetchUserChats();
    }
  }, [currentUser, fetchUserChats]);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      const res = await messageAPI.getChatMessages(chatId);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (chatId, content) => {
      if (!content.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const tempMsg = {
        _id: tempId,
        content,
        sender: currentUserRef.current,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };

      setMessages(prev => [...prev, tempMsg]);

      try {
        // include clientId so server can echo it back and we can replace the temp message cleanly
        const res = await messageAPI.sendMessage({ chatId, content, clientId: tempId });
        if (res.data.success) {
          // If server already sent us the message via socket and replaced the temp, this will no-op
          setMessages(prev =>
            prev.map(m => (m._id === tempId ? res.data.message : m))
          );
          // No need to emit via socket here - backend emits when message is saved
        }
      } catch (err) {
        setMessages(prev =>
          prev.map(m => (m._id === tempId ? { ...m, status: 'failed' } : m))
        );
      }
    },
    []
  );

  const markMessageAsRead = useCallback(
    async (messageId) => {
      try {
        socketEmit.markAsRead(messageId);
        await messageAPI.markAsRead(messageId);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const sendTypingIndicator = useCallback(
    (chatId, isTyping) => {
      socketEmit.typing(chatId, isTyping);
    },
    []
  );

  const handleSelectChat = useCallback(async (chat) => {
    if (!chat?._id) return;
    setSelectedChat(chat);
    await fetchMessages(chat._id);
    setChats(prev =>
      prev.map(c => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
    );
    socketEmit.joinChat(chat._id);
  }, [fetchMessages]);

  const getOrCreateChat = useCallback(async (userId) => {
    try {
      const res = await chatAPI.getOrCreateChat(userId);
      if (res.data.success) {
        return res.data.chat;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }, []);

  const updateChatPreference = useCallback(async (chatId, preference) => {
    try {
      await chatAPI.updateChatPreference(chatId, preference);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const getTotalUnreadCount = useCallback(
    () =>
      chats.reduce(
        (t, c) =>
          c._id !== selectedChat?._id && !c.preference?.isArchived
            ? t + (c.unreadCount || 0)
            : t,
        0
      ),
    [chats, selectedChat]
  );

  const getFilteredChats = useCallback(() => {
    if (activeTab === 'archive') return chats.filter(c => c.preference?.isArchived);
    if (activeTab === 'favorites') return chats.filter(c => c.preference?.isFavorite);
    return chats.filter(c => !c.preference?.isArchived);
  }, [chats, activeTab]);

  return {
    currentUser,
    messages,
    chats: getFilteredChats(),
    users,
    isLoading,
    selectedChat,
    activeTab,
    socket,
    typingUsers,
    messagesEndRef,
    messagesContainerRef,
    setSelectedChat: handleSelectChat,
    setActiveTab,
    fetchCurrentUser,
    fetchUsers,
    fetchUserChats,
    fetchMessages,
    sendMessage,
    getOrCreateChat,
    updateChatPreference,
    markMessageAsRead,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
  };
};