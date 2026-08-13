// src/components/Room/RoomCreation.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import Navbar from '../Layout/Navbar';
import Loader from '../common/Loader';
import './RoomCreation.css';

const RoomCreation = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!youtubeUrl) {
      toast.error('Please paste a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/v1/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ videoUrl: youtubeUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setRoomCode(data.data.roomCode);
        toast.success(`Room created! Code: ${data.data.roomCode}`);
        setTimeout(() => {
          navigate(`/room/${data.data.roomCode}`);
        }, 500);
      } else {
        toast.error(data.message || 'Failed to create room');
      }
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
                Paste a YouTube URL to start watching together.
              </p>
              <div className="room-creation-url-input">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="url-input-field"
                  disabled={loading}
                />
                <button
                  className="room-creation-btn room-creation-btn-create"
                  onClick={handleCreateRoom}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
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