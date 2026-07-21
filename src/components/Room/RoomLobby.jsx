// src/components/Room/RoomLobby.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the Room Lobby page – users see it after logging in.
  2. It has two main actions: Create a new room or Join an existing room.
  3. It uses useAuth() to get the current user.
  4. It uses useToast() for feedback messages.
  5. When a room is created, it generates a 6-character room code and navigates to /room/:roomId.
  6. When a user joins, it validates the room code and navigates to /room/:roomId.
  7. The Navbar is included at the top (without room code since we're in the lobby).
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import Navbar from '../Layout/Navbar';
import Loader from '../common/Loader';
import { generateRoomCode } from '../../utils/roomCode';
import './RoomLobby.css';

const RoomLobby = () => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Create a new room
  const handleCreateRoom = () => {
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      toast.success(`Room created! Code: ${roomCode}`);
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error('Create room error:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      toast.error('Please enter a room code');
      return;
    }

    if (code.length !== 6) {
      toast.error('Room code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Navigate to the room – backend will validate if it exists
      navigate(`/room/${code}`);
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="room-lobby-container">
      <Navbar />

      <div className="room-lobby-content">
        <div className="room-lobby-header">
          <h1>Welcome, {currentUser?.displayName || 'Friend'}! 👋</h1>
          <p className="room-lobby-subtitle">Watch YouTube together with someone special</p>
        </div>

        <div className="room-lobby-actions">
          {/* Create Room Card */}
          <div className="room-card">
            <div className="room-card-icon">🎬</div>
            <h2 className="room-card-title">Create a Room</h2>
            <p className="room-card-description">
              Start a new sync room and invite your partner
            </p>
            <button
              className="room-btn room-btn-create"
              onClick={handleCreateRoom}
              disabled={loading}
            >
              Create Room
            </button>
          </div>

          {/* Join Room Card */}
          <div className="room-card">
            <div className="room-card-icon">🔗</div>
            <h2 className="room-card-title">Join a Room</h2>
            <p className="room-card-description">
              Enter the 6-character code from your partner
            </p>
            <form onSubmit={handleJoinRoom} className="join-form">
              <input
                type="text"
                className="join-input"
                placeholder="e.g., ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength="6"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="room-btn room-btn-join"
                disabled={loading}
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        {/* Optional: Reviews / Testimonials placeholder */}
        <div className="room-lobby-footer">
          <p className="room-lobby-footer-text">
            💡 Watch together. Anywhere. Low data. Nigerian-first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;