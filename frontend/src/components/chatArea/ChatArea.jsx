import React, { useState, useEffect } from 'react';
import { Phone, Video, MoreVertical, Smile, Send, Paperclip, Mic } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ShowProfile from './ShowProfile';

const ChatArea = ({
  selectedChat,
  messages,
  currentUser,
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  onTyping,
  onFocus: onFocusProp,
  onClick: onClickProp,
  markChatRead,
  typingUsers,
  messagesEndRef,
  messagesContainerRef,
  scrollToBottom,
  isSending = false,
  onUpdateChatPreference, // (chatId, preference)
  onClearChat, // (chatId)
  currentTheme = {
    primary: 'bg-gray-800',
    secondary: 'bg-gray-800',
    text: 'text-white',
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bubbleOther: 'bg-gray-700',
    textUser: 'text-white',
    textOther: 'text-white'
  }
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [localWallpaper, setLocalWallpaper] = useState(selectedChat?.preference?.wallpaper || null);

  const isSomeoneTyping = selectedChat &&
    typingUsers[selectedChat._id] &&
    Object.values(typingUsers[selectedChat._id]).some(time =>
      time && Date.now() - new Date(time).getTime() < 3000
    );

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      markChatRead?.(selectedChat?._id);
      onTyping?.(true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleProfileClick = () => {
    if (isGroupChat) {
      // For group chat, you might want to show group info instead
      // or show a list of participants
      return;
    }

    if (otherParticipant) {
      setProfileUser(otherParticipant);
      setShowProfile(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        onTyping?.(false);
      }
    };
  }, [typingTimeout, isTyping, onTyping]);

  useEffect(() => {
    // keep a local wallpaper value in sync when selectedChat or currentUser changes
    setLocalWallpaper(selectedChat?.preference?.wallpaper ?? currentUser?.wallpaper ?? null);
    scrollToBottom();
  }, [messages, scrollToBottom, selectedChat, currentUser]);

  useEffect(() => {
    // if user's default wallpaper changes, update local wallpaper when no chat preference is set
    if (!selectedChat?.preference?.wallpaper) {
      setLocalWallpaper(currentUser?.wallpaper ?? null);
    }
  }, [currentUser, selectedChat]);

  const getOtherParticipant = () => {
    if (!selectedChat || selectedChat.isGroupChat) return null;
    return selectedChat.participants?.find(
      participant => participant._id !== currentUser?._id
    );
  };

  const otherParticipant = getOtherParticipant();
  const isGroupChat = selectedChat?.isGroupChat;

  // Get display ID for user - UPDATED to show userId
  const getDisplayId = (user) => {
    if (!user) return 'Unknown';
    // Show userId if available, otherwise fallback to truncated _id
    return user?.userId || user?._id?.slice(-8) || 'Unknown';
  };

  // Get display avatar for user - using first character of userId or ID
  const getDisplayAvatar = (user) => {
    if (!user) return 'U';
    // Use first character of userId if available, otherwise use first character of _id
    const displayId = user?.userId || user?._id || 'U';
    return displayId.charAt(0).toUpperCase();
  };

  // Get display name with userId - UPDATED
  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';
    
    // For group chat name
    if (selectedChat?.isGroupChat && selectedChat?.chatName) {
      return selectedChat.chatName;
    }
    
    // For other participant in 1:1 chat
    if (user) {
      return user?.userId || `User ${user?._id?.slice(-4)}`;
    }
    
    return 'Unknown User';
  };

  const renderChatHeader = () => (
    <div className="border-b border-gray-700 p-4 flex items-center justify-between bg-gray-800 flex-shrink-0">
      <div className="flex items-center space-x-3">
        {isGroupChat ? (
          <button
            onClick={handleProfileClick}
            className="relative focus:outline-none"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity">
              {selectedChat.chatName?.charAt(0)?.toUpperCase() || 'G'}
            </div>
          </button>
        ) : (
          <button
            onClick={handleProfileClick}
            className="relative focus:outline-none"
          >
            {otherParticipant?.profilePic ? (
              <img
                src={otherParticipant.profilePic}
                alt={getDisplayId(otherParticipant)}
                className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity">
                {getDisplayAvatar(otherParticipant)}
              </div>
            )}
            {otherParticipant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </button>
        )}

        <div>
          <h3 className="text-white font-semibold">
            {getDisplayName(otherParticipant)}
          </h3>
          <p className="text-gray-400 text-sm">
            {isGroupChat
              ? `${selectedChat.participants?.length || 0} members`
              : (otherParticipant?.isOnline ? 'Online' : 'Offline')
            }
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => { setShowMenu(s => !s); setShowWallpaperPicker(false); }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-haspopup="true"
            aria-expanded={showMenu}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                <div className="truncate">Chat ID: {selectedChat?._id?.slice(-8)}</div>
                {!isGroupChat && otherParticipant && (
                  <div className="truncate mt-1">User ID: {getDisplayId(otherParticipant)}</div>
                )}
              </div>
              
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                onClick={async () => {
                  setShowMenu(false);
                  if (!selectedChat?._id) return;
                  const ok = window.confirm('Clear all messages in this chat? This cannot be undone.');
                  if (!ok) return;
                  await onClearChat?.(selectedChat._id);
                }}
              >
                Clear chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const wallpapers = [
    { id: null, label: 'Default', style: 'bg-gray-900' },
    { id: 'blue-gradient', label: 'Blue gradient', style: 'bg-gradient-to-r from-blue-800 to-cyan-600' },
    { id: 'purple-pink', label: 'Purple / Pink', style: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'sunset', label: 'Sunset', style: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    { id: 'green', label: 'Green', style: 'bg-gradient-to-r from-emerald-400 to-green-600' },
  ];

  const renderMessages = () => (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 140px)' }} // Fixed height for scrolling
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message!</p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const prevMessage = messages[index - 1];
            const showAvatar = isGroupChat &&
              msg.sender?._id !== currentUser?._id &&
              (index === 0 || prevMessage?.sender?._id !== msg.sender?._id);

            return (
              <MessageBubble
                key={msg._id || `temp-${index}`}
                message={msg}
                isOwn={msg.sender?._id === currentUser?._id}
                showAvatar={showAvatar}
                sender={msg.sender}
                isSending={msg.status === 'sending'}
                isFailed={msg.status === 'failed'}
                currentTheme={currentTheme}
                currentUser={currentUser}
                getDisplayId={getDisplayId}
                getDisplayAvatar={getDisplayAvatar}
              />
            );
          })}

          {isSomeoneTyping && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {isGroupChat && typingUsers[selectedChat._id]
                  ? Object.keys(typingUsers[selectedChat._id])
                    .filter(userId => {
                      const timestamp = typingUsers[selectedChat._id][userId];
                      return timestamp && Date.now() - new Date(timestamp).getTime() < 3000;
                    })
                    .map((userId, index, array) => {
                      const user = selectedChat.participants?.find(p => p._id === userId);
                      return getDisplayId(user);
                    })
                    .join(', ') + ' typing...'
                  : 'typing...'
                }
              </span>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderMessageInput = () => (
    <div className="border-t border-gray-700 p-4 bg-gray-800 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onFocus={() => markChatRead?.(selectedChat?._id)}
            onKeyPress={onKeyPress}
            placeholder="Type a message..."
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:opacity-50"
            disabled={isSending}
          />
          {isSending && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {message.trim() && !isSending ? (
          <button
            onClick={onSendMessage}
            disabled={isSending}
            className={`p-3 ${currentTheme.bubbleUser || 'bg-blue-500'} text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            className="p-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isSending}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Smile className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const wallpaperObj = wallpapers.find(w => w.id === localWallpaper);
  const wallpaperClass = wallpaperObj ? wallpaperObj.style : (currentUser?.wallpaper ? wallpapers[currentUser.wallpaper] || 'bg-gray-900' : 'bg-gray-900');

  return (
    <div className={`flex-1 flex flex-col h-full ${wallpaperClass}`} onClick={() => markChatRead?.(selectedChat?._id)}>
      {renderChatHeader()}
      {showWallpaperPicker && (
        <div className="absolute right-6 top-20 z-30 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <h4 className="text-sm text-gray-300 mb-2">Choose wallpaper</h4>
          <div className="grid grid-cols-3 gap-2">
            {wallpapers.map(w => (
              <button
                key={w.id || 'default'}
                onClick={async () => {
                  setLocalWallpaper(w.id);
                  setShowWallpaperPicker(false);
                  // persist preference
                  try {
                    await onUpdateChatPreference?.(selectedChat._id, { wallpaper: w.id });
                  } catch (err) {
                    console.error('Failed to update wallpaper preference:', err);
                  }
                }}
                className={`w-20 h-12 rounded ${w.style} ${w.id === localWallpaper ? 'ring-2 ring-blue-400' : ''}`}
                title={w.label}
              />
            ))}
          </div>
        </div>
      )}

      {renderMessages()}
      {renderMessageInput()}

      {/* Add ShowProfile component here */}
      <ShowProfile
        user={profileUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        getDisplayId={getDisplayId}
        getDisplayAvatar={getDisplayAvatar}
      />
    </div>
  );
};

export default ChatArea;