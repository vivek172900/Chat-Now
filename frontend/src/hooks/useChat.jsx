import { useState, useRef, useEffect, useCallback } from 'react';
import { authAPI, chatAPI, messageAPI } from '../services/api';
import { initializeSocket, socketEmit } from '../services/socket';

export const useChat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChatState] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        const initSocket = async () => {
          try {
            const socketInstance = await initializeSocket();
            setSocket(socketInstance);
            console.log('Socket initialized successfully');
          } catch (error) {
            console.error('Failed to initialize socket:', error);
          }
        };
        
        initSocket();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === data.message._id);
          if (exists) return prev;
          
          const updated = [...prev, data.message];
          
          if (data.message.sender && data.message.sender._id !== currentUser._id) {
            setTimeout(() => {
              markMessageAsRead(data.message._id);
            }, 500);
          }
          
          return updated;
        });
        scrollToBottom();
      }
      
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat._id === data.chatId) {
            return {
              ...chat,
              latestMessage: data.message,
              unreadCount: (selectedChat?._id === data.chatId || (data.message.sender && data.message.sender._id === currentUser._id)) 
                ? 0 
                : (chat.unreadCount || 0) + 1,
              updatedAt: new Date().toISOString()
            };
          }
          return chat;
        });
        
        return updated.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    const handleMessageRead = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { 
              ...msg, 
              status: data.status,
              readBy: [...(msg.readBy || []).filter(r => r.user !== data.readBy), { 
                user: data.readBy, 
                readAt: new Date() 
              }]
            }
          : msg
      ));
    };

    const handleTyping = (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.chatId]: {
          ...prev[data.chatId],
          [data.userId]: data.isTyping ? data.timestamp : null
        }
      }));
      
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const chatTyping = { ...prev[data.chatId] };
            delete chatTyping[data.userId];
            return {
              ...prev,
              [data.chatId]: chatTyping
            };
          });
        }, 3000);
      }
    };

    const handleUserStatusChange = (data) => {
      setUsers(prev => prev.map(user => 
        user._id === data.userId 
          ? { ...user, isOnline: data.isOnline, lastSeen: data.lastSeen }
          : user
      ));
      
      setChats(prev => prev.map(chat => ({
        ...chat,
        participants: chat.participants.map(participant => 
          participant._id === data.userId
            ? { ...participant, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : participant
        )
      })));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('typing_indicator', handleTyping);
    socket.on('user_status_change', handleUserStatusChange);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('typing_indicator', handleTyping);
      socket.off('user_status_change', handleUserStatusChange);
    };
  }, [socket, selectedChat, currentUser]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const response = await authAPI.searchUsers(search);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const getOrCreateChat = useCallback(async (userId) => {
    try {
      const response = await chatAPI.getOrCreateChat(userId);
      if (response.data.success) {
        return response.data.chat;
      }
    } catch (error) {
      console.error('Error getting/creating chat:', error);
    }
    return null;
  }, []);

  const fetchMessages = useCallback(async (chatId, page = 1) => {
    try {
      setIsLoading(true);
      const response = await messageAPI.getChatMessages(chatId, page);
      if (response.data.success) {
        const newMessages = response.data.messages;
        if (page === 1) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
        scrollToBottom();
        return response.data.pagination;
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      if (socket) {
        socketEmit.markAsRead(socket, messageId);
      }
      await messageAPI.markAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [socket]);

  const markAllMessagesAsRead = useCallback(async (chatId) => {
    try {
      if (socket) {
        socketEmit.markAllAsRead(socket, chatId);
      }
      
      setMessages(prev => prev.map(msg => ({
        ...msg,
        status: 'seen',
        readBy: msg.readBy?.some(read => 
          read.user?._id === currentUser?._id || read.user === currentUser?._id
        ) 
          ? msg.readBy 
          : [...(msg.readBy || []), { 
              user: currentUser, 
              readAt: new Date().toISOString() 
            }]
      })));
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      ));
      
      return true;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      return false;
    }
  }, [socket, currentUser]);

  const handleSelectChat = useCallback(async (chat) => {
    if (!chat || !chat._id) return;
    
    setSelectedChatState(chat);
    await fetchMessages(chat._id);
    
    if (chat.unreadCount > 0) {
      await markAllMessagesAsRead(chat._id);
    }
    
    scrollToBottom();
  }, [fetchMessages, markAllMessagesAsRead]);

  const sendMessage = useCallback(async (chatId, content, messageType = 'text', mediaUrl = null) => {
    if (!content.trim() && !mediaUrl) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage = {
      _id: tempId,
      chatId,
      content,
      messageType,
      mediaUrl,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    try {
      const response = await messageAPI.sendMessage({
        chatId,
        content,
        messageType,
        mediaUrl
      });
      
      if (response.data.success) {
        const realMessage = response.data.message;
        
        setMessages(prev => prev.map(msg => msg._id === tempId ? realMessage : msg));
        
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? {
                ...chat,
                latestMessage: realMessage,
                updatedAt: new Date().toISOString()
              }
            : chat
        ));
        
        if (socket) {
          socketEmit.sendMessage(socket, realMessage);
        }
        
        scrollToBottom();
        return realMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
    return null;
  }, [socket, currentUser]);

  const updateChatPreference = useCallback(async (chatId, preference) => {
    try {
      const response = await chatAPI.updateChatPreference(chatId, preference);
      if (response.data.success) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, preference: response.data.preference }
            : chat
        ));
        if (selectedChat?._id === chatId) {
          setSelectedChatState(prev => ({
            ...prev,
            preference: response.data.preference
          }));
        }
        return response.data.preference;
      }
    } catch (error) {
      console.error('Error updating chat preference:', error);
    }
    return null;
  }, [selectedChat]);

  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    if (socket) {
      socketEmit.typing(socket, chatId, isTyping);
    }
  }, [socket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getTotalUnreadCount = useCallback(() => {
    return chats.reduce((total, chat) => {
      if (chat._id !== selectedChat?._id && !chat.preference?.isArchived) {
        return total + (chat.unreadCount || 0);
      }
      return total;
    }, 0);
  }, [chats, selectedChat]);

  const getFilteredChats = useCallback(() => {
    switch (activeTab) {
      case 'archive':
        return chats.filter(chat => chat.preference?.isArchived);
      case 'favorites':
        return chats.filter(chat => chat.preference?.isFavorite);
      case 'locked':
        return chats.filter(chat => chat.preference?.locked);
      default:
        return chats.filter(chat => !chat.preference?.isArchived);
    }
  }, [chats, activeTab]);

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        fetchUserChats(activeTab);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser, activeTab, fetchUserChats]);

  useEffect(() => {
    if (currentUser) {
      if (activeTab === 'users') {
        fetchUsers();
      } else {
        fetchUserChats(activeTab);
      }
    }
  }, [currentUser, activeTab, fetchUserChats, fetchUsers]);

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
    getOrCreateChat,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    updateChatPreference,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
  };
};