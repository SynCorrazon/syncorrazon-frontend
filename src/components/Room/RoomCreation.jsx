// src/components/Room/RoomCreation.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the standalone room creation page – users can create a room here.
  2. It generates a 6-character room code and navigates to the Video Player.
  3. It uses useAuth() to get the current user.
  4. It uses useToast() for feedback messages.
  5. It has a nice animated UI with a room code display and copy link button.
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import Navbar from '../Layout/Navbar';
import Loader from '../common/Loader';
import { generateRoomCode } from '../../utils/roomCode';
import './RoomCreation.css';

const RoomCreation = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    setLoading(true);
    try {
      const code = generateRoomCode();
      setRoomCode(code);
      toast.success(`Room created! Code: ${code}`);
      // Navigate to the video player with the room code
      setTimeout(() => {
        navigate(`/room/${code}`);
      }, 500);
    } catch (error) {
      console.error('Create room error:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!roomCode) return;
    const inviteLink = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (!roomCode) return;
    navigate(`/room/${roomCode}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="room-creation-container">
      <Navbar />

      <div className="room-creation-content">
        <div className="room-creation-header">
          <h1>🎬 Create a Room</h1>
          <p className="room-creation-subtitle">
            Start a new sync room and share the link with your partner
          </p>
        </div>

        <div className="room-creation-card">
          {!roomCode ? (
            <div className="room-creation-initial">
              <p className="room-creation-text">
                Click the button below to create a new room. You'll get a unique
                6-character code to share with your partner.
              </p>
              <button
                className="room-creation-btn room-creation-btn-create"
                onClick={handleCreateRoom}
              >
                Create Room
              </button>
            </div>
          ) : (
            <div className="room-creation-ready">
              <div className="room-creation-code-container">
                <div className="room-creation-code-label">Your Room Code</div>
                <div className="room-creation-code">{roomCode}</div>
              </div>

              <div className="room-creation-actions">
                <button
                  className="room-creation-btn room-creation-btn-join"
                  onClick={handleJoinRoom}
                >
                  Join Room Now →
                </button>
                <button
                  className="room-creation-btn room-creation-btn-copy"
                  onClick={handleCopyLink}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Invite Link'}
                </button>
              </div>

              <p className="room-creation-hint">
                Or share the room code manually with your partner
              </p>
            </div>
          )}
        </div>

        <div className="room-creation-footer">
          <p className="room-creation-footer-text">
            💡 Watch together. Anywhere. Low data. Nigerian-first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomCreation;