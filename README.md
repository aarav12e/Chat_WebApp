# 💬 MERN Chat Application

A modern, real-time chat application built with MERN stack (MongoDB, Express, React, Node.js) featuring direct messaging, group chats, and real-time notifications using WebSockets.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Services & Features](#services--features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)

---

## 🎯 Project Overview

This is a full-stack real-time chat application that allows users to:
- Create accounts and authenticate securely
- Send direct messages to other users
- Create and manage group chats
- Send and receive messages with images
- See real-time online status of users
- Real-time message delivery and notifications

---

## 🛠️ Technology Stack

### **Backend**
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** (v5.2.1) | RESTful API framework |
| **MongoDB** | NoSQL database for data persistence |
| **Mongoose** (v9.1.5) | MongoDB ODM (Object Data Modeling) |
| **Socket.io** (v4.8.3) | Real-time bidirectional communication |
| **JWT (jsonwebtoken)** (v9.0.3) | Token-based authentication |
| **bcryptjs** (v3.0.3) | Password hashing and encryption |
| **Cloudinary** (v2.9.0) | Cloud storage for images |
| **CORS** | Cross-Origin Resource Sharing |
| **Cookie-parser** | HTTP cookie parsing middleware |
| **Dotenv** | Environment variable management |
| **Nodemon** | Development tool for auto-reloading |

### **Frontend**
| Technology | Purpose |
|------------|---------|
| **React** (v19.2.0) | UI library and component framework |
| **React Router DOM** (v7.14.2) | Client-side routing |
| **Vite** (v7.2.4) | Modern build tool and dev server |
| **Socket.io-client** (v4.8.3) | Real-time communication client |
| **Zustand** (v5.0.12) | Lightweight state management |
| **Axios** (v1.16.0) | HTTP client for API calls |
| **Tailwind CSS** (v3.4.19) | Utility-first CSS framework |
| **DaisyUI** (v4.12.24) | Component library for Tailwind |
| **Lucide React** (v1.14.0) | Icon library |
| **React Hot Toast** (v2.6.0) | Toast notifications |
| **ESLint** | Code quality and linting |

---

## 🏗️ System Architecture

### **Overall Pipeline Architecture**

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Frontend)                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Application (Vite)                   │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Pages: Login, Home, Profile, Settings         │  │  │
│  │  │  Components: ChatContainer, GroupContainer     │  │  │
│  │  │  Stores: useAuthStore, useChatStore, etc.      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │           ↓              ↓              ↓            │  │
│  │      Axios HTTP      Socket.io          Router       │  │
│  │      Requests        Real-time          Navigation   │  │
│  │      (API Calls)     Events (Chat)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
└───────────────────────────┼────────────────────────────────┘
                            │ HTTP/WebSocket
                            ↓
┌───────────────────────────────────────────────────────────┐
│                   SERVER SIDE (Backend)                   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Express.js Server                         │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  Route Handlers:                              │  │  │
│  │  │  • /api/auth      (Authentication)            │  │  │
│  │  │  • /api/messages  (Direct & Group Messages)   │  │  │
│  │  │  • /api/groups    (Group Management)          │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │           ↓              ↓              ↓           │  │
│  │    Controllers       Middleware       Socket.io     │  │
│  │    (Business          (Auth,         (Real-time     │  │
│  │     Logic)           Validation)      Sync)         │  │
│  │           ↓              ↓              ↓           │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │          Mongoose Models (ODM)                │  │  │
│  │  │  • User Model                                 │  │  │
│  │  │  • Message Model (DM & Group)                 │  │  │
│  │  │  • Group Model                                │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                    ↓                                │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │           MongoDB Database                    │  │  │
│  │  │  Collections:                                 │  │  │
│  │  │  • users       (User profiles & auth)         │  │  │
│  │  │  • messages    (All messages)                 │  │  │
│  │  │  • groups      (Group info & members)         │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│           ↓                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         External Services                           │  │
│  │  • Cloudinary (Image Storage)                       │  │
│  │  • JWT (Authentication Tokens)                      │  │
│  │  • Bcryptjs (Password Security)                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **User Authentication Flow:**
   - User submits login/signup credentials
   - Backend validates and hashes password with `bcryptjs`
   - JWT token generated and sent in HTTP cookie
   - Frontend stores token and user data in Zustand store

2. **Message Flow (Direct Messages):**
   - Sender submits message via React frontend
   - Axios sends POST request to `/api/messages/send`
   - Backend validates user authentication (JWT middleware)
   - Message saved to MongoDB via Mongoose
   - Socket.io emits real-time notification to receiver
   - Receiver's React component updates via Socket listener

3. **Group Chat Flow:**
   - Message sent to `/api/messages/send` with groupId
   - Saved to database with groupId reference
   - Socket.io broadcasts to all group room members
   - All connected members receive real-time update

4. **Image Upload Flow:**
   - User selects image in MessageInput component
   - Image uploaded to Cloudinary via backend
   - URL stored with message in database
   - Frontend displays image from Cloudinary CDN

5. **Real-time Sync:**
   - Socket.io maintains persistent WebSocket connection
   - Online/offline status shared via `getOnlineUsers` event
   - New messages broadcast to relevant recipients
   - Group room management with join/leave events

---

## 🎨 Services & Features

### **Core Services**

#### 1. **Authentication Service** (`/api/auth`)
- **Sign Up**: Create new user account
  - Email validation and uniqueness check
  - Password hashing with bcryptjs
  - Profile picture upload
  
- **Login**: Authenticate existing users
  - Email and password verification
  - JWT token generation
  - Secure HTTP-only cookies
  
- **Logout**: Clear authentication
  - Cookie removal
  - Session cleanup
  
- **Update Profile**: Modify user information
  - Change profile picture
  - Update full name

#### 2. **Direct Messaging Service** (`/api/messages`)
- **Send DM**: Send messages between two users
  - Text message support
  - Image attachment support
  - Timestamp tracking
  
- **Get Messages**: Retrieve conversation history
  - Pagination support
  - User and message validation
  
- **Delete Message**: Remove sent messages
  - Only sender can delete
  - Cascading deletion handling

#### 3. **Group Chat Service** (`/api/groups`)
- **Create Group**: Initialize new group chat
  - Set group name and description
  - Add members
  - Upload group picture
  
- **Get All Groups**: List user's groups
  - Admin and member groups
  
- **Add/Remove Members**: Manage group membership
  - Admin-only operations
  - Real-time member updates
  
- **Send Group Message**: Post to group chat
  - Message saved with groupId
  - Broadcasted to all members
  
- **Update Group**: Modify group details
  - Update name, description, picture
  - Admin-only modifications

#### 4. **Real-Time Service** (Socket.io)
- **User Connection**: Track online users
  - Store userId to socketId mapping
  - Broadcast online user list
  
- **Message Events**: Real-time message delivery
  - `newMessage` - Instant message delivery
  - `messageDeleted` - Real-time deletion sync
  
- **Group Events**: Group-specific real-time operations
  - `joinGroup` - Add user to group room
  - `leaveGroup` - Remove user from group room
  - `groupMessageReceived` - Broadcast group messages
  
- **Online Status**: Track user availability
  - `getOnlineUsers` - List of active users
  - Automatic cleanup on disconnect

---

## 📂 Project Structure

```
Chat-App/
│
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── index.js                  # Express server entry point
│   │   │
│   │   ├── controllers/              # Business logic
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── message.controller.js # Message operations
│   │   │   └── group.controller.js   # Group operations
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── auth.route.js         # Auth endpoints
│   │   │   ├── message.route.js      # Message endpoints
│   │   │   └── group.route.js        # Group endpoints
│   │   │
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── user.model.js         # User schema
│   │   │   ├── message.model.js      # Message schema
│   │   │   └── group.model.js        # Group schema
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   └── auth.middleware.js    # JWT verification
│   │   │
│   │   ├── lib/                      # Utilities & external services
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   ├── socket.js             # Socket.io setup
│   │   │   ├── cloudinary.js         # Image upload service
│   │   │   └── utils.js              # Helper functions
│   │   │
│   │   └── seeds/                    # Database seeders
│   │       └── user.seed.js          # Sample user data
│   │
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Environment variables
│
│
├── frontend/                         # React Frontend (Vite)
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Main App component
│   │   ├── index.css                 # Global styles
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx          # Main chat interface
│   │   │   ├── LoginPage.jsx         # User login
│   │   │   ├── SignUpPage.jsx        # User registration
│   │   │   ├── ProfilePage.jsx       # User profile
│   │   │   └── SettingsPage.jsx      # Settings page
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── ChatContainer.jsx     # DM chat view
│   │   │   ├── GroupChatContainer.jsx# Group chat view
│   │   │   ├── ChatHeader.jsx        # Chat header info
│   │   │   ├── ChatInput.jsx         # Message input
│   │   │   ├── MessageInput.jsx      # Enhanced input
│   │   │   ├── Sidebar.jsx           # Chat list sidebar
│   │   │   ├── Navbar.jsx            # Top navigation
│   │   │   ├── BottomNav.jsx         # Mobile bottom nav
│   │   │   ├── CreateGroupModal.jsx  # Group creation modal
│   │   │   ├── GroupHeader.jsx       # Group chat header
│   │   │   ├── GroupChatContainer.jsx# Group message display
│   │   │   ├── GroupInfoPanel.jsx    # Group details panel
│   │   │   ├── MessageContextMenu.jsx# Message options menu
│   │   │   ├── OfflineBanner.jsx     # Offline indicator
│   │   │   ├── AuthImagePattern.jsx  # Auth page imagery
│   │   │   ├── NoChatSelected.jsx    # Empty state
│   │   │   └── skeletons/            # Loading skeletons
│   │   │       ├── MessageSkeleton.jsx
│   │   │       └── SidebarSkeleton.jsx
│   │   │
│   │   ├── store/                    # Zustand state management
│   │   │   ├── useAuthStore.js       # Auth state
│   │   │   ├── useChatStore.js       # Chat/message state
│   │   │   ├── useGroupStore.js      # Group state
│   │   │   └── useThemeStore.js      # Theme state
│   │   │
│   │   ├── lib/                      # Utilities
│   │   │   ├── axios.js              # Axios configuration
│   │   │   └── utils.js              # Helper functions
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useLongPress.js       # Long-press detection
│   │   │   └── useOnlineStatus.js    # Online status tracking
│   │   │
│   │   └── constants/                # App constants
│   │       └── index.js              # Constant values
│   │
│   ├── public/                       # Static assets
│   │   ├── sw.js                     # Service worker
│   │   └── manifest.json             # PWA manifest
│   │
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── eslint.config.js              # ESLint rules
│   ├── package.json                  # Frontend dependencies
│   └── .env                          # Environment variables
│
└── package.json                      # Root package.json
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### **Backend Setup**

1. **Clone Repository**
   ```bash
   git clone https://github.com/aarav12e/Chat_WebApp.git
   cd Chat-App/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

4. **Start Backend Server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm run start
   ```
   Server runs on `http://localhost:5001`

### **Frontend Setup**

1. **Navigate to Frontend**
   ```bash
   cd Chat-App/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Start Frontend Dev Server**
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173`

### **Full Stack Setup**

From root directory:
```bash
# Build both frontend and backend
npm run build

# Start the backend (also serves production frontend)
npm start
```

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create new user account |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Clear user session |
| PUT | `/update-profile` | Update user profile |
| GET | `/check` | Verify if user is authenticated |

### **Message Routes** (`/api/messages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | Get all user conversations |
| GET | `/conversations/:id` | Get messages with specific user |
| POST | `/send/:id` | Send direct message to user |
| DELETE | `/:id` | Delete a message |
| POST | `/group-send/:groupId` | Send message to group |
| GET | `/group/:groupId` | Get group messages |

### **Group Routes** (`/api/groups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create new group |
| GET | `/` | Get all user groups |
| GET | `/:id` | Get group details |
| PUT | `/:id` | Update group info |
| POST | `/:id/members` | Add member to group |
| DELETE | `/:id/members/:memberId` | Remove member from group |
| DELETE | `/:id` | Delete entire group |

---

## 🔐 Environment Variables

### **Backend (.env)**
```env
PORT                      # Server port (default: 5001)
MONGODB_URI              # MongoDB connection string
JWT_SECRET               # Secret key for JWT tokens
CLOUDINARY_CLOUD_NAME    # Cloudinary cloud name
CLOUDINARY_API_KEY       # Cloudinary API key
CLOUDINARY_API_SECRET    # Cloudinary API secret
NODE_ENV                 # Environment (development/production)
CLIENT_URL               # Frontend URL for CORS
```

### **Frontend (.env)**
```env
VITE_API_URL             # Backend API base URL
```

---

## ▶️ Running the Application

### **Development Mode (Separate Terminals)**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### **Production Mode**
```bash
npm run build
npm start
```

The application will be served at `http://localhost:5001` with the frontend built files.

---

## 🔄 Real-Time Features Workflow

### **Socket.io Events**

**Client → Server:**
- `joinGroup(groupId)` - Join group real-time room
- `leaveGroup(groupId)` - Leave group room
- Message send events

**Server → Client:**
- `getOnlineUsers` - List of online users
- `newMessage` - Incoming message notification
- `groupMessageReceived` - Group message broadcast
- `messageDeleted` - Message deletion sync
- `userStatusChanged` - User online/offline status

---

## 📱 Key Features

✅ **Real-time Messaging** - Instant message delivery via Socket.io  
✅ **Direct Messaging** - One-on-one conversations  
✅ **Group Chat** - Multi-user group conversations  
✅ **Image Support** - Send and receive images via Cloudinary  
✅ **User Authentication** - Secure JWT-based authentication  
✅ **Online Status** - Real-time online/offline indicators  
✅ **User Profiles** - Profile pictures and user information  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Message History** - Persistent message storage  
✅ **Toast Notifications** - Real-time notifications  

---

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Token-based secure API access
- **HTTP-only Cookies**: Protected token storage
- **CORS**: Configured for specific origins
- **Input Validation**: Server-side validation on all endpoints
- **Secure WebSocket**: Socket.io with CORS restrictions

---

## 📦 Dependencies Summary

### Backend Dependencies: 13
- Express.js, Socket.io, Mongoose, JWT, bcryptjs, Cloudinary, CORS, dotenv, Cookie-parser

### Frontend Dependencies: 8
- React, React Router, Vite, Socket.io-client, Zustand, Axios, Tailwind CSS, DaisyUI

### Total Tech Stack: 40+ Technologies

---

## 📞 Support & Contact

For issues or questions, please refer to the [GitHub Repository](https://github.com/aarav12e/Chat_WebApp)

---


**Built with ❤️ using MERN Stack**
