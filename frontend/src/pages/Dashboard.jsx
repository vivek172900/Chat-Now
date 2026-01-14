import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatArea from '../components/ChatArea';

const Dashboard = () => {
  const navigate = useNavigate();

  const {
    currentUser,
    chats,
    users,
    isLoading,
    selectedChat,
    activeTab,
    messages,
    typingUsers,
    messagesEndRef,
    messagesContainerRef,
    setSelectedChat,
    setActiveTab,
    fetchCurrentUser,
    fetchUsers,
    getOrCreateChat,
    sendMessage,
    updateChatPreference,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
  } = useChat();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef(null);

  /* ======================
     AUTH CHECK
  ====================== */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchCurrentUser();
    }
  }, [navigate, fetchCurrentUser]);

  /* ======================
     CHAT SELECTION
  ====================== */
  const handleChatSelect = useCallback(
    async (chat) => {
      if (!chat?._id) return;
      await setSelectedChat(chat);
      scrollToBottom();
    },
    [setSelectedChat, scrollToBottom]
  );

  const handleUserSelect = async (user) => {
    if (!user?._id) return;
    const chat = await getOrCreateChat(user._id);
    if (chat) {
      await handleChatSelect(chat);
      setActiveTab('chats');
      setSearchQuery('');
    }
  };

  /* ======================
     MESSAGE SEND
  ====================== */
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(selectedChat._id, message.trim());
      setMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  /* ======================
     TYPING INDICATOR (FIXED)
  ====================== */
  const handleTyping = (value) => {
    if (!selectedChat) return;

    sendTypingIndicator(selectedChat._id, value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(selectedChat._id, false);
    }, 1200);
  };

  /* ======================
     ENTER KEY SEND
  ====================== */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ======================
     SEARCH
  ====================== */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (activeTab === 'users') {
      fetchUsers(query);
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  /* ======================
     CLEANUP
  ====================== */
  useEffect(() => {
    return () => {
      if (selectedChat) {
        sendTypingIndicator(selectedChat._id, false);
      }
      clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChat, sendTypingIndicator]);

  /* ======================
     LOADING STATE
  ====================== */
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="h-screen bg-gray-900 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUnreadCount={getTotalUnreadCount()}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <ChatList
        activeTab={activeTab}
        chats={chats}
        users={users}
        isLoading={isLoading}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onChatSelect={handleChatSelect}
        onUserSelect={handleUserSelect}
        onUpdateChatPreference={updateChatPreference}
        currentUser={currentUser}
      />

      {selectedChat ? (
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          currentUser={currentUser}
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          onTyping={handleTyping}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          scrollToBottom={scrollToBottom}
          isSending={isSending}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-800 text-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Welcome to ChatApp
            </h3>
            <p className="text-gray-400 max-w-md mb-6">
              Select a chat or search users to start messaging.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('chats')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                View Chats
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Find Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
