// src/components/VideoPlayer/SyncStatus.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the sync status indicator – the traffic light above the video.
  2. It shows the current sync health: Green, Yellow, Orange, or Red.
  3. It receives status and message as props from useHeartbeat().
  4. It displays a small pill with a dot and text.
  5. It matches the design spec: pill-shaped, above the YouTube player.
*/

import React from 'react';
import './SyncStatus.css';

const SyncStatus = ({ status = 'green', message = 'Synced' }) => {
  // Map status to CSS class
  const getStatusClass = () => {
    switch (status) {
      case 'green':
        return 'sync-status-green';
      case 'yellow':
        return 'sync-status-yellow';
      case 'orange':
        return 'sync-status-orange';
      case 'red':
        return 'sync-status-red';
      default:
        return 'sync-status-green';
    }
  };

  // Map status to dot color
  const getDotColor = () => {
    switch (status) {
      case 'green':
        return '#00FF88';
      case 'yellow':
        return '#FFD700';
      case 'orange':
        return '#FF6B35';
      case 'red':
        return '#FF0044';
      default:
        return '#00FF88';
    }
  };

  return (
    <div className={`sync-status ${getStatusClass()}`}>
      <span className="sync-status-dot" style={{ backgroundColor: getDotColor() }} />
      <span className="sync-status-text">{message}</span>
    </div>
  );
};

export default SyncStatus;