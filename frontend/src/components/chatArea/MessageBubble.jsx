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
  isFailed = false,
  currentTheme = {
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bubbleOther: 'bg-gray-700',
    textUser: 'text-white',
    textOther: 'text-white'
  },
  currentUser // ADD THIS LINE - accept currentUser prop
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
        return <CheckCheck className="w-4 h-4 text-emerald-400" />;
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

  // Helper function to determine if a color is light or dark
  const isLightColor = (colorClass) => {
    const lightColors = [
      'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400',
      'bg-amber-50', 'bg-amber-100', 'bg-blue-50', 'bg-blue-100',
      'bg-emerald-50', 'bg-emerald-100', 'bg-purple-50', 'bg-purple-100',
      'bg-white', 'bg-gray-50'
    ];
    return lightColors.some(lightColor => colorClass.includes(lightColor));
  };

  const isUserBubbleLight = isLightColor(currentTheme.bubbleUser);
  const isOtherBubbleLight = isLightColor(currentTheme.bubbleOther);

  // Determine text colors based on bubble background
  const userTextColor = isUserBubbleLight ? 'text-gray-900' : 'text-white';
  const otherTextColor = isOtherBubbleLight ? 'text-gray-900' : 'text-white';
  
  // Determine secondary text colors (for message type indicators and time)
  const userSecondaryTextColor = isUserBubbleLight ? 'text-gray-700' : 'text-blue-100';
  const otherSecondaryTextColor = isOtherBubbleLight ? 'text-gray-700' : 'text-gray-400';

  const renderMediaMessage = () => {
    if (!mediaUrl) return null;

    switch(messageType) {
      case 'image':
        return (
          <div className="mt-2">
            <img 
              src={mediaUrl} 
              alt={content || ''} 
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

  // Get sender's profile picture or initials
  const getSenderAvatar = () => {
    if (!sender) return null;
    
    if (sender.profilePic) {
      return (
        <img 
          src={sender.profilePic} 
          alt={sender.username} 
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
        {sender.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  // Get own user avatar using currentUser - UPDATED FUNCTION
  const getOwnAvatar = () => {
    if (!currentUser) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
          {/* Default */}
        </div>
      );
    }
    
    if (currentUser.profilePic) {
      return (
        <img 
          src={currentUser.profilePic} 
          alt={currentUser.username} 
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
        {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Avatar for other users' messages - Always show for non-own messages */}
      {!isOwn && sender && (
        <div className="flex-shrink-0 mr-3 self-end">
          {getSenderAvatar()}
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
        {/* Sender name for group chats */}
        {!isOwn && sender && showAvatar && (
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
                  ? 'bg-red-900/30 border border-red-800/50 rounded-br-none'
                  : isSending
                    ? 'bg-blue-500/70 rounded-br-none'
                    : `${currentTheme.bubbleUser || 'bg-gradient-to-r from-blue-500 to-blue-600'} rounded-br-none`
                : `${currentTheme.bubbleOther || 'bg-gray-700'} rounded-bl-none`
            }`}
          >
            {/* Message type indicator */}
            {messageType !== 'text' && (
              <div className={`flex items-center mb-1 text-sm ${
                isOwn ? userSecondaryTextColor : otherSecondaryTextColor
              }`}>
                {getMessageTypeIcon()}
                <span className="capitalize">{messageType}</span>
              </div>
            )}
            
            {/* Message content */}
            <p className={`whitespace-pre-wrap break-words ${isOwn ? userTextColor : otherTextColor}`}>
              {content}
            </p>
            
            {/* Media content */}
            {renderMediaMessage()}
            
            {/* Message status and time */}
            <div className={`flex items-center justify-end mt-1 space-x-2 ${
              isOwn ? userSecondaryTextColor : otherSecondaryTextColor
            }`}>
              <span className="text-xs">{formatTime(createdAt)}</span>
              {getStatusIcon()}
            </div>
          </div>
          

          
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
      
      {/* Avatar for own messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-3 self-end">
          {getOwnAvatar()}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;