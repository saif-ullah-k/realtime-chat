import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  user: string;
  text: string;
  room: string;
  timestamp: string;
  type: "message" | "system";
}

interface Room {
  name: string;
  userCount: number;
}

interface ChatRoomProps {
  username: string;
  room: string;
  onLeave: () => void;
}

const SERVER_URL = "http://localhost:4000";

export default function ChatRoom({ username, room, onLeave }: ChatRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState(room);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit("join", { username, room });

    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("roomUsers", ({ users }: { users: string[] }) => {
      setRoomUsers(users);
    });

    newSocket.on("roomsList", (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    newSocket.on("userTyping", ({ username: typingUser }: { username: string }) => {
      setTypingUsers((prev) =>
        prev.includes(typingUser) ? prev : [...prev, typingUser]
      );
    });

    newSocket.on("userStopTyping", ({ username: typingUser }: { username: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [username, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit("sendMessage", { text: input.trim() });
      socket.emit("stopTyping");
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit("typing");
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping");
      }, 1000);
    }
  };

  const switchRoom = (newRoom: string) => {
    if (newRoom === currentRoom || !socket) return;
    setMessages([]);
    setCurrentRoom(newRoom);
    socket.emit("switchRoom", { newRoom });
  };

  const handleLeave = () => {
    socket?.disconnect();
    onLeave();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>ChatFlow</h2>
          <span>Logged in as {username}</span>
        </div>

        <div className="rooms-section">
          <h3>Rooms</h3>
          {rooms.map((r) => (
            <div
              key={r.name}
              className={`room-item ${r.name === currentRoom ? "active" : ""}`}
              onClick={() => switchRoom(r.name)}
            >
              <span className="room-name"># {r.name}</span>
              <span className="room-count">{r.userCount}</span>
            </div>
          ))}
        </div>

        <div className="users-section">
          <h3>Online ({roomUsers.length})</h3>
          {roomUsers.map((user) => (
            <div key={user} className="user-item">
              <span className="user-dot" />
              <span>{user}</span>
            </div>
          ))}
        </div>

        <button className="leave-btn" onClick={handleLeave}>
          Leave Chat
        </button>
      </div>

      {/* Main Chat */}
      <div className="chat-main">
        <div className="chat-header">
          <h2># {currentRoom}</h2>
          <span>{roomUsers.length} members online</span>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.type === "system"
                  ? "system"
                  : msg.user === username
                  ? "own"
                  : "other"
              }`}
            >
              {msg.type !== "system" && msg.user !== username && (
                <div className="message-user">{msg.user}</div>
              )}
              <div className="message-bubble">{msg.text}</div>
              {msg.type !== "system" && (
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="typing-indicator">
          {typingUsers.length > 0 && (
            <span>
              {typingUsers.join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          )}
        </div>

        <div className="message-input-container">
          <form className="message-input-form" onSubmit={sendMessage}>
            <input
              className="message-input"
              type="text"
              placeholder={`Message #${currentRoom}`}
              value={input}
              onChange={handleInputChange}
            />
            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
