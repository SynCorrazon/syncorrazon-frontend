// src/components/Layout/Navbar.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the top navigation bar that appears on most pages.
  2. It contains: Logo placeholder, room code, invite link, and leave room button.
  3. Logo is on the left, room controls are on the right.
  4. I pass roomCode and onLeave as props from the parent component.
  5. The invite link copies the room URL to the clipboard.
*/

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
        <button
          className="navbar-button navbar-leave-btn"
          onClick={handleLeave}
        >
          Leave Room
        </button>
      </div>
    </nav>
  );
};

export default Navbar;