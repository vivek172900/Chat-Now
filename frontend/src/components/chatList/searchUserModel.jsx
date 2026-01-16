import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

const SearchUserModal = ({ open, onClose, users, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exactMatch, setExactMatch] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError('Enter username or userId');
      setExactMatch(null);
      return;
    }

    setError('');
    
    const foundUser = users.find(user => 
      user.username === searchTerm.trim() || 
      user.userId === searchTerm.trim() ||
      user._id === searchTerm.trim()
    );

    if (foundUser) {
      setExactMatch(foundUser);
    } else {
      setExactMatch(null);
      setError(`No user found: "${searchTerm}"`);
    }
  };

  const handleAddUser = () => {
    if (exactMatch) {
      onSelectUser(exactMatch);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Add Member</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter exact username or userId:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setError('');
                  setExactMatch(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Username or userId"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Must match exactly
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {exactMatch && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {exactMatch.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-semibold">{exactMatch.username}</p>
                  {exactMatch.userId && (
                    <p className="text-gray-300">@{exactMatch.userId}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleAddUser}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Add to Group
              </button>
            </div>
          )}

          <div className="text-sm text-gray-400">
            <p className="font-medium mb-1">Available users ({users.length}):</p>
            <div className="max-h-40 overflow-y-auto bg-gray-900 rounded p-3">
              {users.slice(0, 20).map((user, index) => (
                <div key={user._id} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-b-0">
                  <div>
                    <span className="text-gray-300">{user.username}</span>
                    {user.userId && <span className="text-gray-500 ml-2">(@{user.userId})</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    Copy
                  </div>
                </div>
              ))}
              {users.length > 20 && (
                <div className="text-center text-gray-500 text-xs pt-2">
                  ... and {users.length - 20} more
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
            {exactMatch && (
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchUserModal;