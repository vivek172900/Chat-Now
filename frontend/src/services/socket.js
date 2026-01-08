import io from 'socket.io-client';

let socket = null;

export const initializeSocket = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No token found for socket connection');
    return null;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:9000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      reject(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      
      // Attempt to reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // The server disconnected, try to reconnect manually
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Attempting to reconnect...', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
    });
  });
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
};

export const setupSocketListeners = (socket, callbacks) => {
  const {
    onNewMessage,
    onMessageRead,
    onTyping,
    onUserStatusChange,
    onCallInitiated,
    onCallAccepted,
    onCallEnded,
    onError,
  } = callbacks;

  socket.on('new_message', (data) => {
    console.log('📩 New message event:', data);
    onNewMessage?.(data);
  });

  socket.on('message_read', (data) => {
    console.log('✓ Message read event:', data);
    onMessageRead?.(data);
  });

  socket.on('typing_indicator', (data) => {
    console.log('⌨️ Typing indicator:', data);
    onTyping?.(data);
  });

  socket.on('user_status_change', (data) => {
    console.log('👤 User status change:', data);
    onUserStatusChange?.(data);
  });

  socket.on('incoming_call', (data) => {
    console.log('📞 Incoming call:', data);
    onCallInitiated?.(data);
  });

  socket.on('call_accepted', (data) => {
    console.log('✅ Call accepted:', data);
    onCallAccepted?.(data);
  });

  socket.on('call_ended', (data) => {
    console.log('📴 Call ended:', data);
    onCallEnded?.(data);
  });

  socket.on('message_notification', (data) => {
    console.log('🔔 Message notification:', data);
    onNewMessage?.(data);
  });

  socket.on('message_error', (error) => {
    console.error('❌ Message error:', error);
    onError?.(error);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
    onError?.(error);
  });
};

export const socketEmit = {
  sendMessage: (socket, messageData) => {
    if (!socket) {
      console.error('Socket not available for sending message');
      return;
    }
    console.log('📤 Sending message:', messageData);
    socket.emit('send_message', messageData);
  },
  
  markAsRead: (socket, messageId) => {
    if (!socket) {
      console.error('Socket not available for marking message as read');
      return;
    }
    console.log('✓ Marking message as read:', messageId);
    socket.emit('mark_as_read', { messageId });
  },
  
  typing: (socket, chatId, isTyping) => {
    if (!socket) {
      console.error('Socket not available for typing indicator');
      return;
    }
    socket.emit('typing', { chatId, isTyping });
  },
  
  callInitiate: (socket, callData) => {
    if (!socket) {
      console.error('Socket not available for call initiation');
      return;
    }
    console.log('📞 Initiating call:', callData);
    socket.emit('call_initiate', callData);
  },
  
  callAccept: (socket, callData) => {
    if (!socket) {
      console.error('Socket not available for call acceptance');
      return;
    }
    console.log('✅ Accepting call:', callData);
    socket.emit('call_accept', callData);
  },
  
  callEnd: (socket, callData) => {
    if (!socket) {
      console.error('Socket not available for ending call');
      return;
    }
    console.log('📴 Ending call:', callData);
    socket.emit('call_end', callData);
  },
};