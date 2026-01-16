import React, { useState, useRef } from 'react';
import { Smile, Send, Paperclip, Mic, X, Image as ImageIcon, FileText, File } from 'lucide-react';

const MessageInput = ({
  message,
  setMessage,
  onSendMessage,
  onSendFile,
  onKeyPress,
  isSending = false,
  markChatRead,
  selectedChat,
  currentTheme = {
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 16 * 1024 * 1024;

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
    '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
    '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
    '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
    '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
    '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',
    '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
    '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
  ];

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File size must be less than 16MB. Selected file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
    setFileType(getFileType(file.type));
    setShowFilePicker(false);
    setMessage(''); // Clear text input when file is selected
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    return 'other';
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      // Send the file
      onSendFile?.(selectedFile);
      removeSelectedFile();
    } else if (message.trim()) {
      // Send the text message
      onSendMessage?.();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-700 p-4 bg-gray-800 flex-shrink-0">
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-600 rounded">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-400 text-xs">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {fileType}
                </p>
              </div>
            </div>
            <button
              onClick={removeSelectedFile}
              className="p-1 text-gray-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {fileType === 'image' && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={removeSelectedFile}
              className="px-3 py-1 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className={`px-3 py-1 text-sm ${currentTheme.bubbleUser || 'bg-blue-500'} text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowFilePicker(false); }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={!!selectedFile || isSending}
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 w-64 h-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 overflow-y-auto">
              <div className="p-2 grid grid-cols-8 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1 hover:bg-gray-700 rounded text-lg hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowFilePicker(!showFilePicker); setShowEmojiPicker(false); }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={!!selectedFile || isSending}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {showFilePicker && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <label className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 rounded cursor-pointer">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Photo/Image</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max 16MB</p>
                </label>
                
                <label className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 rounded cursor-pointer mt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Document</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max 16MB</p>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => markChatRead?.(selectedChat?._id)}
            onKeyPress={handleKeyPress}
            placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:opacity-50"
            disabled={isSending}
          />
          {isSending && !selectedFile && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {!selectedFile && (
          <>
            {message.trim() ? (
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`p-3 ${currentTheme.bubbleUser || 'bg-blue-500'} text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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
          </>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
      />
    </div>
  );
};

export default MessageInput;