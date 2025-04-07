# CodeSync

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](https://redis.io/)

## 🚀 About CodeSync

CodeSync is a real-time collaborative platform that combines chat functionality with live coding assistance. Users can discuss code, share ideas, and get AI-powered coding help in real-time. Perfect for remote teams, study groups, or anyone looking to collaborate on code with intelligent assistance.

## ✨ Features

- **Real-time Chat**: Seamless communication with team members or study partners
- **AI Code Assistant**: Get intelligent code suggestions and solutions by mentioning `@ai` in your messages
- **Syntax Highlighting**: Support for multiple programming languages
- **Live Collaboration**: See others typing and coding in real-time
- **Code Execution**: Test and run code snippets directly in the platform
- **Responsive Design**: Works on desktop and mobile devices
- **Fast Message Retrieval**: Efficient caching system for quick loading of message history

## 🛠️ Technologies

### Frontend
- **React** - UI library
- **Vite** - Next generation frontend tooling
- **Socket.IO Client** - Real-time communication
- **CodeMirror** - Code editor component
- **Tailwind CSS** - Styling

### Backend
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **Google Gemini API** - AI-powered code assistance
- **MongoDB** - Database for persistent storage of users, rooms, and messages
- **Redis** - In-memory data store for fast caching and message retrieval

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)
- Redis server
- Google Gemini API key

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codesync.git
   cd codesync
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create `.env` files:

   Backend `.env`:
   ```
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017/codesync
   REDIS_URL=redis://localhost:6379
   ```

   Frontend `.env`:
   ```
   VITE_SERVER_URL=http://localhost:5000
   ```

### Running the Application

1. Ensure MongoDB and Redis servers are running:
   ```bash
   # Start MongoDB (command may vary based on installation)
   mongod
   
   # Start Redis (command may vary based on installation)
   redis-server
   ```

2. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

3. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🔧 How to Use

1. **Join or Create a Room**: Enter your name and a room code to join or create a coding session
2. **Chat with Team Members**: Use the chat panel to communicate with others in the room
3. **Get AI Assistance**: Type `@ai` followed by your question to get coding help from the AI assistant
   ```
   @ai How do I implement a binary search in JavaScript?
   ```
4. **Collaborate on Code**: Share, edit, and run code together in real-time


## 🗄️ Database Structure

### MongoDB Collections
- **Users**: Store user profiles and preferences
- **Rooms**: Maintain room information and settings
- **Messages**: Archive all chat messages and code snippets
- **CodeSnippets**: Store shared code blocks with version history

### Redis Caching
- **Recent Messages**: Cache recent chat messages for quick retrieval
- **Active Rooms**: Track currently active rooms and participants
- **Online Users**: Maintain list of currently connected users

## 📚 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) for powering the AI assistance
- [Socket.IO](https://socket.io/) for real-time communication capabilities
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [MongoDB](https://www.mongodb.com/) for database storage
- [Redis](https://redis.io/) for fast caching
- All the open-source libraries that made this project possible

---

Made with ❤️ by Omair