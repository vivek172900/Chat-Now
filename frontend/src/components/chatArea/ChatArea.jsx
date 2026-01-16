import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, UserPlus } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ShowProfile from './ShowProfile';
import MessageInput from './MessageInput';
import SearchUserModal from '../chatList/searchUserModel';

const ChatArea = ({
  selectedChat,
  messages,
  currentUser,
  message,
  setMessage,
  onSendMessage,
  onSendFile,
  onKeyPress,
  onTyping,
  markChatRead,
  typingUsers,
  messagesEndRef,
  messagesContainerRef,
  scrollToBottom,
  isSending = false,
  onUpdateChatPreference,
  onClearChat,
  onUpdateGroupChat,
  users = [],
  currentTheme = {
    primary: 'bg-gray-800',
    secondary: 'bg-gray-800',
    text: 'text-white',
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bubbleOther: 'bg-gray-700',
    textUser: 'text-white',
    textOther: 'text-white'
  },
  getDisplayId,
  getDisplayAvatar
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [localWallpaper, setLocalWallpaper] = useState(selectedChat?.preference?.wallpaper || null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const observerRef = useRef(null);

  const isSomeoneTyping = selectedChat &&
    typingUsers[selectedChat._id] &&
    Object.values(typingUsers[selectedChat._id]).some(time =>
      time && Date.now() - new Date(time).getTime() < 3000
    );

  useEffect(() => {
    if (!selectedChat || !currentUser || messages.length === 0) {
      setUnreadMessages([]);
      return;
    }

    const unread = messages.filter(msg => {
      if (msg.sender?._id === currentUser._id || msg.sender === currentUser._id) {
        return false;
      }

      const isRead = msg.readBy?.some(read =>
        read.user === currentUser._id || read.user?._id === currentUser._id
      );

      return !isRead;
    });

    setUnreadMessages(unread);
  }, [messages, currentUser, selectedChat]);

  useEffect(() => {
    if (!selectedChat || unreadMessages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            if (messageId) {
              const message = unreadMessages.find(msg => msg._id === messageId);
              if (message) {
                markChatRead?.(selectedChat._id);
              }
            }
          }
        });
      },
      {
        root: messagesContainerRef.current,
        threshold: 0.5,
      }
    );

    unreadMessages.forEach(msg => {
      const element = document.querySelector(`[data-message-id="${msg._id}"]`);
      if (element) {
        observer.observe(element);
      }
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [unreadMessages, selectedChat, markChatRead, messagesContainerRef]);

  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const timer = setTimeout(() => {
        markChatRead?.(selectedChat._id);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedChat, markChatRead]);

  useEffect(() => {
    if (unreadMessages.length > 0 && messagesContainerRef.current) {
      const firstUnreadId = unreadMessages[0]._id;
      const firstUnreadElement = document.querySelector(`[data-message-id="${firstUnreadId}"]`);
      if (firstUnreadElement) {
        firstUnreadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [unreadMessages]);

  const handleProfileClick = () => {
    if (isGroupChat) {
      return;
    }

    if (otherParticipant) {
      setProfileUser(otherParticipant);
      setShowProfile(true);
    }
  };

  useEffect(() => {
    setLocalWallpaper(selectedChat?.preference?.wallpaper ?? currentUser?.wallpaper ?? null);
    scrollToBottom();
  }, [messages, scrollToBottom, selectedChat, currentUser]);

  useEffect(() => {
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

  const handleAddMember = async (user) => {
    const existing = selectedChat.participants?.map(p => p._id || p) || [];
    
    if (existing.includes(user._id)) {
      alert(`${user.username} is already in this group`);
      return;
    }
    
    const newParticipants = [...existing, user._id];
    await onUpdateGroupChat?.(selectedChat._id, { participants: newParticipants });
    
    alert(`${user.username} has been added to the group`);
  };

  const handleSearchUserSelect = (user) => {
    handleAddMember(user);
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
            {unreadMessages.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadMessages.length} unread
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isGroupChat && (
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Add member"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        )}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => { setShowMenu(s => !s); }}
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
                {unreadMessages.length > 0 && (
                  <div className="truncate mt-1 text-blue-400">
                    {unreadMessages.length} unread messages
                  </div>
                )}
              </div>

              {isGroupChat && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                    onClick={async () => {
                      setShowMenu(false);
                      const newName = window.prompt('Enter new group name', selectedChat?.chatName || '');
                      if (!newName || newName.trim().length === 0) return;
                      if (newName.length > 100) {
                        alert('Group name must be less than 100 characters');
                        return;
                      }
                      await onUpdateGroupChat?.(selectedChat._id, { chatName: newName.trim() });
                    }}
                  >
                    Rename group
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                    onClick={() => {
                      setShowMenu(false);
                      setShowAddMemberModal(true);
                    }}
                  >
                    Add participant
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                    onClick={async () => {
                      setShowMenu(false);

                      if (selectedChat.participants?.length <= 2) {
                        alert('Cannot remove participants - group must have at least 2 members');
                        return;
                      }

                      const query = window.prompt('Enter userId or username to remove');
                      if (!query) return;

                      const match = selectedChat.participants?.find(p =>
                        p.userId === query ||
                        p.username === query ||
                        p._id === query
                      );

                      if (!match) {
                        alert(`No participant found: ${query}`);
                        return;
                      }

                      if (match._id === selectedChat.admin?._id || match._id === selectedChat.admin) {
                        alert('Cannot remove group admin');
                        return;
                      }

                      const existing = selectedChat.participants?.map(p => p._id || p);
                      const newParticipants = existing.filter(id => id !== match._id);
                      await onUpdateGroupChat?.(selectedChat._id, { participants: newParticipants });
                    }}
                  >
                    Remove participant
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                    onClick={async () => {
                      setShowMenu(false);
                      const query = window.prompt('Enter userId or username to make admin');
                      if (!query) return;

                      const match = selectedChat.participants?.find(p =>
                        p.userId === query ||
                        p.username === query ||
                        p._id === query
                      );

                      if (!match) {
                        alert(`No participant found: ${query}`);
                        return;
                      }

                      await onUpdateGroupChat?.(selectedChat._id, { admin: match._id });
                    }}
                  >
                    Make admin
                  </button>

                  <div className="border-t border-gray-700 my-1"></div>
                </>
              )}

              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-blue-400"
                onClick={() => {
                  setShowMenu(false);
                  if (unreadMessages.length > 0) {
                    markChatRead?.(selectedChat._id);
                  }
                }}
              >
                Mark all as read
              </button>

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

  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';

    if (selectedChat?.isGroupChat && selectedChat?.chatName) {
      return selectedChat.chatName;
    }

    if (user) {
      return user?.userId || `User ${user?._id?.slice(-4)}`;
    }

    return 'Unknown User';
  };

  const renderMessages = () => (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 140px)' }}
      onScroll={() => {
        if (unreadMessages.length > 0) {
          const container = messagesContainerRef.current;
          if (container) {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            const visibleMessages = unreadMessages.filter(msg => {
              const element = document.querySelector(`[data-message-id="${msg._id}"]`);
              if (!element) return false;

              const rect = element.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();

              return (
                rect.top >= containerRect.top &&
                rect.bottom <= containerRect.bottom
              );
            });

            if (visibleMessages.length > 0) {
              markChatRead?.(selectedChat._id);
            }
          }
        }
      }}
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
          {unreadMessages.length > 0 && (
            <div className="sticky top-2 z-10">
              <div className="flex items-center justify-center">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>{unreadMessages.length} unread message{unreadMessages.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => markChatRead?.(selectedChat._id)}
                    className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const prevMessage = messages[index - 1];
            const showAvatar = isGroupChat &&
              msg.sender?._id !== currentUser?._id &&
              (index === 0 || prevMessage?.sender?._id !== msg.sender?._id);

            const isUnread = unreadMessages.some(unread => unread._id === msg._id);
            const isOwnMessage = msg.sender?._id === currentUser?._id;

            return (
              <div
                key={msg._id || `temp-${index}`}
                data-message-id={msg._id}
                className={`relative ${isUnread && !isOwnMessage ? 'unread-message' : ''}`}
              >
                {isUnread && !isOwnMessage && (
                  <div className="absolute left-0 top-1/2 transform -translate-x-4 -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                <MessageBubble
                  message={msg}
                  isOwn={isOwnMessage}
                  showAvatar={showAvatar}
                  sender={msg.sender}
                  isSending={msg.status === 'sending'}
                  isFailed={msg.status === 'failed'}
                  currentTheme={currentTheme}
                  currentUser={currentUser}
                  getDisplayId={getDisplayId}
                  getDisplayAvatar={getDisplayAvatar}
                />
              </div>
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

  const wallpaperClass = 'bg-gray-900';

  return (
    <div className={`flex-1 flex flex-col h-full ${wallpaperClass}`} onClick={() => markChatRead?.(selectedChat?._id)}>
      {renderChatHeader()}
      {renderMessages()}

      <MessageInput
        message={message}
        setMessage={setMessage}
        onSendMessage={onSendMessage}
        onSendFile={onSendFile}
        onKeyPress={onKeyPress}
        onTyping={onTyping}
        isSending={isSending}
        markChatRead={markChatRead}
        selectedChat={selectedChat}
        currentTheme={currentTheme}
      />

      <ShowProfile
        user={profileUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        getDisplayId={getDisplayId}
        getDisplayAvatar={getDisplayAvatar}
      />

      {showAddMemberModal && (
        <SearchUserModal
          open={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          users={users}
          onSelectUser={handleSearchUserSelect}
        />
      )}
    </div>
  );
};

export default ChatArea;