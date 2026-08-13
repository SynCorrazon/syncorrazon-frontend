// src/components/Layout/Navbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';
import './Navbar.css';

const Navbar = ({ roomCode, onLeave }) => {
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

      <div className="navbar-right">
        {roomCode && (
          <>
            <span className="navbar-room-code">Room: {roomCode}</span>
            <button
              className="navbar-button navbar-invite-btn"
              onClick={handleCopyInvite}
            >
              📋 Invite
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