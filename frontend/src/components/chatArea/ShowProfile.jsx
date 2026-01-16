import React from 'react';
import { X, User, Clock, MapPin, Calendar, Copy } from 'lucide-react';

const ShowProfile = ({ user, isOpen, onClose, getDisplayId, getDisplayAvatar }) => {
  if (!isOpen || !user) return null;

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    if (dateValue.$date) {
      return new Date(dateValue.$date);
    }
    
    return new Date(dateValue);
  };

  const formatJoinDate = (dateValue) => {
    const date = parseDate(dateValue);
    if (!date) return 'Not available';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastSeenTime = (dateValue) => {
    const date = parseDate(dateValue);
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    if (diffDays === 1) return 'Yesterday';
    
    if (diffDays < 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[date.getDay()];
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserStatus = () => {
    if (user.isOnline) {
      return {
        text: 'Online',
        color: 'bg-green-500',
        dotColor: 'text-green-500'
      };
    }
    
    if (user.lastSeen) {
      return {
        text: `Last seen ${formatLastSeenTime(user.lastSeen)}`,
        color: 'bg-gray-500',
        dotColor: 'text-gray-500'
      };
    }
    
    return {
      text: 'Offline',
      color: 'bg-gray-500',
      dotColor: 'text-gray-500'
    };
  };

  const getDetailedLastSeen = () => {
    if (!user.lastSeen) return 'Never';
    
    const date = parseDate(user.lastSeen);
    if (!date) return 'Never';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastSeenDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    let dayPrefix = '';
    if (lastSeenDate.getTime() === today.getTime()) {
      dayPrefix = 'Today at ';
    } else if (lastSeenDate.getTime() === yesterday.getTime()) {
      dayPrefix = 'Yesterday at ';
    } else {
      dayPrefix = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ' at ';
    }
    
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return dayPrefix + timeString;
  };

  const getUserDisplayId = () => {
    if (typeof getDisplayId === 'function') {
      return getDisplayId(user);
    }
    return user?.userId || user?._id?.slice(-8) || 'Unknown';
  };

  const getUserDisplayAvatar = () => {
    if (typeof getDisplayAvatar === 'function') {
      return getDisplayAvatar(user);
    }
    const displayId = user?.userId || user?._id || 'U';
    return displayId.charAt(0).toUpperCase();
  };

  const copyUserIdToClipboard = async () => {
    const userId = getUserDisplayId();
    try {
      await navigator.clipboard.writeText(userId);
      alert(`Copied user ID: ${userId}`);
    } catch (err) {
      console.error('Failed to copy user ID:', err);
    }
  };

  const status = getUserStatus();
  const detailedLastSeen = getDetailedLastSeen();
  const displayId = getUserDisplayId();
  const displayAvatar = getUserDisplayAvatar();

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-gray-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-8 border-r border-gray-700 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 min-h-[500px]">
                <div className="relative mb-8">
                  <div className="w-56 h-56 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-8 border-gray-700 shadow-2xl">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt={displayId}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-7xl font-bold">
                        {displayAvatar}
                      </div>
                    )}
                  </div>
                  
                  <div className={`absolute bottom-6 right-6 w-10 h-10 ${status.color} rounded-full border-4 border-gray-800`} />
                </div>
                
                <div className="text-center w-full">
                  <h2 className="text-2xl font-bold text-white mb-3 break-all px-4">
                    {displayId}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className={`text-lg ${status.dotColor} font-medium`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className={`inline-block px-4 py-2 rounded-full mb-6 ${user.userId ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    <span className="text-sm font-medium">
                      {user.userId ? 'Registered User' : 'Guest User'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                    <button
                      onClick={copyUserIdToClipboard}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors min-w-[140px]"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors min-w-[140px]">
                      Block User
                    </button>
                  </div>

                  <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Database ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm text-gray-300 font-mono break-all">
                        {user?._id || 'N/A'}
                      </code>
                      {user?._id && (
                        <button
                          onClick={() => navigator.clipboard.writeText(user._id)}
                          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                          title="Copy database ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 p-8 overflow-y-auto max-h-[600px]">
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">About</h4>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                    <p className="text-gray-300 text-lg">
                      {user.about || "Hey there! I am using Chat App"}
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">User Information</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Account Created</p>
                      <p className="text-white text-lg">
                        {formatJoinDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Last Seen</p>
                      <p className="text-white text-lg">
                        {detailedLastSeen}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {status.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="text-white text-lg">Not specified</p>
                    </div>
                  </div>
                </div>

                {user.customFields && Object.keys(user.customFields).length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Additional Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(user.customFields).map(([key, value]) => (
                        <div key={key} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <p className="text-xs text-gray-400 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-white text-sm truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics (Optional - could be added later) */}
                {/* <div className="mt-8 pt-8 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4 text-center border border-gray-700">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-xs text-gray-400 mt-1">Messages</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 text-center border border-gray-700">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-xs text-gray-400 mt-1">Days Active</p>
                    </div>
                  </div>
                </div> */}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    Profile last updated • {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowProfile;