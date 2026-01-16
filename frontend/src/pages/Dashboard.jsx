import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import PinModal from '../components/auth/PinModal';
import ChatList from '../components/chatList/ChatList';
import ChatArea from '../components/chatArea/ChatArea';
import SettingsPanel from '../components/userSettings/SettingsPanel';

const themes = {
  default: {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-700',
    text: 'text-white',
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bubbleOther: 'bg-gray-700',
    textUser: 'text-white',
    textOther: 'text-white'
  },
  dark: {
    primary: 'bg-gray-800',
    secondary: 'bg-gray-900',
    text: 'text-gray-100',
    bubbleUser: 'bg-gradient-to-r from-gray-700 to-gray-800',
    bubbleOther: 'bg-gray-800',
    textUser: 'text-white',
    textOther: 'text-white'
  },
  sunrise: {
    primary: 'bg-orange-500',
    secondary: 'bg-amber-50',
    text: 'text-gray-900',
    bubbleUser: 'bg-gradient-to-r from-orange-400 to-orange-500',
    bubbleOther: 'bg-amber-100',
    textUser: 'text-white',
    textOther: 'text-gray-900'
  },
  ocean: {
    primary: 'bg-blue-400',
    secondary: 'bg-blue-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-gradient-to-r from-blue-400 to-blue-500',
    bubbleOther: 'bg-blue-100',
    textUser: 'text-white',
    textOther: 'text-gray-800'
  },
  forest: {
    primary: 'bg-green-600',
    secondary: 'bg-emerald-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-gradient-to-r from-green-500 to-green-600',
    bubbleOther: 'bg-emerald-100',
    textUser: 'text-white',
    textOther: 'text-gray-800'
  },
  'purple-dream': {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-gradient-to-r from-purple-500 to-purple-600',
    bubbleOther: 'bg-purple-100',
    textUser: 'text-white',
    textOther: 'text-gray-800'
  },
  midnight: {
    primary: 'bg-indigo-900',
    secondary: 'bg-gray-900',
    text: 'text-gray-100',
    bubbleUser: 'bg-gradient-to-r from-indigo-800 to-indigo-900',
    bubbleOther: 'bg-gray-800',
    textUser: 'text-white',
    textOther: 'text-white'
  },
  minimal: {
    primary: 'bg-gray-200',
    secondary: 'bg-white',
    text: 'text-gray-900',
    bubbleUser: 'bg-gradient-to-r from-gray-200 to-gray-300',
    bubbleOther: 'bg-gray-100',
    textUser: 'text-gray-900',
    textOther: 'text-gray-900'
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
    sendFileMessage,
    updateChatPreference,
    updateGroupChat,
    sendTypingIndicator,
    scrollToBottom,
    getTotalUnreadCount,
    markChatRead,
    clearChat,
    updateUserProfile,
    setPin,
    verifyPin,
    deleteChat,
    createGroupChat
  } = useChat();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [isLoadingUsersForModal, setIsLoadingUsersForModal] = useState(false);

  const typingTimeoutRef = useRef(null);
  const currentTheme = themes[currentUser?.messageTheme || 'default'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchCurrentUser();
    }
  }, [navigate, fetchCurrentUser]);

  useEffect(() => {
    if (currentUser && !currentUser.userId) {
      navigate('/setup-user-id');
    }
  }, [currentUser, navigate]);

  const handleChatSelect = useCallback(
    async (chat) => {
      if (!chat?._id) return;
      await setSelectedChat(chat);
      scrollToBottom();
    },
    [setSelectedChat, scrollToBottom]
  );

  const [pinModal, setPinModal] = useState({ open: false, mode: 'verify', callback: null });
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);

  const openPinSetup = (callback) => setPinModal({ open: true, mode: 'setup', callback });
  const openPinVerify = (callback) => setPinModal({ open: true, mode: 'verify', callback });
  const closePinModal = () => setPinModal({ open: false, mode: 'verify', callback: null });

  const handleSetPin = async (pin) => {
    await setPin(pin);
    closePinModal();
    if (typeof pinModal.callback === 'function') pinModal.callback();
  };

  const handleVerifyPin = async (pin) => {
    const res = await verifyPin(pin);
    if (res && res.success) {
      closePinModal();
      if (typeof pinModal.callback === 'function') pinModal.callback(true);
      return true;
    }
    throw new Error('Invalid PIN');
  };

  const handleSetActiveTab = (target) => {
    if (target !== 'archive') {
      setArchiveUnlocked(false);
      setActiveTab(target);
      return;
    }

    if (archiveUnlocked) {
      setActiveTab('archive');
      return;
    }

    if (!currentUser?.hasPin) {
      openPinSetup(() => {
        setArchiveUnlocked(true);
        setActiveTab('archive');
      });
      return;
    }

    openPinVerify(() => {
      setArchiveUnlocked(true);
      setActiveTab('archive');
    });
  };

  const handleDeleteChat = async (chatId) => {
    const res = await deleteChat(chatId);
    if (!res.success) alert('Failed to delete chat');
  };

  const handleRequestSetPin = (chatId) => {
    openPinSetup(async () => {
      await updateChatPreference(chatId, { locked: true });
    });
  };

  const handleRequestVerifyPin = async (chatId) => {
    return new Promise((resolve) => {
      openPinVerify(async (ok) => {
        if (ok) {
          await updateChatPreference(chatId, { locked: false });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  };

  const handleUserSelect = async (user) => {
    if (!user?._id) return;
    const chat = await getOrCreateChat(user._id);
    if (chat) {
      await handleChatSelect(chat);
      setActiveTab('chats');
      setSearchQuery('');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(selectedChat._id, message.trim());
      setMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFile = async (file) => {
    if (!selectedChat || isSending) return;
    setIsSending(true);
    try {
      await sendFileMessage(selectedChat._id, file);
      scrollToBottom();
    } catch (err) {
      console.error('File upload error:', err);
      alert(`Failed to upload file: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (value) => {
    if (!selectedChat) return;
    sendTypingIndicator(selectedChat._id, value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(selectedChat._id, false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (activeTab === 'users') fetchUsers(query);
  };

  const handleLogout = async () => {
    localStorage.clear();
    await signOut();
    navigate('/');
  };

  const handleOpenGroupModal = async () => {
    console.log('Opening group modal, current users count:', users.length);
    
    // If users are not loaded yet, fetch them first
    if (users.length === 0) {
      setIsLoadingUsersForModal(true);
      try {
        console.log('Fetching users for group modal...');
        await fetchUsers(''); // Fetch all users
        console.log('Users fetched successfully');
      } catch (error) {
        console.error('Failed to fetch users:', error);
        alert('Failed to load users. Please try again.');
        return;
      } finally {
        setIsLoadingUsersForModal(false);
      }
    }
    
    setOpenGroup(true);
  };

  useEffect(() => {
    return () => {
      if (selectedChat) sendTypingIndicator(selectedChat._id, false);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChat, sendTypingIndicator]);

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

  const getDisplayId = (user) => {
    if (!user) return 'Unknown';
    return user?.userId || user?._id?.slice(-8) || 'Unknown';
  };

  const getDisplayAvatar = (user) => {
    if (!user) return 'U';
    const displayId = user?.userId || user?._id || 'U';
    return displayId.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        totalUnreadCount={getTotalUnreadCount()}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      {pinModal.open && (
        <PinModal
          mode={pinModal.mode}
          onConfirm={pinModal.mode === 'setup' ? handleSetPin : handleVerifyPin}
          onCancel={closePinModal}
        />
      )}

      {isLoadingUsersForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading users for group creation...</p>
          </div>
        </div>
      )}

      {activeTab !== 'settings' && (
        <ChatList
          activeTab={activeTab}
          chats={chats}
          users={users}
          fetchUsers={fetchUsers}
          isLoading={isLoading}
          selectedChat={selectedChat}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onChatSelect={handleChatSelect}
          onUserSelect={handleUserSelect}
          onUpdateChatPreference={updateChatPreference}
          onDeleteChat={handleDeleteChat}
          onRequestSetPin={handleRequestSetPin}
          onRequestVerifyPin={handleRequestVerifyPin}
          currentUser={currentUser}
          currentTheme={currentTheme}
          onCreateGroup={createGroupChat}
          openGroup={openGroup}
          setOpenGroup={setOpenGroup}
          handleOpenGroupModal={handleOpenGroupModal}
        />
      )}

      {activeTab === 'settings' ? (
        <div className="flex-1">
          <SettingsPanel currentUser={currentUser} updateUserProfile={updateUserProfile} />
        </div>
      ) : selectedChat ? (
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          currentUser={currentUser}
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onKeyPress={handleKeyPress}
          onTyping={handleTyping}
          markChatRead={markChatRead}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          scrollToBottom={scrollToBottom}
          isSending={isSending}
          onUpdateChatPreference={updateChatPreference}
          onClearChat={clearChat}
          onUpdateGroupChat={updateGroupChat}
          users={users}
          currentTheme={currentTheme}
          getDisplayId={getDisplayId}
          getDisplayAvatar={getDisplayAvatar}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-900 text-center">
          <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Welcome to ChatApp</h3>
            <p className="text-gray-400 max-w-md mb-6">Select a chat or search users to start messaging.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setActiveTab('chats')} className={`px-4 py-2 ${currentTheme.primary} text-white rounded-lg hover:opacity-90 transition-opacity`}>
                View Chats
              </button>
              <button onClick={() => setActiveTab('users')} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
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