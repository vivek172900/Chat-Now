import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Smile, Send, Paperclip, Image as ImageIcon, Mic } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatArea = ({
  selectedChat,
  messages,
  currentUser,
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  onTyping,
  typingUsers,
  messagesEndRef,
  messagesContainerRef,
  scrollToBottom,
  isSending = false,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const isSomeoneTyping = selectedChat && 
    typingUsers[selectedChat._id] && 
    Object.values(typingUsers[selectedChat._id]).some(time => 
      time && Date.now() - new Date(time).getTime() < 3000
    );

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 1000);

    setTypingTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        onTyping?.(false);
      }
    };
  }, [typingTimeout, isTyping, onTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const getOtherParticipant = () => {
    if (!selectedChat || selectedChat.isGroupChat) return null;
    return selectedChat.participants?.find(
      participant => participant._id !== currentUser?._id
    );
  };

  const otherParticipant = getOtherParticipant();
  const isGroupChat = selectedChat?.isGroupChat;

  const renderChatHeader = () => (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {isGroupChat ? (
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedChat.chatName?.charAt(0)?.toUpperCase() || 'G'}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherParticipant?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {otherParticipant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </div>
        )}
        
        <div>
          <h3 className="text-white font-semibold">
            {isGroupChat ? selectedChat.chatName : otherParticipant?.username || 'User'}
          </h3>
          <p className="text-gray-400 text-sm">
            {isGroupChat 
              ? `${selectedChat.participants?.length || 0} members`
              : otherParticipant?.isOnline ? 'Online' : 'Offline'
            }
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
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message!</p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const prevMessage = messages[index - 1];
            const showAvatar = isGroupChat && 
              msg.sender?._id !== currentUser?._id && 
              (index === 0 || prevMessage?.sender?._id !== msg.sender?._id);
            
            return (
              <MessageBubble
                key={msg._id || `temp-${index}`}
                message={msg}
                isOwn={msg.sender?._id === currentUser?._id}
                showAvatar={showAvatar}
                sender={msg.sender}
                isSending={msg.status === 'sending'}
                isFailed={msg.status === 'failed'}
              />
            );
          })}
          
          {isSomeoneTyping && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {isGroupChat && typingUsers[selectedChat._id] 
                  ? Object.keys(typingUsers[selectedChat._id])
                      .filter(userId => {
                        const timestamp = typingUsers[selectedChat._id][userId];
                        return timestamp && Date.now() - new Date(timestamp).getTime() < 3000;
                      })
                      .map((userId, index, array) => {
                        const user = selectedChat.participants?.find(p => p._id === userId);
                        return user?.username || 'Someone';
                      })
                      .join(', ') + ' typing...'
                  : 'typing...'
                }
              </span>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderMessageInput = () => (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyPress={onKeyPress}
            placeholder="Type a message..."
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:opacity-50"
            disabled={isSending}
          />
          {isSending && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {message.trim() && !isSending ? (
          <button
            onClick={onSendMessage}
            disabled={isSending}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button 
            className="p-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isSending}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
        
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Smile className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {renderChatHeader()}
      {renderMessages()}
      {renderMessageInput()}
    </div>
  );
};

export default ChatArea;