import React from 'react';
import { MessageCircle, Phone, Video, MoreVertical, Smile, Send } from 'lucide-react';

const ChatArea = ({
  selectedChat,
  messages,
  message,
  setMessage,
  handleSendMessage,
  handleKeyPress,
  activeTab,
  messagesEndRef,
  messagesContainerRef
}) => {
  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">Welcome to Chat Now</h3>
        <p className="text-gray-500">
          {activeTab === 'chats' ? 'Select a conversation to start chatting' :
           activeTab === 'users' ? 'Select a user to start a conversation' :
           'Select a conversation to view messages'}
        </p>
      </div>
    </div>
  );

  const renderChatHeader = () => (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {selectedChat.user.Fullname?.charAt(0) || 'U'}
        </div>
        <div>
          <h3 className="text-white font-semibold">{selectedChat.user.Fullname}</h3>
          <p className="text-gray-400 text-sm">
            {selectedChat.user.State === 'Online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p>{msg.text}</p>
              <div className={`flex items-center justify-between mt-1 ${
                msg.isOwn ? 'text-blue-100' : 'text-gray-400'
              }`}>
                <span className="text-xs">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {msg.isOwn && (
                  <div className="flex items-center ml-2">
                    <svg
                      className={`w-3 h-3 ${msg.isRead ? 'text-blue-200' : 'text-gray-400'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg
                      className={`w-3 h-3 -ml-1 ${msg.isRead ? 'text-blue-200' : 'text-gray-400'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderMessageInput = () => (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Smile className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col bg-gray-900">
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {renderChatHeader()}
      {renderMessages()}
      {renderMessageInput()}
    </div>
  );
};

export default ChatArea;