import React from 'react';
import { MessageCircle, Users, Settings, Archive, Heart, Lock } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, totalUnreadCount, currentUser, handleLogout }) => {
  const sidebarItems = [
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'archive', icon: Archive, label: 'Archive' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'locked', icon: Lock, label: 'Locked' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-6 border-r border-gray-700">
      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-8">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>

      <div className="flex flex-col space-y-4 flex-1">
        {sidebarItems.map((item) => (
          <div key={item.id} className="relative">
            <button
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
            {item.id === 'chats' && totalUnreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-4">
        {currentUser?.profilePic ? (
          <img src={currentUser.profilePic} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser.fullname?.charAt(0) || 'U'}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;