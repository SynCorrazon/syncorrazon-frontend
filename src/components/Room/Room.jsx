// src/components/Room/Room.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the main Room component – it decides whether to show RoomCreation or RoomLobby.
  2. It's used in App.jsx as the route for the Room page.
  3. It has a simple state that determines if the user wants to create or join a room.
  4. It displays either the RoomLobby or RoomCreation component.
*/

import React, { useState } from 'react';
import RoomLobby from './RoomLobby';
import RoomCreation from './RoomCreation';
import './Room.css';

const Room = () => {
  const [mode, setMode] = useState('lobby'); // 'lobby' or 'create'

  const handleCreateRoom = () => {
    setMode('create');
  };

  const handleBackToLobby = () => {
    setMode('lobby');
  };

  return (
    <div className="room-container">
      {mode === 'lobby' ? (
        <RoomLobby onCreateRoom={handleCreateRoom} />
      ) : (
        <RoomCreation onBack={handleBackToLobby} />
      )}
    </div>
  );
};

export default Room;