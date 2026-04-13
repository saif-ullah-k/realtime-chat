import React, { useState } from "react";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (name: string, selectedRoom: string) => {
    setUsername(name);
    setRoom(selectedRoom);
    setJoined(true);
  };

  const handleLeave = () => {
    setJoined(false);
    setUsername("");
    setRoom("");
  };

  return (
    <div className="app">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <ChatRoom username={username} room={room} onLeave={handleLeave} />
      )}
    </div>
  );
}

export default App;
