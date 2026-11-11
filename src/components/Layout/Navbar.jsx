import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';
import './Navbar.css';

const THEME_OPTIONS = [
  { value: 'minimalist', label: 'A Minimalist', subtitle: 'Clean & focused' },
  { value: 'glass', label: 'B Glassmorphism', subtitle: 'Blur & depth' },
  { value: 'bold', label: 'C Bold Accents', subtitle: 'Neon & contrast' },
  { value: 'warm', label: 'D Warm & Cozy', subtitle: 'Soft & intimate' },
];

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
        <div className="navbar-theme-group" aria-label="Theme selector">
          {THEME_OPTIONS.map(({ value, label, subtitle }) => (
            <button
              key={value}
              type="button"
              className={`theme-option ${theme === value ? 'theme-option-active' : ''}`}
              onClick={() => onThemeChange?.(value)}
            >
              <span className="theme-option-label">{label}</span>
              <span className="theme-option-subtitle">{subtitle}</span>
            </button>
          ))}
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
            <button className="navbar-button navbar-invite-btn" onClick={handleCopyInvite}>
              Copy Link
            </button>
          </>
        )}

        {roomCode && onLeave && (
          <button className="navbar-button navbar-leave-btn" onClick={handleLeave}>
            Leave Room
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
