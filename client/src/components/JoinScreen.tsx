import React, { useState } from "react";

interface JoinScreenProps {
  onJoin: (username: string, room: string) => void;
}

const rooms = ["General", "Tech Talk", "Random", "Gaming"];

export default function JoinScreen({ onJoin }: JoinScreenProps) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("General");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim(), room);
    }
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <h1>ChatFlow</h1>
        <p>Join a chat room and start talking</p>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Room</label>
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="submit" className="join-btn">
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}
