import React from 'react';
import { Archive, Heart, Lock, ChevronDown } from 'lucide-react';

const ConversationItem = ({
  preview,
  selectedChat,
  handleChatSelect,
  updateConversationSettings,
  openDropdown,
  setOpenDropdown,
  currentUser,
  activeTab,
  showDropdown
}) => {
  const getStatusIndicator = () => {
    const indicators = [];
    if (preview.userSettings.locked) {
      indicators.push(
        <div key="locked" className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
          <Lock className="w-2 h-2 text-white" />
        </div>
      );
    }
    if (preview.userSettings.favorite) {
      indicators.push(
        <div key="favorite" className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
          <Heart className="w-2 h-2 text-white" />
        </div>
      );
    }
    if (preview.userSettings.archived) {
      indicators.push(
        <div key="archived" className="absolute -bottom-1 -left-1 bg-gray-600 rounded-full p-1">
          <Archive className="w-2 h-2 text-white" />
        </div>
      );
    }
    return indicators;
  };

  const getActionButton = () => {
    if (!activeTab || activeTab === 'chats') return null;

    const actions = {
      'archive': {
        onClick: () => updateConversationSettings(preview.conversation.Conversation_id, { archived: false }),
        icon: <Archive className="w-3 h-3" />,
        title: 'Unarchive'
      },
      'favorites': {
        onClick: () => updateConversationSettings(preview.conversation.Conversation_id, { favorite: false }),
        icon: <Heart className="w-3 h-3" />,
        title: 'Remove from favorites'
      },
      'locked': {
        onClick: () => updateConversationSettings(preview.conversation.Conversation_id, { locked: false }),
        icon: <Lock className="w-3 h-3" />,
        title: 'Unlock'
      }
    };

    const action = actions[activeTab];
    if (!action) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
        }}
        className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
        title={action.title}
      >
        {action.icon}
      </button>
    );
  };

  return (
    <div className="relative group">
      <div
        onClick={() => handleChatSelect(preview.user)}
        className={`p-3 rounded-lg cursor-pointer transition-colors ${
          selectedChat?.user?.email === preview.user.user.email
            ? 'bg-blue-500'
            : 'hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold relative">
            {preview.user.user.Fullname?.charAt(0) || 'U'}
            {getStatusIndicator()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium truncate">
                {preview.user.user.Fullname}
                {preview.userSettings.archived && activeTab !== 'archive' && (
                  <Archive className="w-3 h-3 inline ml-2 text-gray-400" />
                )}
              </p>
              {preview.lastMessage && (
                <span className="text-xs text-gray-400">
                  {new Date(preview.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm truncate">
                {preview.lastMessage ? (
                  <>
                    {preview.lastMessage.senderid === currentUser.email ? 'You: ' : ''}
                    {preview.lastMessage.message}
                  </>
                ) : (
                  'No messages yet'
                )}
              </p>
              {preview.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {preview.unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            preview.user.user.State === 'Online' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === preview.conversation._id ? null : preview.conversation._id);
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg"
              title="More options"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {openDropdown === preview.conversation._id && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateConversationSettings(preview.conversation.Conversation_id, {
                      archived: !preview.userSettings.archived
                    });
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                >
                  <Archive className="w-4 h-4" />
                  <span>{preview.userSettings.archived ? 'Unarchive chat' : 'Archive chat'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateConversationSettings(preview.conversation.Conversation_id, {
                      favorite: !preview.userSettings.favorite
                    });
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                >
                  <Heart className={`w-4 h-4 ${
                    preview.userSettings.favorite ? 'text-red-500 fill-current' : ''
                  }`} />
                  <span>{preview.userSettings.favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateConversationSettings(preview.conversation.Conversation_id, {
                      locked: !preview.userSettings.locked
                    });
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                >
                  <Lock className={`w-4 h-4 ${
                    preview.userSettings.locked ? 'text-yellow-500' : ''
                  }`} />
                  <span>{preview.userSettings.locked ? 'Unlock chat' : 'Lock chat'}</span>
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3"
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
      )}

      {!showDropdown && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          {getActionButton()}
        </div>
      )}
    </div>
  );
};

export default ConversationItem;