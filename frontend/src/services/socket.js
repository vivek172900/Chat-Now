import io from 'socket.io-client';

let socket = null;

export const initializeSocket = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No token found for socket connection');
    return null;
  }

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
      
      if (reason === 'io server disconnect') {
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