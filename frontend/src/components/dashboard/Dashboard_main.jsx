import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatArea from './components/ChatArea';
import { useChat } from './hooks/useChat';

export default function Dashboard_main() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  
  const {
    messages,
    conversationPreviews,
    isLoading,
    totalUnreadCount,
    userStatuses,
    openDropdown,
    messagesEndRef,
    messagesContainerRef,
    fetchConversationPreviews,
    fetchTotalUnreadCount,
    markMessagesAsRead,
    fetchMessages,
    sendMessage,
    updateConversationSettings,
    setOpenDropdown
  } = useChat();

  const currentUser = {
    email: localStorage.getItem("Email"),
    fullname: localStorage.getItem("Fullname"),
    username: localStorage.getItem("Username"),
    userId: localStorage.getItem("Email")
  };

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser.email) {
      navigate('/login');
      return;
    }

    const newSocket = io("http://localhost:9000", {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('register', currentUser.userId);
    });

    newSocket.on('registered', (data) => {
      console.log('User registered:', data);
    });

    newSocket.on('userStatusUpdate', ({ userid, status, lastSeen }) => {
      console.log('User status update:', { userid, status, lastSeen });

      // Update user status in the userStatuses map
      setAllUsers(prev => prev.map(user =>
        user.user.email === userid
          ? { ...user, user: { ...user.user, State: status, lastSeen } }
          : user
      ));
    });

    newSocket.on('receiveone2one', ({ message, senderid, timestamp }) => {
      console.log('New message received from:', senderid);
      
      fetchTotalUnreadCount();
      fetchConversationPreviews(activeTab);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.email, currentUser.userId, navigate]);

  // Fetch users and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Initial data fetch for user:', currentUser.email);

        // Fetch all users first
        const usersResponse = await fetch('http://localhost:9000/api/allusers');
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const filteredUsers = users.filter(user => user.user.email !== currentUser.email);
          console.log('Fetched users:', filteredUsers.length);
          setAllUsers(filteredUsers);

          localStorage.removeItem('selectedChatId');

          await fetchConversationPreviews(activeTab);
          await fetchTotalUnreadCount();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUser.email]);

  // Refresh unread counts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser.email) {
        fetchTotalUnreadCount();
        fetchConversationPreviews(activeTab);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser.email]);

  // Refresh conversations when active tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (currentUser.email) {
      fetchConversationPreviews(activeTab);
    }
  }, [activeTab]);

  // Handle chat selection
  const handleChatSelect = async (user) => {
    console.log('Chat selected for user:', user.user.email);
    
    setSelectedChat(user);
    
    // Mark messages as read when opening conversation
    await markMessagesAsRead(user.user.email);

    // Fetch messages for this conversation
    fetchMessages(user.user.email);

    // Save selected chat to localStorage for persistence
    localStorage.setItem('selectedChatId', user.user.email);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !socket) return;

    await sendMessage(message, selectedChat, socket);
    setMessage('');
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    if (socket) {
      socket.disconnect();
    }
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUnreadCount={totalUnreadCount}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />
      
      <ChatList
        activeTab={activeTab}
        selectedChat={selectedChat}
        allUsers={allUsers}
        conversationPreviews={conversationPreviews}
        isLoading={isLoading}
        handleChatSelect={handleChatSelect}
        updateConversationSettings={updateConversationSettings}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        currentUser={currentUser}
      />
      
      <ChatArea
        selectedChat={selectedChat}
        messages={messages}
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        activeTab={activeTab}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
      />
    </div>
  );
}










































// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MessageCircle, Users, Settings, Archive, Heart, Lock, Search, Send, Phone, Video, MoreVertical, Smile, ChevronDown } from 'lucide-react';
// import io from 'socket.io-client';

// export default function Dashboard_main() {
//   const navigate = useNavigate();
//   const [socket, setSocket] = useState(null);
//   const [activeTab, setActiveTab] = useState('chats');
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [conversationPreviews, setConversationPreviews] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [totalUnreadCount, setTotalUnreadCount] = useState(0);
//   const [userStatuses, setUserStatuses] = useState(new Map());
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);

//   const currentUser = {
//     email: localStorage.getItem("Email"),
//     fullname: localStorage.getItem("Fullname"),
//     username: localStorage.getItem("Username"),
//     userId: localStorage.getItem("Email")
//   };

//   // Initialize socket connection
//   useEffect(() => {
//     if (!currentUser.email) {
//       navigate('/login');
//       return;
//     }

//     const newSocket = io("http://localhost:9000", {
//       transports: ['websocket', 'polling']
//     });

//     newSocket.on('connect', () => {
//       console.log('Connected to server');
//       newSocket.emit('register', currentUser.userId);
//     });

//     newSocket.on('registered', (data) => {
//       console.log('User registered:', data);
//     });

//     newSocket.on('userStatusUpdate', ({ userid, status, lastSeen }) => {
//       console.log('User status update:', { userid, status, lastSeen });

//       setUserStatuses(prev => {
//         const newMap = new Map(prev);
//         newMap.set(userid, { status, lastSeen: new Date(lastSeen) });
//         return newMap;
//       });

//       setAllUsers(prev => prev.map(user =>
//         user.user.email === userid
//           ? { ...user, user: { ...user.user, State: status, lastSeen } }
//           : user
//       ));

//       setConversationPreviews(prev => prev.map(preview =>
//         preview.user.user.email === userid
//           ? { ...preview, user: { ...preview.user, user: { ...preview.user.user, State: status, lastSeen } } }
//           : preview
//       ));
//     });

//     newSocket.on('receiveone2one', ({ message, senderid, timestamp }) => {
//       console.log('New message received from:', senderid);
//       setMessages(prev => [...prev, {
//         id: Date.now(),
//         text: message,
//         sender: senderid,
//         timestamp: timestamp,
//         isOwn: false
//       }]);

//       fetchTotalUnreadCount();
//       fetchConversationPreviews();
//     });

//     newSocket.on('error', (error) => {
//       console.error('Socket error:', error);
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [currentUser.email, currentUser.userId, navigate]);

//   // Fetch users and conversations
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         console.log('Initial data fetch for user:', currentUser.email);

//         // Fetch all users first
//         const usersResponse = await fetch('http://localhost:9000/api/allusers');
//         if (usersResponse.ok) {
//           const users = await usersResponse.json();
//           const filteredUsers = users.filter(user => user.user.email !== currentUser.email);
//           console.log('Fetched users:', filteredUsers.length);
//           setAllUsers(filteredUsers);

//           localStorage.removeItem('selectedChatId');

//           await fetchConversationPreviews();
//           await fetchTotalUnreadCount();
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentUser.email]);

//   // Refresh unread counts periodically
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (currentUser.email) {
//         fetchTotalUnreadCount();
//         fetchConversationPreviews();
//       }
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [currentUser.email]);

//   // Refresh conversations when active tab changes
//   useEffect(() => {
//     console.log('Active tab changed to:', activeTab);
//     if (currentUser.email) {
//       fetchConversationPreviews();
//     }
//   }, [activeTab]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (openDropdown && !event.target.closest('.dropdown-container')) {
//         setOpenDropdown(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [openDropdown]);

//   // Fetch total unread count for the current user
//   const fetchTotalUnreadCount = async () => {
//     try {
//       const response = await fetch(`http://localhost:9000/api/getTotalUnreadCount/${currentUser.email}`);
//       if (response.ok) {
//         const data = await response.json();
//         setTotalUnreadCount(data.totalUnreadCount);
//       }
//     } catch (error) {
//       console.error('Error fetching total unread count:', error);
//     }
//   };

//   // Mark messages as read when opening a conversation
//   const markMessagesAsRead = async (otherUserEmail) => {
//     try {
//       const response = await fetch('http://localhost:9000/api/markMessagesAsRead', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           senderid: currentUser.email,
//           receiverid: otherUserEmail
//         })
//       });

//       if (response.ok) {
//         console.log('Messages marked as read for:', otherUserEmail);
//       }

//       fetchTotalUnreadCount();
//       fetchConversationPreviews();
//     } catch (error) {
//       console.error('Error marking messages as read:', error);
//     }
//   };

//   const fetchConversationPreviews = async () => {
//     try {
//       console.log('Fetching conversations for user:', currentUser.email);
//       console.log('Active tab:', activeTab);

//       let filter = 'unarchived'; // default for chats tab
//       if (activeTab === 'archive') filter = 'archived';
//       else if (activeTab === 'favorites') filter = 'favorites';
//       else if (activeTab === 'locked') filter = 'locked';

//       const conversationsResponse = await fetch(
//         `http://localhost:9000/api/getConversationsWithMessages/${currentUser.email}?filter=${filter}`
//       );

//       console.log('API Response status:', conversationsResponse.status);

//       if (conversationsResponse.ok) {
//         const data = await conversationsResponse.json();
//         console.log('API response data - total conversations:', data.conversations.length);
//         console.log('Filter applied:', filter);

//         const validPreviews = data.conversations
//           .filter(conv => conv.otherMember)
//           .map(conv => ({
//             conversation: conv,
//             user: {
//               user: conv.otherMember,
//               userid: conv.otherMember._id || conv.otherMember.email
//             },
//             lastMessage: conv.latestMessage,
//             unreadCount: conv.unreadCount || 0,
//             totalMessages: conv.totalMessages || 0,
//             hasMessages: conv.hasMessages || false,
//             userSettings: conv.userSettings || {
//               archived: false,
//               locked: false,
//               favorite: false
//             }
//           }))
//           .sort((a, b) => {
//             // Sort by latest message or conversation date
//             if (!a.lastMessage && !b.lastMessage) return 0;
//             if (!a.lastMessage) return 1;
//             if (!b.lastMessage) return -1;
//             return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
//           });

//         console.log('Processed conversation previews:', validPreviews.length);
//         console.log('Sample preview:', validPreviews[0]);
//         setConversationPreviews(validPreviews);
//       } else {
//         console.error('API request failed:', conversationsResponse.status, conversationsResponse.statusText);
//       }
//     } catch (error) {
//       console.error('Error fetching conversation previews:', error);
//     }
//   };

//   // Fetch messages for selected chat
//   const fetchMessages = async (userId) => {
//     if (!currentUser.userId || !userId) return;

//     try {
//       console.log('Fetching messages for conversation with:', userId);
//       const response = await fetch('http://localhost:9000/api/getmessage', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           senderid: currentUser.userId,
//           receiverid: userId
//         })
//       });

//       if (response.ok) {
//         const fetchedMessages = await response.json();
//         console.log('Fetched messages count:', fetchedMessages.length);
//         const formattedMessages = fetchedMessages.map((msg) => ({
//           id: msg._id,
//           text: msg.message,
//           sender: msg.senderid,
//           timestamp: msg.timestamp,
//           isOwn: msg.senderid === currentUser.userId,
//           isRead: msg.msgRead === 'yes'
//         }));

//         setMessages(formattedMessages);

//         setTimeout(() => {
//           scrollToBottom();
//         }, 100);
//       }
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     }
//   };

//   // Simple scroll to bottom function
//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView();
//     }
//   };

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (messages.length > 0) {
//       scrollToBottom();
//     }
//   }, [messages]);

//   // Handle chat selection
//   const handleChatSelect = async (user) => {
//     console.log('Chat selected for user:', user.user.email);
    
//     setSelectedChat(user);
//     setMessages([]);

//     // Mark messages as read when opening conversation
//     await markMessagesAsRead(user.user.email);

//     // Fetch messages for this conversation
//     fetchMessages(user.user.email);

//     // Save selected chat to localStorage for persistence
//     localStorage.setItem('selectedChatId', user.user.email);
//   };

//   // Send message
//   const sendMessage = async () => {
//     if (!message.trim() || !selectedChat || !socket) return;

//     console.log('Sending message to:', selectedChat.user.email);

//     // Always create conversation when sending first message
//     try {
//       const createConvResponse = await fetch('http://localhost:9000/api/createConversation', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           senderid: currentUser.email,
//           receiverid: selectedChat.user.email
//         })
//       });

//       if (createConvResponse.ok) {
//         const data = await createConvResponse.json();
//         console.log('Conversation creation response:', data.message);
//       }
//     } catch (error) {
//       console.error('Error creating conversation:', error);
//     }

//     // Send the message
//     const newMessage = {
//       id: Date.now(),
//       text: message.trim(),
//       sender: currentUser.userId,
//       timestamp: new Date(),
//       isOwn: true
//     };

//     setMessages(prev => [...prev, newMessage]);

//     socket.emit('sendone2oneMSG', {
//       senderid: currentUser.userId,
//       receiverid: selectedChat.user.email,
//       message: message.trim()
//     });

//     setMessage('');

//     // Refresh conversation list after sending message
//     setTimeout(() => {
//       fetchConversationPreviews();
//     }, 500);
//   };

//   // Handle key press
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const updateConversationSettings = async (conversationId, settings) => {
//     try {
//       console.log('Updating conversation settings:', { conversationId, settings });
//       const response = await fetch('http://localhost:9000/api/updateConversationSettings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           conversationId: conversationId,
//           userId: currentUser.email,
//           settings: settings
//         })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Settings updated:', data.message);
//         fetchConversationPreviews();
//         return data;
//       }
//     } catch (error) {
//       console.error('Error updating conversation settings:', error);
//     }
//   };

//   // Logout function
//   const handleLogout = () => {
//     localStorage.clear();
//     if (socket) {
//       socket.disconnect();
//     }
//     navigate('/login');
//   };

//   const sidebarItems = [
//     { id: 'chats', icon: MessageCircle, label: 'Chats' },
//     { id: 'users', icon: Users, label: 'Users' },
//     { id: 'archive', icon: Archive, label: 'Archive' },
//     { id: 'favorites', icon: Heart, label: 'Favorites' },
//     { id: 'locked', icon: Lock, label: 'Locked' },
//     { id: 'settings', icon: Settings, label: 'Settings' },
//   ];

//   return (
//     <div className="h-screen bg-gray-900 flex">
//       {/* Sidebar */}
//       <div className="w-20 bg-gray-800 flex flex-col items-center py-6 border-r border-gray-700">
//         {/* Logo */}
//         <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-8">
//           <MessageCircle className="w-6 h-6 text-white" />
//         </div>

//         {/* Navigation Items */}
//         <div className="flex flex-col space-y-4 flex-1">
//           {sidebarItems.map((item) => (
//             <div key={item.id} className="relative">
//               <button
//                 onClick={() => setActiveTab(item.id)}
//                 className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
//                   activeTab === item.id
//                     ? 'bg-blue-500 text-white'
//                     : 'text-gray-400 hover:text-white hover:bg-gray-700'
//                 }`}
//                 title={item.label}
//               >
//                 <item.icon className="w-6 h-6" />
//               </button>
//               {/* Unread message badge for chats tab */}
//               {item.id === 'chats' && totalUnreadCount > 0 && (
//                 <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//                   {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
//                 </div>
//               )}
//               {/* Conversation count badges for other tabs */}
//               {item.id === 'archive' && conversationPreviews.length > 0 && activeTab !== 'archive' && (
//                 <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//                   {conversationPreviews.length}
//                 </div>
//               )}
//               {item.id === 'favorites' && conversationPreviews.length > 0 && activeTab !== 'favorites' && (
//                 <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//                   {conversationPreviews.length}
//                 </div>
//               )}
//               {item.id === 'locked' && conversationPreviews.length > 0 && activeTab !== 'locked' && (
//                 <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//                   {conversationPreviews.length}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* User Avatar & Logout */}
//         <div className="flex flex-col items-center space-y-4">
//           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//             {currentUser.fullname?.charAt(0) || 'U'}
//           </div>
//           <button
//             onClick={handleLogout}
//             className="text-gray-400 hover:text-red-400 transition-colors"
//             title="Logout"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Chat List */}
//       <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-700">
//           <h1 className="text-2xl font-bold text-white mb-4">
//             {activeTab === 'chats' && 'Chats'}
//             {activeTab === 'users' && 'All Users'}
//             {activeTab === 'archive' && 'Archived'}
//             {activeTab === 'favorites' && 'Favorites'}
//             {activeTab === 'locked' && 'Locked'}
//             {activeTab === 'settings' && 'Settings'}
//           </h1>

//           {(activeTab === 'chats' || activeTab === 'users') && (
//             <div className="relative">
//               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-32">
//               <div className="text-gray-400">Loading...</div>
//             </div>
//           ) : (
//             <>
//               {activeTab === 'chats' && (
//                 <div className="p-4 space-y-2">
//                   {conversationPreviews.length === 0 ? (
//                     <div className="text-center text-gray-400 py-8">
//                       {allUsers.length > 0 
//                         ? 'No conversations with messages yet. Start chatting with users!'
//                         : 'No users found. Add some friends to start chatting!'
//                       }
//                     </div>
//                   ) : (
//                     conversationPreviews.map((preview) => (
//                       <div
//                         key={preview.conversation._id || preview.conversation.Conversation_id}
//                         className="relative group"
//                       >
//                         <div
//                           onClick={() => handleChatSelect(preview.user)}
//                           className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                             selectedChat?.user?.email === preview.user.user.email
//                               ? 'bg-blue-500'
//                               : 'hover:bg-gray-700'
//                           }`}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold relative">
//                               {preview.user.user.Fullname?.charAt(0) || 'U'}
//                               {/* Status indicators */}
//                               {preview.userSettings.locked && (
//                                 <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
//                                   <Lock className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                               {preview.userSettings.favorite && (
//                                 <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
//                                   <Heart className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                               {preview.userSettings.archived && (
//                                 <div className="absolute -bottom-1 -left-1 bg-gray-600 rounded-full p-1">
//                                   <Archive className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center justify-between">
//                                 <p className="text-white font-medium truncate">
//                                   {preview.user.user.Fullname}
//                                   {preview.userSettings.archived && (
//                                     <Archive className="w-3 h-3 inline ml-2 text-gray-400" />
//                                   )}
//                                 </p>
//                                 {preview.lastMessage && (
//                                   <span className="text-xs text-gray-400">
//                                     {new Date(preview.lastMessage.timestamp).toLocaleTimeString([], {
//                                       hour: '2-digit',
//                                       minute: '2-digit'
//                                     })}
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <p className="text-gray-400 text-sm truncate">
//                                   {preview.lastMessage ? (
//                                     <>
//                                       {preview.lastMessage.senderid === currentUser.email ? 'You: ' : ''}
//                                       {preview.lastMessage.message}
//                                     </>
//                                   ) : (
//                                     'No messages yet'
//                                   )}
//                                 </p>
//                                 {preview.unreadCount > 0 && (
//                                   <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
//                                     {preview.unreadCount}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className={`w-3 h-3 rounded-full ${
//                               preview.user.user.State === 'Online' ? 'bg-green-500' : 'bg-gray-500'
//                             }`} />
//                           </div>
//                         </div>

//                         {/* WhatsApp-like dropdown menu - show on hover */}
//                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <div className="relative">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setOpenDropdown(openDropdown === preview.conversation._id ? null : preview.conversation._id);
//                               }}
//                               className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg"
//                               title="More options"
//                             >
//                               <ChevronDown className="w-4 h-4" />
//                             </button>

//                             {/* Dropdown menu */}
//                             {openDropdown === preview.conversation._id && (
//                               <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     updateConversationSettings(preview.conversation.Conversation_id, {
//                                       archived: !preview.userSettings.archived
//                                     });
//                                     setOpenDropdown(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
//                                 >
//                                   <Archive className="w-4 h-4" />
//                                   <span>{preview.userSettings.archived ? 'Unarchive chat' : 'Archive chat'}</span>
//                                 </button>

//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     updateConversationSettings(preview.conversation.Conversation_id, {
//                                       favorite: !preview.userSettings.favorite
//                                     });
//                                     setOpenDropdown(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
//                                 >
//                                   <Heart className={`w-4 h-4 ${
//                                     preview.userSettings.favorite ? 'text-red-500 fill-current' : ''
//                                   }`} />
//                                   <span>{preview.userSettings.favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
//                                 </button>

//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     updateConversationSettings(preview.conversation.Conversation_id, {
//                                       locked: !preview.userSettings.locked
//                                     });
//                                     setOpenDropdown(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
//                                 >
//                                   <Lock className={`w-4 h-4 ${
//                                     preview.userSettings.locked ? 'text-yellow-500' : ''
//                                   }`} />
//                                   <span>{preview.userSettings.locked ? 'Unlock chat' : 'Lock chat'}</span>
//                                 </button>

//                                 <div className="border-t border-gray-200 my-1"></div>

//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setOpenDropdown(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3"
//                                 >
//                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                   </svg>
//                                   <span>Delete chat</span>
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}

//               {activeTab === 'users' && (
//                 <div className="p-4 space-y-2">
//                   {allUsers.length === 0 ? (
//                     <div className="text-center text-gray-400 py-8">
//                       No users found
//                     </div>
//                   ) : (
//                     allUsers.map((user) => {
//                       // Check if conversation exists with this user
//                       const existingConversation = conversationPreviews.find(
//                         preview => preview.user.user.email === user.user.email
//                       );
                      
//                       const hasConversation = existingConversation && existingConversation.hasMessages;
                      
//                       return (
//                         <div
//                           key={user.userid}
//                           onClick={() => handleChatSelect(user)}
//                           className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                             selectedChat?.user?.email === user.user.email
//                               ? 'bg-blue-500'
//                               : 'hover:bg-gray-700'
//                           }`}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold relative">
//                               {user.user.Fullname?.charAt(0) || 'U'}
//                               {hasConversation && (
//                                 <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
//                                   <MessageCircle className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="text-white font-medium truncate">
//                                 {user.user.Fullname}
//                                 {hasConversation && (
//                                   <span className="ml-2 text-xs text-green-400">• Chat exists</span>
//                                 )}
//                               </p>
//                               <p className="text-gray-400 text-sm truncate">
//                                 @{user.user.Username}
//                               </p>
//                             </div>
//                             <div className={`w-3 h-3 rounded-full ${
//                               user.user.State === 'Online' ? 'bg-green-500' : 'bg-gray-500'
//                             }`} />
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>
//               )}

//               {activeTab === 'settings' && (
//                 <div className="p-6 space-y-4">
//                   <div className="text-center">
//                     <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
//                       {currentUser.fullname?.charAt(0) || 'U'}
//                     </div>
//                     <h3 className="text-white font-semibold">{currentUser.fullname}</h3>
//                     <p className="text-gray-400">@{currentUser.username}</p>
//                     <p className="text-gray-400 text-sm">{currentUser.email}</p>
//                   </div>

//                   <div className="space-y-2">
//                     <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
//                       Profile Settings
//                     </button>
//                     <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
//                       Privacy & Security
//                     </button>
//                     <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
//                       Notifications
//                     </button>
//                     <button className="w-full p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors">
//                       Theme
//                     </button>
//                     <button
//                       onClick={handleLogout}
//                       className="w-full p-3 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {(activeTab === 'archive' || activeTab === 'favorites' || activeTab === 'locked') && (
//                 <div className="p-4 space-y-2">
//                   {conversationPreviews.length === 0 ? (
//                     <div className="text-center text-gray-400 py-8">
//                       {activeTab === 'archive' && 'No archived conversations'}
//                       {activeTab === 'favorites' && 'No favorite conversations. Click the heart icon in a chat to add it to favorites.'}
//                       {activeTab === 'locked' && 'No locked conversations. Click the lock icon in a chat to lock it.'}
//                     </div>
//                   ) : (
//                     conversationPreviews.map((preview) => (
//                       <div
//                         key={preview.conversation._id || preview.conversation.Conversation_id}
//                         className="relative group"
//                       >
//                         <div
//                           onClick={() => handleChatSelect(preview.user)}
//                           className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                             selectedChat?.user?.email === preview.user.user.email
//                               ? 'bg-blue-500'
//                               : 'hover:bg-gray-700'
//                           }`}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold relative">
//                               {preview.user.user.Fullname?.charAt(0) || 'U'}
//                               {/* Status indicators */}
//                               {preview.userSettings.locked && (
//                                 <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
//                                   <Lock className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                               {preview.userSettings.favorite && (
//                                 <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
//                                   <Heart className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                               {preview.userSettings.archived && (
//                                 <div className="absolute -bottom-1 -left-1 bg-gray-600 rounded-full p-1">
//                                   <Archive className="w-2 h-2 text-white" />
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center justify-between">
//                                 <p className="text-white font-medium truncate">
//                                   {preview.user.user.Fullname}
//                                   {preview.userSettings.archived && activeTab !== 'archive' && (
//                                     <Archive className="w-3 h-3 inline ml-2 text-gray-400" />
//                                   )}
//                                 </p>
//                                 {preview.lastMessage && (
//                                   <span className="text-xs text-gray-400">
//                                     {new Date(preview.lastMessage.timestamp).toLocaleTimeString([], {
//                                       hour: '2-digit',
//                                       minute: '2-digit'
//                                     })}
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <p className="text-gray-400 text-sm truncate">
//                                   {preview.lastMessage ? (
//                                     <>
//                                       {preview.lastMessage.senderid === currentUser.email ? 'You: ' : ''}
//                                       {preview.lastMessage.message}
//                                     </>
//                                   ) : (
//                                     'No messages yet'
//                                   )}
//                                 </p>
//                                 {preview.unreadCount > 0 && (
//                                   <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
//                                     {preview.unreadCount}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className={`w-3 h-3 rounded-full ${
//                               preview.user.user.State === 'Online' ? 'bg-green-500' : 'bg-gray-500'
//                             }`} />
//                           </div>
//                         </div>

//                         {/* Action buttons - show on hover */}
//                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
//                           {activeTab === 'archive' && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 updateConversationSettings(preview.conversation.Conversation_id, {
//                                   archived: false
//                                 });
//                               }}
//                               className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
//                               title="Unarchive"
//                             >
//                               <Archive className="w-3 h-3" />
//                             </button>
//                           )}
//                           {activeTab === 'favorites' && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 updateConversationSettings(preview.conversation.Conversation_id, {
//                                   favorite: false
//                                 });
//                               }}
//                               className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
//                               title="Remove from favorites"
//                             >
//                               <Heart className="w-3 h-3" />
//                             </button>
//                           )}
//                           {activeTab === 'locked' && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 updateConversationSettings(preview.conversation.Conversation_id, {
//                                   locked: false
//                                 });
//                               }}
//                               className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
//                               title="Unlock"
//                             >
//                               <Lock className="w-3 h-3" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-900">
//         {selectedChat ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//                   {selectedChat.user.Fullname?.charAt(0) || 'U'}
//                 </div>
//                 <div>
//                   <h3 className="text-white font-semibold">{selectedChat.user.Fullname}</h3>
//                   <p className="text-gray-400 text-sm">
//                     {selectedChat.user.State === 'Online' ? 'Online' : 'Offline'}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
//                   <Phone className="w-5 h-5" />
//                 </button>
//                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
//                   <Video className="w-5 h-5" />
//                 </button>
//                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
//                   <MoreVertical className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Messages Area */}
//             <div
//               ref={messagesContainerRef}
//               className="flex-1 overflow-y-auto p-4 space-y-4"
//             >
//               {messages.length === 0 ? (
//                 <div className="text-center text-gray-400 py-8">
//                   No messages yet. Start the conversation!
//                 </div>
//               ) : (
//                 messages.map((msg) => (
//                   <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
//                     <div
//                       className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                         msg.isOwn
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-700 text-white'
//                       }`}
//                     >
//                       <p>{msg.text}</p>
//                       <div className={`flex items-center justify-between mt-1 ${
//                         msg.isOwn ? 'text-blue-100' : 'text-gray-400'
//                       }`}>
//                         <span className="text-xs">
//                           {new Date(msg.timestamp).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </span>
//                         {msg.isOwn && (
//                           <div className="flex items-center ml-2">
//                             {/* Read receipt indicators */}
//                             <svg
//                               className={`w-3 h-3 ${msg.isRead ? 'text-blue-200' : 'text-gray-400'}`}
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                             </svg>
//                             <svg
//                               className={`w-3 h-3 -ml-1 ${msg.isRead ? 'text-blue-200' : 'text-gray-400'}`}
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                             </svg>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input */}
//             <div className="bg-gray-800 border-t border-gray-700 p-4">
//               <div className="flex items-center space-x-2">
//                 <button className="p-2 text-gray-400 hover:text-white transition-colors">
//                   <Smile className="w-5 h-5" />
//                 </button>
//                 <div className="flex-1 relative">
//                   <input
//                     type="text"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Type a message..."
//                     className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <button
//                   onClick={sendMessage}
//                   disabled={!message.trim()}
//                   className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Send className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-400 mb-2">Welcome to Chat Now</h3>
//               <p className="text-gray-500">
//                 {activeTab === 'chats' ? 'Select a conversation to start chatting' :
//                  activeTab === 'users' ? 'Select a user to start a conversation' :
//                  'Select a conversation to view messages'}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }