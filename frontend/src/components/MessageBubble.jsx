import React from 'react';
import { 
  Check, 
  CheckCheck, 
  Clock,
  Image as ImageIcon,
  Video,
  File,
  Music,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MessageBubble = ({ 
  message, 
  isOwn, 
  showAvatar = false,
  sender,
  isSending = false,
  isFailed = false
}) => {
  const { 
    content, 
    messageType = 'text', 
    mediaUrl, 
    status = 'sent', 
    createdAt,
    readBy = []
  } = message;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    if (isSending) {
      return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
    
    if (isFailed) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    
    switch(status) {
      case 'seen':
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageTypeIcon = () => {
    switch(messageType) {
      case 'image':
        return <ImageIcon className="w-4 h-4 mr-1" />;
      case 'video':
        return <Video className="w-4 h-4 mr-1" />;
      case 'audio':
        return <Music className="w-4 h-4 mr-1" />;
      case 'file':
        return <File className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const renderMediaMessage = () => {
    if (!mediaUrl) return null;

    switch(messageType) {
      case 'image':
        return (
          <div className="mt-2">
            <img 
              src={mediaUrl} 
              alt="Shared image" 
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(mediaUrl, '_blank')}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="mt-2">
            <video 
              src={mediaUrl}
              controls
              className="max-w-xs rounded-lg"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="mt-2">
            <audio 
              src={mediaUrl}
              controls
              className="w-full"
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="mt-2">
            <a 
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <File className="w-5 h-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">File attachment</p>
                <p className="text-xs text-gray-400">Click to download</p>
              </div>
            </a>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Avatar for group chats */}
      {!isOwn && showAvatar && sender && (
        <div className="flex-shrink-0 mr-3 self-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
            {sender.username?.charAt(0) || 'U'}
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && sender && (
          <p className="text-xs text-gray-400 mb-1 ml-1">
            {sender.username}
          </p>
        )}
        
        <div className="flex flex-col">
          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? isFailed 
                  ? 'bg-red-900/30 text-white rounded-br-none border border-red-800/50'
                  : isSending
                    ? 'bg-blue-500/70 text-white rounded-br-none'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                : 'bg-gray-700 text-white rounded-bl-none'
            }`}
          >
            {/* Message type indicator */}
            {messageType !== 'text' && (
              <div className={`flex items-center mb-1 text-sm ${
                isOwn ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {getMessageTypeIcon()}
                <span className="capitalize">{messageType}</span>
              </div>
            )}
            
            {/* Message content */}
            <p className="whitespace-pre-wrap break-words">{content}</p>
            
            {/* Media content */}
            {renderMediaMessage()}
            
            {/* Message status and time */}
            <div className={`flex items-center justify-end mt-1 space-x-2 ${
              isOwn ? 'text-blue-100' : 'text-gray-400'
            }`}>
              <span className="text-xs">{formatTime(createdAt)}</span>
              {getStatusIcon()}
            </div>
          </div>
          
          {/* Read receipts for 1:1 chats */}
          {isOwn && readBy.length > 0 && (
            <div className="flex justify-end mt-1">
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  {readBy.slice(0, 3).map((read, index) => (
                    <div 
                      key={index}
                      className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-gray-800 flex items-center justify-center text-xs text-white"
                      title={read.user?.username || 'User'}
                    >
                      {read.user?.username?.charAt(0) || 'U'}
                    </div>
                  ))}
                </div>
                {readBy.length > 3 && (
                  <span className="text-xs text-gray-400">+{readBy.length - 3}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Failed message retry option */}
          {isFailed && isOwn && (
            <div className="flex justify-end mt-1">
              <button className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Failed to send. Tap to retry</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Avatar for own messages (if needed for alignment) */}
      {isOwn && (
        <div className="flex-shrink-0 ml-3 self-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
            {/* You can show current user's initial here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;