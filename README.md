# ChatFlow - Real-Time Chat Application

A real-time chat application built with React, Socket.io, and Node.js. Features multiple chat rooms, typing indicators, online user tracking, and a modern dark-themed UI.

## Features

- **Real-Time Messaging** - Instant message delivery using WebSockets
- **Multiple Chat Rooms** - General, Tech Talk, Random, Gaming rooms
- **Room Switching** - Switch between rooms without losing connection
- **Online Users** - See who's online in each room
- **Typing Indicators** - See when someone is typing
- **System Messages** - Join/leave notifications
- **Modern UI** - Dark-themed, responsive design inspired by Discord/Slack

## Tech Stack

- **Frontend:** React 18, TypeScript, Socket.io Client
- **Backend:** Node.js, Express.js, Socket.io
- **Styling:** Custom CSS with dark theme

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/saif-ullah-k/realtime-chat.git
cd realtime-chat

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the App

You need two terminals:

**Terminal 1 - Start the server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the client:**
```bash
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Open multiple tabs to test chat between users.

## Project Structure

```
realtime-chat/
├── server/
│   ├── index.js          # Socket.io server with room management
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinScreen.tsx   # Username & room selection
│   │   │   └── ChatRoom.tsx     # Main chat interface
│   │   ├── App.tsx
│   │   └── App.css              # Complete styling
│   └── package.json
└── README.md
```

## How It Works

1. User enters a username and selects a chat room
2. Socket.io establishes a WebSocket connection to the server
3. Messages are broadcast in real-time to all users in the same room
4. Server tracks online users and room memberships
5. Typing indicators are sent via socket events

## License

MIT
