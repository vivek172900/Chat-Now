# Real-Time Chat Application

A full-stack real-time messaging application built with modern web technologies, featuring private and group chats, customizable themes, and seamless real-time communication.

## ✨ Features

### 💬 One-to-One Private Chat
- Real-time messaging with instant delivery
- Clear chat history
- Archive conversations
- Mark chats as favorites
- Delete conversations
- Add new conversations

### 👥 Group Chat
- Create and manage group chats
- Admin and member role management
- Add and remove participants
- Delete groups
- Group administration controls

### 🎨 Customization
- Multiple application themes
- Customizable message themes
- Personalized chat experience

### 🔐 Authentication & Profile
- Secure authentication powered by Clerk
- Update username
- Change profile picture
- Customize "About" section
- User profile management

### ⚙️ Settings
- Comprehensive settings panel
- Customize your experience
- Manage preferences

## 🛠️ Tech Stack

**Frontend:**
- React.js - UI library
- Socket.IO Client - Real-time communication

**Backend:**
- Node.js - Runtime environment
- Express.js - Web framework
- Socket.IO - Real-time bidirectional communication
- MongoDB - Database

**Authentication:**
- Clerk - User authentication and management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- Clerk account for authentication

### Installation

1. Clone the repository
```bash
git clone https://github.com/vivek172900/Chat-Now.git
2 Terminals - frontend and backend
```

1. Install dependencies for both client and server
```bash
# Install server dependencies
cd frontend
npm install

# Install client dependencies
cd backend
npm install
```

3. Set up environment variables

Create a `.env` file in the server directory:
```env
# Server/backend
PORT=YOUR_PORT_NUMBER
MONGODB_URI=YOUR_DB_URL
JWT_SECRET_KEY=YOUR_JWT_KEY
FRONTEND_URL=""_URL
CLERK_WEBHOOK_SECRET=YOUR_CLERK_WEBHOOK_SECRET
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

Create a `.env` file in the client directory:
```env
# cleint/frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

4. Run the application

```bash
# Run server (from server directory)
npm run dev

# Run client (from client directory)
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Usage

1. **Sign Up/Login** - Create an account or login using Clerk authentication
2. **Start Chatting** - Add conversations or create groups to begin messaging
3. **Customize** - Navigate to settings to change themes and preferences
4. **Manage Profile** - Update your username, profile picture, and about section

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

Your Name
- GitHub: [@VivekGit](https://github.com/vivek172900)
- LinkedIn: [Vivek kumar Pandit](https://www.linkedin.com/in/vivek-kumar-pandit-a53171311/)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Clerk for authentication services
- MongoDB for database management
- React community for excellent documentation

---

⭐ Star this repo if you find it helpful!