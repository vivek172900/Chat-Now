import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';

const GroupCreateModal = ({ open, onCreate, onClose, users, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [exactMatch, setExactMatch] = useState(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setSearchTerm('');
      setSelectedUsers([]);
      setError('');
      setExactMatch(null);
      setSearchError('');
    }
  }, [open]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError('Enter username or userId');
      setExactMatch(null);
      return;
    }

    setSearchError('');
    console.log(users)
    
    const foundUser = users.find(user => 
      (user.username === searchTerm.trim() && user._id !== currentUser?._id) || 
      (user.userId === searchTerm.trim() && user._id !== currentUser?._id) ||
      (user._id === searchTerm.trim() && user._id !== currentUser?._id)
    );

    if (foundUser) {
      setExactMatch(foundUser);
    } else {
      setExactMatch(null);
      setSearchError(`No user found: "${searchTerm}"`);
    }
  };

  const handleAddSelectedUser = () => {
    if (exactMatch) {
      const isSelected = selectedUsers.some(u => u._id === exactMatch._id);
      if (!isSelected) {
        setSelectedUsers([...selectedUsers, exactMatch]);
        setExactMatch(null);
        setSearchTerm('');
      } else {
        setSearchError('User already selected');
      }
    }
  };

  const toggleUserSelection = (user) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedUsers.length < 1) {
      setError('Please select at least 1 other member');
      return;
    }

    if (selectedUsers.length > 49) {
      setError('Maximum 50 members allowed per group');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const participantIds = selectedUsers.map(user => user._id);
      await onCreate(groupName.trim(), participantIds);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
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
          <h3 className="text-lg font-semibold text-white">Create New Group</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Members (select at least 1)
            </label>
            <div className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchError('');
                    setExactMatch(null);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter exact username or userId"
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
                Must match exactly (case-sensitive)
              </p>
            </div>

            {searchError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{searchError}</p>
              </div>
            )}

            {exactMatch && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {exactMatch.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{exactMatch.username}</p>
                      {exactMatch.userId && (
                        <p className="text-gray-300 text-sm">@{exactMatch.userId}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddSelectedUser}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user._id}
                      className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 flex items-center gap-2"
                    >
                      <span className="text-blue-300 text-sm">
                        {user.username || user.userId || 'User'}
                      </span>
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="text-blue-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div className="text-sm text-gray-400 mb-4">
              <p className="font-medium mb-1">Available users ({users.filter(u => u._id !== currentUser?._id).length}):</p>
              <div className="max-h-40 overflow-y-auto bg-gray-900 rounded p-3">
                {users
                  .filter(u => u._id !== currentUser?._id)
                  .slice(0, 15)
                  .map((user) => (
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
                {users.filter(u => u._id !== currentUser?._id).length > 15 && (
                  <div className="text-center text-gray-500 text-xs pt-2">
                    ... and {users.filter(u => u._id !== currentUser?._id).length - 15} more
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !groupName.trim() || selectedUsers.length < 1}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;