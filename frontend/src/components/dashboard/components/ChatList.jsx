import React from 'react';
import { Search, Archive, Heart, Lock, ChevronDown, MessageCircle } from 'lucide-react';
import ConversationItem from './ConversationItem';

const ChatList = ({
  activeTab,
  selectedChat,
  allUsers,
  conversationPreviews,
  isLoading,
  handleChatSelect,
  updateConversationSettings,
  openDropdown,
  setOpenDropdown,
  currentUser
}) => {
  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'chats': return 'Chats';
      case 'users': return 'All Users';
      case 'archive': return 'Archived';
      case 'favorites': return 'Favorites';
      case 'locked': return 'Locked';
      case 'settings': return 'Settings';
      default: return 'Chats';
    }
  };

  const renderChatsTab = () => (
    <div className="p-4 space-y-2">
      {conversationPreviews.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {allUsers.length > 0 
            ? 'No conversations with messages yet. Start chatting with users!'
            : 'No users found. Add some friends to start chatting!'
          }
        </div>
      ) : (
        conversationPreviews.map((preview) => (
          <ConversationItem
            key={preview.conversation._id || preview.conversation.Conversation_id}
            preview={preview}
            selectedChat={selectedChat}
            handleChatSelect={handleChatSelect}
            updateConversationSettings={updateConversationSettings}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            currentUser={currentUser}
            showDropdown={true}
          />
        ))
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="p-4 space-y-2">
      {allUsers.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No users found
        </div>
      ) : (
        allUsers.map((user) => {
          const existingConversation = conversationPreviews.find(
            preview => preview.user.user.email === user.user.email
          );
          
          const hasConversation = existingConversation && existingConversation.hasMessages;
          
          return (
            <div
              key={user.userid}
              onClick={() => handleChatSelect(user)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat?.user?.email === user.user.email
                  ? 'bg-blue-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold relative">
                  {user.user.Fullname?.charAt(0) || 'U'}
                  {hasConversation && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <MessageCircle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.user.Fullname}
                    {hasConversation && (
                      <span className="ml-2 text-xs text-green-400">• Chat exists</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    @{user.user.Username}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  user.user.State === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {currentUser.fullname?.charAt(0) || 'U'}
        </div>
        <h3 className="text-white font-semibold">{currentUser.fullname}</h3>
        <p className="text-gray-400">@{currentUser.username}</p>
        <p className="text-gray-400 text-sm">{currentUser.email}</p>
      </div>

      <div className="space-y-2">
        <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
          Profile Settings
        </button>
        <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
          Privacy & Security
        </button>
        <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
          Notifications
        </button>
        <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
          Theme
        </button>
        <button className="w-full p-3 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
          Logout
        </button>
      </div>
    </div>
  );

  const renderSpecialTab = () => (
    <div className="p-4 space-y-2">
      {conversationPreviews.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {activeTab === 'archive' && 'No archived conversations'}
          {activeTab === 'favorites' && 'No favorite conversations. Click the heart icon in a chat to add it to favorites.'}
          {activeTab === 'locked' && 'No locked conversations. Click the lock icon in a chat to lock it.'}
        </div>
      ) : (
        conversationPreviews.map((preview) => (
          <ConversationItem
            key={preview.conversation._id || preview.conversation.Conversation_id}
            preview={preview}
            selectedChat={selectedChat}
            handleChatSelect={handleChatSelect}
            updateConversationSettings={updateConversationSettings}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            currentUser={currentUser}
            activeTab={activeTab}
            showDropdown={false}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-4">
          {getHeaderTitle()}
        </h1>

        {(activeTab === 'chats' || activeTab === 'users') && (
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'chats' && renderChatsTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {(activeTab === 'archive' || activeTab === 'favorites' || activeTab === 'locked') && renderSpecialTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;