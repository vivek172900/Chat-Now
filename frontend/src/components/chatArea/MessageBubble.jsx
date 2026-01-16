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
  Loader2,
  Eye,
  Download
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
  currentUser,
  getDisplayId,
  getDisplayAvatar
}) => {
  const { 
    content, 
    messageType = 'text', 
    mediaUrl, 
    file,
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

  const userTextColor = isUserBubbleLight ? 'text-gray-900' : 'text-white';
  const otherTextColor = isOtherBubbleLight ? 'text-gray-900' : 'text-white';
  
  const userSecondaryTextColor = isUserBubbleLight ? 'text-gray-700' : 'text-blue-100';
  const otherSecondaryTextColor = isOtherBubbleLight ? 'text-gray-700' : 'text-gray-400';

  const parseFileData = () => {
    if (!file && !mediaUrl) return null;
    
    if (typeof file === 'object') {
      return file;
    } else if (typeof file === 'string') {
      try {
        return JSON.parse(file);
      } catch {
        return { url: mediaUrl || file, name: content || 'File' };
      }
    } else if (mediaUrl) {
      return { url: mediaUrl, name: content || 'File' };
    }
    return null;
  };

  const fileData = parseFileData();

  const getReadReceipts = () => {
    if (!isOwn || !readBy || readBy.length === 0) return null;
    
    const readers = readBy.filter(read => 
      read.user !== currentUser._id && read.user?._id !== currentUser._id
    );
    
    if (readers.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-1 mt-1">
        {/* <span className="text-xs text-gray-400">Seen by:</span>
        <div className="flex -space-x-1">
          {readers.slice(0, 3).map((read, index) => (
            <div key={index} className="w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[8px] text-white">
              {getDisplayAvatar?.(read.user) || 'U'}
            </div>
          ))}
          {readers.length > 3 && (
            <div className="w-4 h-4 rounded-full bg-gray-600 border border-white flex items-center justify-center text-[8px] text-white">
              +{readers.length - 3}
            </div>
          )}
        </div> */}
      </div>
    );
  };

  const renderFileMessage = () => {
    if (!fileData) return null;

    const fileType = messageType || (fileData.type?.startsWith('image/') ? 'image' : 'file');
    const fileName = fileData.name || content || 'file';
    const fileUrl = fileData.url || mediaUrl;
    const fileSize = fileData.size ? `(${(fileData.size / (1024 * 1024)).toFixed(2)} MB)` : '';

    if (fileType === 'image') {
      return (
        <div className="mt-2">
          <div className="relative rounded-lg overflow-hidden max-w-xs">
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileUrl, '_blank')}
            />
            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className={`truncate ${isOwn ? userSecondaryTextColor : otherSecondaryTextColor}`}>
              {fileName}
            </span>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="ml-2 p-1 text-blue-400 hover:text-blue-300"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <a 
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-3 p-3 rounded-lg hover:opacity-90 transition-opacity ${
            isOwn ? 'bg-white/10' : 'bg-gray-700/50'
          }`}
        >
          <div className="p-2 rounded bg-gray-600/50">
            <File className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${isOwn ? userTextColor : otherTextColor}`}>
              {fileName}
            </p>
            <p className={`text-xs ${isOwn ? userSecondaryTextColor : otherSecondaryTextColor}`}>
              {fileSize} • Document
            </p>
          </div>
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  };

  const getSenderAvatar = () => {
    if (!sender) return null;
    
    if (sender.profilePic) {
      return (
        <img 
          src={sender.profilePic} 
          alt={getDisplayId?.(sender) || sender.username} 
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
        {getDisplayAvatar?.(sender) || sender.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  const getOwnAvatar = () => {
    if (!currentUser) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
          {getDisplayAvatar?.(currentUser) || 'U'}
        </div>
      );
    }
    
    if (currentUser.profilePic) {
      return (
        <img 
          src={currentUser.profilePic} 
          alt={getDisplayId?.(currentUser) || currentUser.username} 
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
        {getDisplayAvatar?.(currentUser) || currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  const isEmojiOnly = () => {
    if (!content || messageType !== 'text') return false;
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})*$/u;
    return emojiRegex.test(content.trim()) && content.length <= 10;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isOwn && sender && (
        <div className="flex-shrink-0 mr-3 self-end">
          {getSenderAvatar()}
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
        {!isOwn && sender && showAvatar && (
          <p className="text-xs text-gray-400 mb-1 ml-1">
            {getDisplayId?.(sender) || sender.username}
          </p>
        )}
        
        <div className="flex flex-col">
          <div
            className={`px-4 py-2 ${
              isEmojiOnly() && !fileData
                ? 'text-3xl p-2 bg-transparent'
                : `rounded-2xl ${
                    isOwn
                      ? isFailed 
                        ? 'bg-red-900/30 border border-red-800/50 rounded-br-none'
                        : isSending
                          ? 'bg-blue-500/70 rounded-br-none'
                          : `${currentTheme.bubbleUser || 'bg-gradient-to-r from-blue-500 to-blue-600'} rounded-br-none`
                      : `${currentTheme.bubbleOther || 'bg-gray-700'} rounded-bl-none`
                  }`
            }`}
          >
            {messageType !== 'text' && !isEmojiOnly() && (
              <div className={`flex items-center mb-1 text-sm ${
                isOwn ? userSecondaryTextColor : otherSecondaryTextColor
              }`}>
                {getMessageTypeIcon()}
                <span className="capitalize">{messageType}</span>
              </div>
            )}
            
            {content && messageType === 'text' && (
              <p className={`whitespace-pre-wrap break-words ${
                isEmojiOnly() 
                  ? '' 
                  : isOwn ? userTextColor : otherTextColor
              }`}>
                {content}
              </p>
            )}
            
            {fileData && renderFileMessage()}
            
            {!isEmojiOnly() && (
              <div className={`flex items-center justify-end mt-1 space-x-2 ${
                isOwn ? userSecondaryTextColor : otherSecondaryTextColor
              }`}>
                <span className="text-xs">{formatTime(createdAt)}</span>
                {getStatusIcon()}
              </div>
            )}
            
            {isOwn && getReadReceipts()}
          </div>
          
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
      
      {isOwn && (
        <div className="flex-shrink-0 ml-3 self-end">
          {getOwnAvatar()}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;