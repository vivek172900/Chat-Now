import React from 'react';
import { X, Users, Crown, Calendar, Copy, LogOut, Trash2 } from 'lucide-react';

const GroupProfile = ({ group, isOpen, onClose, currentUser, onUpdateGroupChat, getDisplayId, getDisplayAvatar }) => {
  if (!isOpen || !group) return null;

  const isAdmin = group.admin?._id === currentUser._id || group.admin === currentUser._id;
  const memberCount = group.participants?.length || 0;

  const formatJoinDate = (dateValue) => {
    if (!dateValue) return 'Not available';
    
    if (dateValue.$date) {
      dateValue = new Date(dateValue.$date);
    }
    
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRemoveMember = async (participantId) => {
    if (!isAdmin) {
      alert('Only admin can remove members');
      return;
    }

    const confirm = window.confirm('Are you sure you want to remove this member?');
    if (!confirm) return;
    
    const existing = group.participants?.map(p => p._id || p) || [];
    const newParticipants = existing.filter(id => id !== participantId);
    
    const result = await onUpdateGroupChat?.(group._id, { participants: newParticipants });
    
    if (result?.success) {
      alert('Member removed successfully');
    }
  };

  const handleLeaveGroup = async () => {
    const confirm = window.confirm('Are you sure you want to leave this group?');
    if (!confirm) return;
    
    const existing = group.participants?.map(p => p._id || p) || [];
    const newParticipants = existing.filter(id => id !== currentUser._id);

    if (newParticipants.length === 0) {
      alert('Cannot leave group as you are the only member. Delete the group instead.');
      return;
    }

    const result = await onUpdateGroupChat?.(group._id, { participants: newParticipants });
    
    if (result?.success) {
      alert('You have left the group');
      onClose();
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) {
      alert('Only admin can delete the group');
      return;
    }

    const confirm = window.confirm('Are you sure you want to delete this group? This cannot be undone.');
    if (!confirm) return;
    
    const result = await onUpdateGroupChat?.(group._id, { 
      participants: [],
      isDeleted: true 
    });
    
    if (result?.success) {
      alert('Group deleted successfully');
      onClose();
    }
  };

  const handleMakeAdmin = async (participantId) => {
    if (!isAdmin) {
      alert('Only admin can change admin');
      return;
    }

    const confirm = window.confirm('Make this user the group admin?');
    if (!confirm) return;
    
    const result = await onUpdateGroupChat?.(group._id, { admin: participantId });
    
    if (result?.success) {
      alert('Admin updated successfully');
    }
  };

  const copyGroupId = () => {
    navigator.clipboard.writeText(group._id);
    alert('Group ID copied to clipboard');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-gray-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Group Information</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-8 border-r border-gray-700 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 min-h-[500px]">
                <div className="relative mb-8">
                  <div className="w-56 h-56 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden border-8 border-gray-700 shadow-2xl">
                    <div className="w-full h-full flex items-center justify-center text-white text-7xl font-bold">
                      {group.chatName?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center w-full">
                  <h2 className="text-2xl font-bold text-white mb-3 break-all px-4">
                    {group.chatName || 'Unnamed Group'}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-lg text-gray-300 font-medium">
                      {memberCount} member{memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className={`inline-block px-4 py-2 rounded-full mb-6 ${isAdmin ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    <span className="text-sm font-medium">
                      {isAdmin ? 'Group Admin' : 'Group Member'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                    <button
                      onClick={copyGroupId}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg min-w-[140px]"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </button>
                    {isAdmin && (
                      <button
                        onClick={handleDeleteGroup}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg min-w-[140px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Group
                      </button>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Group ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm text-gray-300 font-mono break-all">
                        {group._id || 'N/A'}
                      </code>
                      <button
                        onClick={copyGroupId}
                        className="text-gray-400 hover:text-white flex-shrink-0"
                        title="Copy group ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 p-8 overflow-y-auto max-h-[600px]">
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase">Group Description</h4>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                    <p className="text-gray-300 text-lg">
                      {group.description || "No description set"}
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase">Group Information</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Created On</p>
                      <p className="text-white text-lg">
                        {formatJoinDate(group.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Admin</p>
                      <p className="text-white text-lg">
                        {getDisplayId(group.admin) || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase mt-8">Members ({memberCount})</h4>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {group.participants?.map((participant) => (
                    <div key={participant._id} className="flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {participant.username?.charAt(0)?.toUpperCase() || getDisplayAvatar(participant)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {participant.username || getDisplayId(participant)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            @{participant.userId || 'No ID'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(participant._id === group.admin?._id || participant._id === group.admin) && (
                          <Crown className="w-4 h-4 text-yellow-500" title="Admin" />
                        )}
                        
                        {isAdmin && participant._id !== currentUser._id && (
                          <>
                            {participant._id !== group.admin?._id && participant._id !== group.admin && (
                              <button
                                onClick={() => handleMakeAdmin(participant._id)}
                                className="text-xs px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                                title="Make Admin"
                              >
                                Make Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(participant._id)}
                              className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                              title="Remove Member"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <button
                    onClick={handleLeaveGroup}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Group
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    Group last updated • {new Date().toLocaleDateString()}
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

export default GroupProfile;