// src/components/VideoPlayer/ResyncButton.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the manual resync button – users click it to force sync if drift occurs.
  2. It calls the manualResync() function from the useHeartbeat hook.
  3. It's disabled when not connected to a peer.
  4. It matches the design spec: below the YouTube player, right-aligned.
*/

import React from 'react';
import './ResyncButton.css';

const ResyncButton = ({ onClick, isConnected = true, isLoading = false }) => {
  return (
    <button
      className={`resync-button ${!isConnected ? 'resync-button-disabled' : ''}`}
      onClick={onClick}
      disabled={!isConnected || isLoading}
    >
      {isLoading ? (
        <span className="resync-button-loading">⟳ Syncing...</span>
      ) : (
        <span className="resync-button-content">
          <svg
            className="resync-button-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
          Resync
        </span>
      )}
    </button>
  );
};

export default ResyncButton;
