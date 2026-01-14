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

  // Mark unread messages in a chat as read
  const markChatRead = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      const res = await messageAPI.markChatAsRead(chatId);
      if (res.data && res.data.success) {
        const updatedIds = (res.data.messageIds || []).map(id => id.toString());

        const currentUserId = currentUserRef.current?._id || currentUserRef.current;
        if (!currentUserId) {
          // no current user known yet; still clear unread count
          setChats(prev => prev.map(c => (c._id === chatId ? { ...c, unreadCount: 0 } : c)));
          return;
        }

        setMessages(prev =>
          prev.map(m => {
            // normalize ids to string
            const mid = m._id && m._id.toString ? m._id.toString() : m._id;
            const senderId = m.sender && (m.sender._id || m.sender);
            if (updatedIds.includes(mid) || senderId === currentUserId) {
              // avoid duplicate readBy entries
              const already = (m.readBy || []).some(r => {
                const uid = r.user && r.user.toString ? r.user.toString() : r.user;
                const cu = currentUserId && currentUserId.toString ? currentUserId.toString() : currentUserId;
                return uid === cu;
              });
              if (already) return m;
              return { ...m, readBy: [...(m.readBy || []), { user: currentUserId, readAt: new Date() }] };
            }
            return m;
          })
        );

        // Clear unread count for this chat
        setChats(prev => prev.map(c => (c._id === chatId ? { ...c, unreadCount: 0 } : c)));
      }
    } catch (err) {
      console.error('Mark chat read failed:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) return;

    const user = JSON.parse(userData);
    setCurrentUser(user);

    let socketInstance;
    const init = async () => {
      try {
        socketInstance = initializeSocket();
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
            return activeChat && activeChat._id === chatId ? [...prev, message] : prev;
          });

          // Update chats list; if chat exists, update it, otherwise add it
          setChats(prev => {
            const found = prev.find(c => c._id === chatId);
            if (found) {
              return prev.map(chat =>
                chat._id === chatId
                  ? {
                      ...chat,
                      latestMessage: message,
                      unreadCount:
                        activeChat && activeChat._id === chatId ? 0 : (chat.unreadCount || 0) + 1,
                    }
                  : chat
              );
            }

            // Chat not found locally, fetch or add placeholder
            const newChatPlaceholder = {
              _id: chatId,
              participants: [],
              latestMessage: message,
              unreadCount: activeChat && activeChat._id === chatId ? 0 : 1,
              preference: { isArchived: false, isFavorite: false }
            };

            return [newChatPlaceholder, ...prev];
          });

          // If this message is received by this client (i.e., not sent by this client), emit delivery ack
          try {
            const myId = currentUserRef.current?._id || currentUserRef.current;
            const senderId = message?.sender?._id || message?.sender;
            if (myId && senderId && senderId.toString() !== myId.toString()) {
              // tell server we received it
              socketEmit.delivered(message._id || message._id?.toString());
            }
          } catch (err) {
            // ignore
          }
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
                    status: 'seen'
                  }
                : msg
            )
          );
        });

        // Handle delivered ack
        socketInstance.on('message_delivered', ({ messageId, deliveredBy }) => {
          setMessages(prev =>
            prev.map(msg =>
              msg._id === messageId
                ? { ...msg, status: msg.status === 'seen' ? 'seen' : 'delivered' }
                : msg
            )
          );
        });

        // Handle bulk reads
        socketInstance.on('messages_read', ({ chatId: ridChatId, messageIds, readBy }) => {
          const ids = (messageIds || []).map(id => id.toString());
          setMessages(prev => prev.map(m => ids.includes(m._id?.toString ? m._id.toString() : m._id) ? { ...m, readBy: [...(m.readBy || []), readBy], status: 'seen' } : m));

          // Clear unread count for that chat
          setChats(prev => prev.map(c => (c._id === ridChatId ? { ...c, unreadCount: 0 } : c)));
        });

        // Handle chat cleared events
        socketInstance.on('chat_cleared', ({ chatId }) => {
          // If this chat is currently selected, clear messages
          if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
            setMessages([]);
          }
          // Clear latestMessage and unread counts
          setChats(prev => prev.map(c => (c._id === chatId ? { ...c, latestMessage: null, unreadCount: 0 } : c)));
        });

        // Handle new chat events (created by another user or via sendMessage)
        socketInstance.on('new_chat', ({ chat }) => {
          // Only add if not already present
          setChats(prev => {
            if (prev.some(c => c._id === chat._id)) return prev;
            return [{ ...chat, unreadCount: chat.unreadCount || 0 }, ...prev];
          });
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

          // If someone is typing in the currently selected chat, mark unread messages as read
          if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
            markChatRead(chatId);
          }
        });
      } catch (err) {
        console.error('Socket init failed:', err);
      }
    };

    init();

    return () => {
      socketInstance?.disconnect();
    };
  }, [markChatRead]);

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
      console.log('fetchUserChats response:', response?.data);
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
          // If chat was created server-side, ensure it's in the chat list
          if (res.data.chat) {
            setChats(prev => {
              if (prev.some(c => c._id === res.data.chat._id)) return prev;
              return [{ ...res.data.chat }, ...prev];
            });
            // If we weren't already selected into this chat, select it now
            if (!selectedChatRef.current || selectedChatRef.current._id !== res.data.chat._id) {
              await setSelectedChat(res.data.chat);
            }
          }

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

    // mark messages as read when the chat is selected
    markChatRead(chat._id);

    socketEmit.joinChat(chat._id);
  }, [fetchMessages, markChatRead]);

  const getOrCreateChat = useCallback(async (userId) => {
    try {
      const res = await chatAPI.getOrCreateChat(userId);
      if (res.data.success) {
        const chat = res.data.chat;
        // Ensure chat is present in local state
        setChats(prev => {
          if (prev.some(c => c._id === chat._id)) return prev;
          return [ { ...chat }, ...prev ];
        });
        return chat;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }, []);

  // Clear all messages in a chat
  const clearChat = useCallback(async (chatId) => {
    if (!chatId) return { success: false };
    try {
      const res = await messageAPI.clearChat(chatId);
      if (res.data && res.data.success) {
        // clear local state for the chat
        setMessages([]);
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, latestMessage: null, unreadCount: 0 } : c));
        return { success: true };
      }
    } catch (err) {
      console.error('Clear chat failed:', err);
    }
    return { success: false };
  }, []);

  const updateChatPreference = useCallback(async (chatId, preference) => {
    try {
      const res = await chatAPI.updateChatPreference(chatId, preference);
      if (res.data && res.data.success) {
        const pref = res.data.preference;
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, preference: pref } : c));
        if (selectedChat && selectedChat._id === chatId) setSelectedChat(prev => ({ ...prev, preference: pref }));
        return { success: true, preference: pref };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  }, [selectedChat]);

  // Update user profile (username, profilePic, wallpaper)
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.data && res.data.success) {
        const updatedUser = res.data.user;
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update participant references in chats and selectedChat so UI reflects changed profile immediately
        setChats(prev => prev.map(c => ({
          ...c,
          participants: c.participants?.map(p => p._id === updatedUser._id ? { ...p, username: updatedUser.username, profilePic: updatedUser.profilePic } : p)
        })));

        setSelectedChat(prev => prev ? ({
          ...prev,
          participants: prev.participants?.map(p => p._id === updatedUser._id ? { ...p, username: updatedUser.username, profilePic: updatedUser.profilePic } : p)
        }) : prev);

        return { success: true, user: updatedUser };
      }
    } catch (err) {
      console.error('Update profile failed:', err);
    }
    return { success: false };
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
    if (activeTab === 'archive') return chats.filter(c => c.preference?.isArchived && !c.preference?.locked);
    if (activeTab === 'favorites') return chats.filter(c => c.preference?.isFavorite);
    return chats.filter(c => !c.preference?.isArchived);
  }, [chats, activeTab]);

  // Delete a chat and remove it from local state
  const deleteChat = useCallback(async (chatId) => {
    try {
      const res = await chatAPI.deleteChat(chatId);
      if (res.data && res.data.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Delete chat failed:', err);
    }
    return { success: false };
  }, [selectedChat]);

  // Set PIN
  const setPin = useCallback(async (pin) => {
    try {
      const res = await authAPI.setPin(pin);
      if (res.data && res.data.success) {
        // Refresh current user to get hasPin true
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (err) {
      console.error('Set PIN failed:', err);
      throw err;
    }
    return { success: false };
  }, [fetchCurrentUser]);

  // Verify PIN
  const verifyPin = useCallback(async (pin) => {
    try {
      const res = await authAPI.verifyPin(pin);
      if (res.data && res.data.success) return { success: true };
    } catch (err) {
      console.error('Verify PIN failed:', err);
      throw err;
    }
    return { success: false };
  }, []);


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
    clearChat,
    updateUserProfile,
    markMessageAsRead,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
    markChatRead,
    // New helpers
    setPin,
    verifyPin,
    deleteChat,
  };
};