import React, { useState } from 'react';
import {
  Archive,
  Heart,
  Lock,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Users as UsersIcon
} from 'lucide-react';

const ConversationItem = ({
  chat,
  isSelected,
  onSelect,
  onUpdatePreference,
  onDeleteChat,
  onRequestSetPin,
  onRequestVerifyPin,
  currentUser,
  currentTheme = {
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Get other participant for 1:1 chat
  const getOtherParticipant = () => {
    if (chat.isGroupChat) return null;

    if (!chat.participants || chat.participants.length < 2) return null;

    // Find the participant who is NOT the current user
    const otherParticipant = chat.participants.find(
      participant => participant._id !== currentUser?._id
    );

    return otherParticipant;
  };

  // Get display ID for chat - UPDATED to show userId
  const getDisplayId = () => {
    if (chat.isGroupChat) {
      return chat.chatName || `Group ${chat._id?.slice(-4) || ''}`;
    }

    const otherParticipant = getOtherParticipant();
    // Show userId if available, otherwise fallback to truncated _id
    return otherParticipant?.userId || otherParticipant?._id?.slice(-8) || 'Unknown';
  };

  // Get display avatar for chat - using first character of userId or ID
  const getDisplayAvatar = () => {
    if (chat.isGroupChat) {
      return chat.chatName?.charAt(0)?.toUpperCase() || 'G';
    }

    const otherParticipant = getOtherParticipant();
    // Use first character of userId if available, otherwise use first character of _id
    const displayId = otherParticipant?.userId || otherParticipant?._id || 'U';
    return displayId.charAt(0).toUpperCase();
  };

  // Get display name with userId in parentheses for reference - optional
  const getDisplayNameWithId = () => {
    if (chat.isGroupChat) {
      return chat.chatName || `Group Chat`;
    }

    const otherParticipant = getOtherParticipant();
    const userId = otherParticipant?.userId;

    if (!userId) {
      return otherParticipant?.username || `User ${otherParticipant?._id?.slice(-4)}`;
    }

    // Show just the userId (cleaner)
    return userId;
  };

  // Check if other participant is online
  const isOtherParticipantOnline = () => {
    if (chat.isGroupChat) return false;

    const otherParticipant = getOtherParticipant();
    return otherParticipant?.isOnline || false;
  };

  const otherParticipant = getOtherParticipant();
  const lastMessage = chat.latestMessage;
  const unreadCount = chat.unreadCount || 0;
  const preference = chat.preference || {};

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (message) => {
    if (!message) return null;

    const isOwnMessage = message.sender?._id === currentUser?._id;

    if (!isOwnMessage) return null;

    if (message.status === 'seen') {
      return <CheckCheck className="w-4 h-4 text-blue-400" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (message.status === 'sent') {
      return <Check className="w-4 h-4 text-gray-400" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessagePreview = (message) => {
    if (!message) return 'Start a conversation';

    const isOwnMessage = message.sender?._id === currentUser?._id;

    if (isOwnMessage) {
      return `You: ${message.content || 'Media'}`;
    }

    if (chat.isGroupChat) {
      // For group chats, show sender's userId if available
      const senderId = message.sender?.userId || message.sender?._id?.slice(-4);
      return `${senderId || 'Someone'}: ${message.content || 'Media'}`;
    }

    return message.content || 'Media';
  };

  const handlePreferenceToggle = async (type) => {
    // Special handling for archiving locked chats
    if (type === 'isArchived' && preference.locked) {
      alert('This chat is locked. Unlock it first to archive.');
      setShowDropdown(false);
      return;
    }

    if (type === 'locked') {
      // If locking and user doesn't have PIN, prompt to set one
      if (!preference.locked && !currentUser?.hasPin) {
        // Ask parent to open PIN setup
        if (typeof onRequestSetPin === 'function') {
          onRequestSetPin(chat._id);
        } else {
          alert('Please set a PIN in settings before locking chats.');
        }
        setShowDropdown(false);
        return;
      }

      // If unlocking, request verification
      if (preference.locked) {
        if (typeof onRequestVerifyPin === 'function') {
          const ok = await onRequestVerifyPin(chat._id);
          if (!ok) {
            alert('PIN verification failed.');
            setShowDropdown(false);
            return;
          }
        } else {
          const confirmed = window.confirm('Unlock this chat?');
          if (!confirmed) {
            setShowDropdown(false);
            return;
          }
        }
      }
    }

    const newPreference = {
      ...preference,
      [type]: !preference[type]
    };
    onUpdatePreference(chat._id, newPreference);
    setShowDropdown(false);
  };

  // Extract the main color from the bubbleUser class
  const getThemeColor = () => {
    if (!currentTheme?.bubbleUser) return 'blue';

    const colorMap = {
      'bg-blue-': 'blue',
      'bg-gray-': 'gray',
      'bg-orange-': 'orange',
      'bg-green-': 'green',
      'bg-purple-': 'purple',
      'bg-indigo-': 'indigo',
    };

    for (const [colorClass, colorName] of Object.entries(colorMap)) {
      if (currentTheme.bubbleUser.includes(colorClass)) {
        return colorName;
      }
    }

    return 'blue';
  };

  const themeColor = getThemeColor();

  // Map theme colors to corresponding Tailwind classes for selection highlight
  const getSelectedStyle = () => {
    const colorStyles = {
      blue: 'bg-blue-500/20 border-l-4 border-blue-500',
      gray: 'bg-gray-500/20 border-l-4 border-gray-500',
      orange: 'bg-orange-500/20 border-l-4 border-orange-500',
      green: 'bg-green-500/20 border-l-4 border-green-500',
      purple: 'bg-purple-500/20 border-l-4 border-purple-500',
      indigo: 'bg-indigo-500/20 border-l-4 border-indigo-500',
    };

    return colorStyles[themeColor] || colorStyles.blue;
  };

  const selectedBgColor = isSelected
    ? getSelectedStyle()
    : 'hover:bg-gray-700';

  return (
    <div className="relative group">
      <div
        onClick={onSelect}
        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedBgColor}`}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            {chat.isGroupChat ? (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.chatName?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-3 h-3" />
                </div>
              </div>
            ) : (
              <>
                {otherParticipant?.profilePic ? (
                  <img src={otherParticipant.profilePic} alt={getDisplayId()} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getDisplayAvatar()}
                  </div>
                )}

                {/* Online status */}
                {isOtherParticipantOnline() && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </>
            )}

            {/* Preference indicators */}
            <div className="absolute -top-1 -right-1 flex space-x-1">
              {preference.locked && (
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Lock className="w-2 h-2 text-white" />
                </div>
              )}
              {preference.isFavorite && (
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-2 h-2 text-white" />
                </div>
              )}
              {preference.isArchived && (
                <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                  <Archive className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Chat info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <p className="text-white font-medium truncate">
                  {getDisplayNameWithId()}
                </p>
                {/* Show truncated _id as a small badge for reference */}
                {!chat.isGroupChat && otherParticipant?._id && !otherParticipant?.userId && (
                  <span className="text-xs text-gray-400 bg-gray-700 px-1 py-0.5 rounded">
                    ID: {otherParticipant._id.slice(-4)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {lastMessage && getMessageStatusIcon(lastMessage)}
                <span className="text-xs text-gray-400">
                  {formatTime(lastMessage?.createdAt || chat.updatedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm truncate">
                {getMessagePreview(lastMessage)}
              </p>

              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-48 z-50">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 mb-2">
                <div className="truncate">Chat ID: {chat._id?.slice(-8)}</div>
                {!chat.isGroupChat && otherParticipant && (
                  <div className="truncate mt-1">
                    User: {otherParticipant.userId || otherParticipant._id?.slice(-8)}
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePreferenceToggle('isArchived')}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
              >
                <Archive className="w-4 h-4" />
                <span>{preference.isArchived ? 'Unarchive' : 'Archive'}</span>
              </button>

              <button
                onClick={() => handlePreferenceToggle('isFavorite')}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
              >
                <Heart className={`w-4 h-4 ${preference.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                <span>{preference.isFavorite ? 'Remove favorite' : 'Add favorite'}</span>
              </button>

              <button
                onClick={() => handlePreferenceToggle('locked')}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
              >
                <Lock className={`w-4 h-4 ${preference.locked ? 'text-yellow-500' : ''}`} />
                <span>{preference.locked ? 'Unlock' : 'Lock'}</span>
              </button>

              <div className="border-t border-gray-700 my-1"></div>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowDropdown(false);

                  const ok = window.confirm('Delete this chat for all participants? This will remove messages and cannot be undone.');
                  if (!ok) return;

                  if (typeof onDeleteChat === 'function') {
                    await onDeleteChat(chat._id);
                  }
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;