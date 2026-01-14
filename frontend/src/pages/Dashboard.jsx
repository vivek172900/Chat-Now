import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import PinModal from '../components/auth/PinModal';
import ChatList from '../components/chatList/ChatList';
import ChatArea from '../components/chatArea/ChatArea';
import SettingsPanel from '../components/userSettings/SettingsPanel';

// Define themes object for easy access
const themes = {
  default: {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-700',
    text: 'text-white',
    bubbleUser: 'bg-blue-600',
    bubbleOther: 'bg-gray-700'
  },
  dark: {
    primary: 'bg-gray-800',
    secondary: 'bg-gray-900',
    text: 'text-gray-100',
    bubbleUser: 'bg-gray-700',
    bubbleOther: 'bg-gray-800'
  },
  sunrise: {
    primary: 'bg-orange-500',
    secondary: 'bg-amber-50',
    text: 'text-gray-900',
    bubbleUser: 'bg-orange-500',
    bubbleOther: 'bg-amber-100'
  },
  ocean: {
    primary: 'bg-blue-400',
    secondary: 'bg-blue-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-blue-500',
    bubbleOther: 'bg-blue-100'
  },
  forest: {
    primary: 'bg-green-600',
    secondary: 'bg-emerald-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-green-600',
    bubbleOther: 'bg-emerald-100'
  },
  'purple-dream': {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-50',
    text: 'text-gray-800',
    bubbleUser: 'bg-purple-600',
    bubbleOther: 'bg-purple-100'
  },
  midnight: {
    primary: 'bg-indigo-900',
    secondary: 'bg-gray-900',
    text: 'text-gray-100',
    bubbleUser: 'bg-indigo-800',
    bubbleOther: 'bg-gray-800'
  },
  minimal: {
    primary: 'bg-gray-200',
    secondary: 'bg-white',
    text: 'text-gray-900',
    bubbleUser: 'bg-gray-300',
    bubbleOther: 'bg-gray-100'
  }
};

// Define wallpapers object for easy access
const wallpapers = {
  null: 'bg-gray-900',
  'blue-gradient': 'bg-gradient-to-r from-blue-800 to-cyan-600',
  'purple-pink': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'sunset': 'bg-gradient-to-r from-yellow-400 to-orange-500',
  'green': 'bg-gradient-to-r from-emerald-400 to-green-600'
};

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
    markChatRead,
    clearChat,
    updateUserProfile,
    setPin,
    verifyPin,
    deleteChat
  } = useChat();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef(null);

  /* ======================
     GET CURRENT THEME AND WALLPAPER
  ====================== */
  const currentTheme = themes[currentUser?.messageTheme || 'default'];
  const currentWallpaper = wallpapers[currentUser?.wallpaper || null];

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

  // Redirect users who haven't set a userId to the setup page
  useEffect(() => {
    if (currentUser && !currentUser.userId) {
      navigate('/setup-user-id');
    }
  }, [currentUser, navigate]);

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

  // PIN modal state + helpers
  const [pinModal, setPinModal] = useState({ open: false, mode: 'verify', callback: null });
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);

  const openPinSetup = (callback) => {
    setPinModal({ open: true, mode: 'setup', callback });
  };

  const openPinVerify = (callback) => {
    setPinModal({ open: true, mode: 'verify', callback });
  };

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

  // Handle tab switching with PIN protection for archive
  const handleSetActiveTab = (target) => {
    if (target !== 'archive') {
      setArchiveUnlocked(false);
      setActiveTab(target);
      return;
    }

    // Going to archive
    if (archiveUnlocked) {
      setActiveTab('archive');
      return;
    }

    if (!currentUser?.hasPin) {
      // Ask user to set a PIN first
      openPinSetup(() => {
        setArchiveUnlocked(true);
        setActiveTab('archive');
      });
      return;
    }

    // Ask for PIN verification
    openPinVerify(() => {
      setArchiveUnlocked(true);
      setActiveTab('archive');
    });
  };

  const handleDeleteChat = async (chatId) => {
    const res = await deleteChat(chatId);
    if (!res.success) {
      alert('Failed to delete chat');
    }
  };

  // Called by ConversationItem when user asks to set PIN before locking a chat
  const handleRequestSetPin = (chatId) => {
    openPinSetup(async () => {
      // After setting PIN, lock the chat
      await updateChatPreference(chatId, { locked: true });
    });
  };

  // Called by ConversationItem when user tries to unlock a chat
  const handleRequestVerifyPin = async (chatId) => {
    return new Promise((resolve, reject) => {
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

      {/* Only show ChatList when NOT in settings tab */}
      {activeTab !== 'settings' && (
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
          onDeleteChat={handleDeleteChat}
          onRequestSetPin={handleRequestSetPin}
          onRequestVerifyPin={handleRequestVerifyPin}
          currentUser={currentUser}
          currentTheme={currentTheme}
        />
      )}

      {activeTab === 'settings' ? (
        <div className="flex-1">
          <SettingsPanel currentUser={currentUser} updateUserProfile={updateUserProfile} />
        </div>
      ) : selectedChat ? (
        <div className={`flex-1 flex flex-col ${currentWallpaper}`}>
          <ChatArea
            selectedChat={selectedChat}
            messages={messages}
            currentUser={currentUser}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
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
            currentTheme={currentTheme}
          />
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${currentWallpaper} text-center`}>
          <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Welcome to ChatApp
            </h3>
            <p className="text-gray-400 max-w-md mb-6">
              Select a chat or search users to start messaging.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('chats')}
                className={`px-4 py-2 ${currentTheme.primary} text-white rounded-lg hover:opacity-90 transition-opacity`}
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