import React, { useState } from 'react';
import { Search, Users as UsersIcon, Archive, Heart, Lock } from 'lucide-react';
import ConversationItem from './ConversationItem';
import GroupCreateModal from './GroupCreateModal';
import { Plus } from 'lucide-react';

const ChatList = ({
  activeTab,
  chats,
  users,
  isLoading,
  selectedChat,
  searchQuery,
  onSearch,
  onChatSelect,
  onUserSelect,
  onUpdateChatPreference,
  onDeleteChat,
  onRequestSetPin,
  onRequestVerifyPin,
  currentUser,
  currentTheme,
  onCreateGroup
}) => {
  const [openGroup, setOpenGroup] = useState(false);
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'chats': return 'Chats';
      case 'users': return 'Users';
      case 'archive': return 'Archived';
      case 'favorites': return 'Favorites';
      case 'locked': return 'Locked';
      default: return 'Chats';
    }
  };

  const getHeaderIcon = () => {
    switch (activeTab) {
      case 'chats': return <UsersIcon className="w-5 h-5" />;
      case 'users': return <UsersIcon className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      case 'favorites': return <Heart className="w-5 h-5" />;
      case 'locked': return <Lock className="w-5 h-5" />;
      default: return <UsersIcon className="w-5 h-5" />;
    }
  };

  const renderChatsTab = () => {
    if (chats.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">No conversations yet</p>
          <p className="text-gray-500 text-sm mt-1">Start chatting with users!</p>
        </div>
      );
    }

    return (
      <div className="space-y-1 p-2">
        {chats.map((chat) => (
          <ConversationItem
            key={chat._id}
            chat={chat}
            isSelected={selectedChat?._id === chat._id}
            onSelect={() => onChatSelect(chat)}
            onUpdatePreference={onUpdateChatPreference}
            onDeleteChat={onDeleteChat}
            onRequestSetPin={onRequestSetPin}
            onRequestVerifyPin={onRequestVerifyPin}
            currentUser={currentUser} // Pass currentUser to ConversationItem
            currentTheme={currentTheme}
          />
        ))}
      </div>
    );
  };

  const renderUsersTab = () => {
    const filteredUsers = users.filter(user => {
      const q = searchQuery.toLowerCase();
      return (
        (user.userId && user.userId.toLowerCase().includes(q)) ||
        (user.username && user.username.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q))
      );
    });

    // Filter out current user from users list
    const filteredUsersWithoutSelf = filteredUsers.filter(
      user => user._id !== currentUser?._id
    );

    if (filteredUsersWithoutSelf.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">
            {searchQuery ? 'No users found' : 'No users available'}
          </p>
          {searchQuery && (
            <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1 p-2">
        {filteredUsersWithoutSelf.map((user) => (
          <div
            key={user._id}
            onClick={() => onUserSelect(user)}
            className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.username}</p>
              <p className="text-gray-400 text-sm truncate">{user.about || 'No bio available'}</p>
            </div>
            <div className="text-xs text-gray-500">
              {user.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSpecialTab = () => {
    const emptyMessages = {
      'archive': {
        icon: <Archive className="w-8 h-8" />,
        title: 'No archived chats',
        description: 'Chats you archive will appear here'
      },
      'favorites': {
        icon: <Heart className="w-8 h-8" />,
        title: 'No favorite chats',
        description: 'Chats you mark as favorite will appear here'
      },
      'locked': {
        icon: <Lock className="w-8 h-8" />,
        title: 'No locked chats',
        description: 'Chats you lock will appear here'
      }
    };

    if (chats.length === 0) {
      const empty = emptyMessages[activeTab] || emptyMessages.archive;
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {empty.icon}
          </div>
          <p className="text-gray-400">{empty.title}</p>
          <p className="text-gray-500 text-sm mt-1">{empty.description}</p>
        </div>
      );
    }

    return renderChatsTab();
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
              {getHeaderIcon()}
            </div>
            <h1 className="text-xl font-bold text-white">
              {getHeaderTitle()}
            </h1>
          </div>

          {activeTab === 'chats' && (
            <button
              onClick={() => setOpenGroup(true)}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Group
            </button>
          )}
        </div>

        {(activeTab === 'chats' || activeTab === 'users') && (
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? 'Search by userId or username...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'chats' && renderChatsTab()}
            {activeTab === 'users' && renderUsersTab()}
            {(activeTab === 'archive' || activeTab === 'favorites' || activeTab === 'locked') && renderSpecialTab()}
          </>
        )}
      </div>

      <GroupCreateModal
        open={openGroup}
        onCreate={async (name, participantIds) => {
          if (typeof onCreateGroup === 'function') {
            await onCreateGroup(name, participantIds);
          }
        }}
        onClose={() => setOpenGroup(false)}
        users={users}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ChatList;