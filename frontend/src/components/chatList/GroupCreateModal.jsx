import React, { useState, useEffect } from 'react';
import { X, Search, Users } from 'lucide-react';

const GroupCreateModal = ({ open, onCreate, onClose, users, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [exactMatch, setExactMatch] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (open) {
      setGroupName('');
      setSearchTerm('');
      setSelectedUsers([]);
      setError('');
      setExactMatch(null);
      setSearchError('');
      setSearchResults([]);
      
      console.log('Modal opened. Users prop:', users);
      console.log('Current user ID:', currentUser?._id);
      
      const filtered = users.filter(user => user._id !== currentUser?._id);
      console.log('Filtered users count:', filtered.length);
      console.log('Filtered users:', filtered);
      
      setFilteredUsers(filtered);
    }
  }, [open, users, currentUser]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError('Enter username or userId');
      setExactMatch(null);
      setSearchResults([]);
      return;
    }

    if (searchTerm.trim().length < 5) {
      setSearchError('Enter at least 5 characters');
      setExactMatch(null);
      setSearchResults([]);
      return;
    }

    setSearchError('');
    
    const searchTermLower = searchTerm.trim().toLowerCase();
    console.log('Searching for:', searchTermLower);
    console.log('Filtered users to search in:', filteredUsers);
    
    const foundUsers = filteredUsers.filter(user => {
      const matches = (user.username && user.username.toLowerCase().includes(searchTermLower)) || 
                     (user.userId && user.userId.toLowerCase().includes(searchTermLower));
      console.log(`User ${user.username} (@${user.userId}) matches:`, matches);
      return matches;
    });
    
    console.log('Found users:', foundUsers.length, foundUsers);
    
    if (foundUsers.length > 0) {
      setSearchResults(foundUsers);
      setExactMatch(null);
    } else {
      setSearchResults([]);
      setExactMatch(null);
      setSearchError(`No users found matching "${searchTerm}"`);
    }
  };

  const handleAddSelectedUser = (user) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    if (!isSelected) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchTerm('');
      setSearchResults([]);
    } else {
      setSearchError('User already selected');
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
                    setSearchResults([]);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Search username or userId (min. 5 chars)"
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={filteredUsers.length === 0}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter at least 5 characters (case-insensitive)
              </p>
            </div>

            {searchError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{searchError}</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mb-3">
                <div className="bg-gray-700 rounded-lg border border-gray-600 p-3">
                  <p className="text-gray-300 text-sm mb-2">
                    Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}:
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user.username || 'Unknown User'}</p>
                            {user.userId && (
                              <p className="text-gray-300 text-xs">@{user.userId}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSelectedUser(user)}
                          disabled={selectedUsers.some(u => u._id === user._id)}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {selectedUsers.some(u => u._id === user._id) ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
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
              <p className="font-medium mb-1">Available users ({filteredUsers.length}):</p>
              <div className="max-h-40 overflow-y-auto bg-gray-900 rounded p-3">
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice(0, 15)
                    .map((user) => (
                      <div key={user._id} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-b-0">
                        <div>
                          <span className="text-gray-300">{user.username || 'Unknown'}</span>
                          {user.userId && <span className="text-gray-500 ml-2">(@{user.userId})</span>}
                        </div>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                        >
                          {selectedUsers.some(u => u._id === user._id) ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500">No users available</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Try switching to Users tab first to load users
                    </p>
                  </div>
                )}
                {filteredUsers.length > 15 && (
                  <div className="text-center text-gray-500 text-xs pt-2">
                    ... and {filteredUsers.length - 15} more
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