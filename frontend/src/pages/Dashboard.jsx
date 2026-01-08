import React, { useEffect, useState, useCallback } from 'react';
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
    fetchUserChats,
    getOrCreateChat,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    updateChatPreference,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
  } = useChat();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchCurrentUser();
    }
  }, [navigate, fetchCurrentUser]);

  const handleChatSelect = useCallback(async (chat) => {
    try {
      await setSelectedChat(chat);
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  }, [setSelectedChat]);

  const handleUserSelect = async (user) => {
    try {
      const chat = await getOrCreateChat(user._id);
      if (chat) {
        await handleChatSelect(chat);
        setActiveTab('chats');
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(selectedChat._id, message);
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (selectedChat) {
      sendTypingIndicator(selectedChat._id, isTyping);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (activeTab === 'users') {
      fetchUsers(query);
    }
  };

  useEffect(() => {
    return () => {
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

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
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Welcome to ChatApp</h3>
            <p className="text-gray-400 max-w-md mb-6">
              Select a conversation from the list to start messaging, 
              or find users in the Users tab to start a new chat.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setActiveTab('chats')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Chats
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
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