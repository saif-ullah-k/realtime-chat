const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = new Map();
const rooms = new Map();

// Default rooms
["General", "Tech Talk", "Random", "Gaming"].forEach((room) => {
  rooms.set(room, { name: room, users: new Set() });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join chat
  socket.on("join", ({ username, room }) => {
    users.set(socket.id, { username, room });

    if (!rooms.has(room)) {
      rooms.set(room, { name: room, users: new Set() });
    }
    rooms.get(room).users.add(username);

    socket.join(room);

    // Welcome message
    socket.emit("message", {
      id: Date.now().toString(),
      user: "System",
      text: `Welcome to ${room}, ${username}!`,
      room,
      timestamp: new Date().toISOString(),
      type: "system",
    });

    // Broadcast to room
    socket.to(room).emit("message", {
      id: Date.now().toString(),
      user: "System",
      text: `${username} has joined the chat`,
      room,
      timestamp: new Date().toISOString(),
      type: "system",
    });

    // Update room users
    io.to(room).emit("roomUsers", {
      room,
      users: Array.from(rooms.get(room).users),
    });

    // Update rooms list
    io.emit("roomsList", getRoomsList());
  });

  // Send message
  socket.on("sendMessage", ({ text }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      user: user.username,
      text,
      room: user.room,
      timestamp: new Date().toISOString(),
      type: "message",
    };

    io.to(user.room).emit("message", message);
  });

  // Typing indicator
  socket.on("typing", () => {
    const user = users.get(socket.id);
    if (!user) return;
    socket.to(user.room).emit("userTyping", { username: user.username });
  });

  socket.on("stopTyping", () => {
    const user = users.get(socket.id);
    if (!user) return;
    socket.to(user.room).emit("userStopTyping", { username: user.username });
  });

  // Switch room
  socket.on("switchRoom", ({ newRoom }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const oldRoom = user.room;

    // Leave old room
    socket.leave(oldRoom);
    if (rooms.has(oldRoom)) {
      rooms.get(oldRoom).users.delete(user.username);
      io.to(oldRoom).emit("roomUsers", {
        room: oldRoom,
        users: Array.from(rooms.get(oldRoom).users),
      });
      socket.to(oldRoom).emit("message", {
        id: Date.now().toString(),
        user: "System",
        text: `${user.username} has left the chat`,
        room: oldRoom,
        timestamp: new Date().toISOString(),
        type: "system",
      });
    }

    // Join new room
    user.room = newRoom;
    if (!rooms.has(newRoom)) {
      rooms.set(newRoom, { name: newRoom, users: new Set() });
    }
    rooms.get(newRoom).users.add(user.username);
    socket.join(newRoom);

    socket.emit("message", {
      id: Date.now().toString(),
      user: "System",
      text: `Welcome to ${newRoom}, ${user.username}!`,
      room: newRoom,
      timestamp: new Date().toISOString(),
      type: "system",
    });

    socket.to(newRoom).emit("message", {
      id: Date.now().toString(),
      user: "System",
      text: `${user.username} has joined the chat`,
      room: newRoom,
      timestamp: new Date().toISOString(),
      type: "system",
    });

    io.to(newRoom).emit("roomUsers", {
      room: newRoom,
      users: Array.from(rooms.get(newRoom).users),
    });

    io.emit("roomsList", getRoomsList());
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      const { username, room } = user;

      if (rooms.has(room)) {
        rooms.get(room).users.delete(username);
        io.to(room).emit("roomUsers", {
          room,
          users: Array.from(rooms.get(room).users),
        });
        socket.to(room).emit("message", {
          id: Date.now().toString(),
          user: "System",
          text: `${username} has left the chat`,
          room,
          timestamp: new Date().toISOString(),
          type: "system",
        });
      }

      users.delete(socket.id);
      io.emit("roomsList", getRoomsList());
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

function getRoomsList() {
  return Array.from(rooms.entries()).map(([name, data]) => ({
    name,
    userCount: data.users.size,
  }));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", connections: users.size });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
