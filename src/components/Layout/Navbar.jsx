import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';
import ThemeSelector from './ThemeSelector';
import './Navbar.css';

const Navbar = ({
  roomCode,
  onLeave,
  isConnected,
  syncStatusMessage,
  isChatExpanded,
  onChatToggle,
}) => {
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
        <ThemeSelector placement="navbar" />
        {roomCode && (
          <>
            <button
              className="navbar-chat-btn"
              onClick={onChatToggle}
              aria-pressed={isChatExpanded}
              aria-label={`${isChatExpanded ? 'Close' : 'Open'} room chat`}
            >
              <span className="navbar-chat-label">Chat</span>
              <span>{isChatExpanded ? 'Open' : 'Closed'}</span>
            </button>
            <span
              className={`navbar-sync-status${
                isConnected ? ' is-connected' : ''
              }`}
              aria-live="polite"
            >
              <i /> Sync{' '}
              <strong>{isConnected ? syncStatusMessage : 'Waiting'}</strong>
            </span>
            <span className="navbar-room-code">Room: {roomCode}</span>
            <button
              className="navbar-button navbar-invite-btn"
              onClick={handleCopyInvite}
            >
              Copy Link
            </button>
          </>
        )}

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
