// src/components/Layout/Navbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';
import './Navbar.css';

const Navbar = ({ roomCode, onLeave, theme = 'minimalist', onThemeChange, isChatExpanded, onChatToggle }) => {
  const navigate = useNavigate();

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const handleLeave = () => {
    if (onLeave) {
      onLeave();
    } else {
      navigate('/lobby');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <LogoPlaceholder />
      </div>

      {roomCode && (
        <div className="navbar-theme-control">
          <label htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(event) => onThemeChange?.(event.target.value)}
          >
            <option value="minimalist">A Minimalist - Clean &amp; focused</option>
            <option value="glass">B Glassmorphism - Blur &amp; depth</option>
          </select>
        </div>
      )}

      <div className="navbar-right">
        {roomCode && (
          <>
            <button className="navbar-chat-btn" onClick={onChatToggle} aria-pressed={isChatExpanded}>
              CHAT <span>{isChatExpanded ? 'Expanded' : 'Collapsed'}</span>
            </button>
            <span className="navbar-sync-status"><i /> SYNC <strong>Synced</strong></span>
            <span className="navbar-room-code">Room: {roomCode}</span>
            <button
              className="navbar-button navbar-invite-btn"
              onClick={handleCopyInvite}
            >
              Copy Link
            </button>
          </>
        )}
        {/* Only show Leave Room button if we're in a room AND onLeave exists */}
        {roomCode && onLeave && (
          <button
            className="navbar-button navbar-leave-btn"
            onClick={handleLeave}
          >
            Leave Room
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;