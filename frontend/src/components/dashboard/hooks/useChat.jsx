import { useState, useRef, useEffect } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [conversationPreviews, setConversationPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [userStatuses, setUserStatuses] = useState(new Map());
  const [openDropdown, setOpenDropdown] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const currentUser = {
    email: localStorage.getItem("Email"),
    fullname: localStorage.getItem("Fullname"),
    username: localStorage.getItem("Username"),
    userId: localStorage.getItem("Email")
  };

  // Fetch total unread count for the current user
  const fetchTotalUnreadCount = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/getTotalUnreadCount/${currentUser.email}`);
      if (response.ok) {
        const data = await response.json();
        setTotalUnreadCount(data.totalUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching total unread count:', error);
    }
  };

  // Mark messages as read when opening a conversation
  const markMessagesAsRead = async (otherUserEmail) => {
    try {
      const response = await fetch('http://localhost:9000/api/markMessagesAsRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderid: currentUser.email,
          receiverid: otherUserEmail
        })
      });

      if (response.ok) {
        console.log('Messages marked as read for:', otherUserEmail);
      }

      fetchTotalUnreadCount();
      // Don't pass activeTab parameter
      fetchConversationPreviews();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchConversationPreviews = async (activeTab = 'chats') => {
    try {
      console.log('Fetching conversations for user:', currentUser.email);
      console.log('Active tab:', activeTab);

      let filter = 'unarchived';
      if (activeTab === 'archive') filter = 'archived';
      else if (activeTab === 'favorites') filter = 'favorites';
      else if (activeTab === 'locked') filter = 'locked';

      const conversationsResponse = await fetch(
        `http://localhost:9000/api/getConversationsWithMessages/${currentUser.email}?filter=${filter}`
      );

      console.log('API Response status:', conversationsResponse.status);

      if (conversationsResponse.ok) {
        const data = await conversationsResponse.json();
        console.log('API response data - total conversations:', data.conversations.length);
        console.log('Filter applied:', filter);

        const validPreviews = data.conversations
          .filter(conv => conv.otherMember)
          .map(conv => ({
            conversation: conv,
            user: {
              user: conv.otherMember,
              userid: conv.otherMember._id || conv.otherMember.email
            },
            lastMessage: conv.latestMessage,
            unreadCount: conv.unreadCount || 0,
            totalMessages: conv.totalMessages || 0,
            hasMessages: conv.hasMessages || false,
            userSettings: conv.userSettings || {
              archived: false,
              locked: false,
              favorite: false
            }
          }))
          .sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
          });

        console.log('Processed conversation previews:', validPreviews.length);
        setConversationPreviews(validPreviews);
      } else {
        console.error('API request failed:', conversationsResponse.status, conversationsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversation previews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (userId) => {
    if (!currentUser.userId || !userId) return;

    try {
      console.log('Fetching messages for conversation with:', userId);
      const response = await fetch('http://localhost:9000/api/getmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderid: currentUser.userId,
          receiverid: userId
        })
      });

      if (response.ok) {
        const fetchedMessages = await response.json();
        console.log('Fetched messages count:', fetchedMessages.length);
        const formattedMessages = fetchedMessages.map((msg) => ({
          id: msg._id,
          text: msg.message,
          sender: msg.senderid,
          timestamp: msg.timestamp,
          isOwn: msg.senderid === currentUser.userId,
          isRead: msg.msgRead === 'yes'
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async (messageText, selectedChat, socket) => {
    console.log('Sending message to:', selectedChat.user.email);

    // Always create conversation when sending first message
    try {
      const createConvResponse = await fetch('http://localhost:9000/api/createConversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderid: currentUser.email,
          receiverid: selectedChat.user.email
        })
      });

      if (createConvResponse.ok) {
        const data = await createConvResponse.json();
        console.log('Conversation creation response:', data.message);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }

    // Send the message
    const newMessage = {
      id: Date.now(),
      text: messageText.trim(),
      sender: currentUser.userId,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, newMessage]);

    socket.emit('sendone2oneMSG', {
      senderid: currentUser.userId,
      receiverid: selectedChat.user.email,
      message: messageText.trim()
    });

    // Refresh conversation list after sending message
    setTimeout(() => {
      fetchConversationPreviews();
    }, 500);
  };

  const updateConversationSettings = async (conversationId, settings) => {
    try {
      console.log('Updating conversation settings:', { conversationId, settings });
      const response = await fetch('http://localhost:9000/api/updateConversationSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationId,
          userId: currentUser.email,
          settings: settings
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Settings updated:', data.message);
        fetchConversationPreviews();
        return data;
      }
    } catch (error) {
      console.error('Error updating conversation settings:', error);
    }
  };

  return {
    messages,
    conversationPreviews,
    isLoading,
    totalUnreadCount,
    userStatuses,
    openDropdown,
    messagesEndRef,
    messagesContainerRef,
    fetchConversationPreviews,
    fetchTotalUnreadCount,
    markMessagesAsRead,
    fetchMessages,
    sendMessage,
    updateConversationSettings,
    setOpenDropdown,
    setIsLoading
  };
};