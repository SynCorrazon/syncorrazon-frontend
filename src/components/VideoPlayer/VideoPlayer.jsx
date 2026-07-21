// src/components/VideoPlayer/VideoPlayer.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the heart of SynCorrazon – the Video Player page.
  2. It loads the YouTube player, syncs playback between two users, and shows chat.
  3. It uses:
     - useParams() to get the room code from the URL.
     - useWebRTC() hook for P2P connection and sync commands.
     - useHeartbeat() hook for 500ms drift detection and correction.
     - useAuth() for the current user.
     - useToast() for notifications.
  4. It has: YouTube player, sync status indicator, resync button, chat overlay, ad banner.
  5. The layout follows the design spec: YouTube centre-left (70%), chat bottom-right.
*/

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import useWebRTC from '../../hooks/useWebRTC';
import useHeartbeat from '../../hooks/useHeartbeat';
import Navbar from '../Layout/Navbar';
import ChatOverlay from '../Chat/ChatOverlay';
import SyncStatus from './SyncStatus';
import ResyncButton from './ResyncButton';
import AdBanner from './AdBanner';
import Loader from '../common/Loader';
import { createYouTubePlayer, playerControls } from '../../utils/youtube';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();

  // YouTube player ref
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Local state
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // WebRTC hook – handles P2P connection and sync commands
  const {
    isConnected,
    peerId,
    sendCommand,
    onCommand,
    joinRoom,
    leaveRoom,
    isLeader,
  } = useWebRTC(roomId, currentUser);

  // Heartbeat hook – handles 500ms drift detection and correction
  const {
    drift,
    syncStatus,
    startHeartbeat,
    stopHeartbeat,
    manualResync,
    syncStatusMessage,
  } = useHeartbeat({
    isLeader,
    playerRef,
    sendCommand,
    onCommand,
    driftThresholds: {
      green: 1,
      yellow: 3,
      orange: 5,
    },
  });

  // Initialize YouTube player
  useEffect(() => {
    const initPlayer = async () => {
      try {
        const player = await createYouTubePlayer('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: '',
          playerVars: {
            controls: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            disablekb: 0,
            fs: 1,
          },
          onReady: () => {
            setIsPlayerReady(true);
            setIsLoading(false);
            toast.info('YouTube player ready! 🎬');
          },
          onStateChange: (event) => {
            // Handle player state changes (play, pause, seek)
            if (event.data === 1) {
              // Playing
              if (isLeader && isConnected) {
                sendCommand({ type: 'play', timestamp: playerControls.getCurrentTime(player) });
              }
            } else if (event.data === 2) {
              // Paused
              if (isLeader && isConnected) {
                sendCommand({ type: 'pause', timestamp: playerControls.getCurrentTime(player) });
              }
            }
          },
          onError: (error) => {
            console.error('YouTube player error:', error);
            toast.error('Failed to load YouTube player. Please refresh.');
          },
        });
        playerRef.current = player;
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        toast.error('Failed to initialize YouTube player.');
        setIsLoading(false);
      }
    };

    initPlayer();

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerControls.destroy(playerRef.current);
      }
    };
  }, []);

  // Join room when player is ready and user is authenticated
  useEffect(() => {
    if (isPlayerReady && currentUser && roomId) {
      joinRoom();
    }
  }, [isPlayerReady, currentUser, roomId, joinRoom]);

  // Start heartbeat when connected
  useEffect(() => {
    if (isConnected && isPlayerReady) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [isConnected, isPlayerReady, startHeartbeat, stopHeartbeat]);

  // Listen for incoming commands from peer
  useEffect(() => {
    if (!isConnected) return;

    const handleCommand = (command) => {
      if (!playerRef.current) return;

      switch (command.type) {
        case 'play':
          playerControls.play(playerRef.current);
          break;
        case 'pause':
          playerControls.pause(playerRef.current);
          break;
        case 'seek':
          playerControls.seekTo(playerRef.current, command.timestamp);
          break;
        case 'heartbeat':
          // Handled by useHeartbeat hook
          break;
        default:
          console.warn('Unknown command type:', command.type);
      }
    };

    // Subscribe to commands
    const unsubscribe = onCommand(handleCommand);
    return unsubscribe;
  }, [isConnected, onCommand]);

  // Handle video URL change
  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  // Load video
  const handleLoadVideo = () => {
    if (!playerRef.current || !videoUrl) return;

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL. Please check and try again.');
      return;
    }

    playerControls.loadVideoById(playerRef.current, videoId);
    toast.success('Video loaded! 🎬');

    // Send video ID to peer if leader
    if (isLeader && isConnected) {
      sendCommand({ type: 'load-video', videoId });
    }
  };

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Handle leave room
  const handleLeaveRoom = () => {
    leaveRoom();
    stopHeartbeat();
    navigate('/lobby');
  };

  // Handle manual resync
  const handleResync = () => {
    manualResync();
    toast.info('Syncing... 🔄');
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="video-player-container">
      <Navbar roomCode={roomId} onLeave={handleLeaveRoom} />

      <div className="video-player-content">
        {/* Left section: YouTube player + controls */}
        <div className="video-player-left">
          <div className="video-player-wrapper">
            <div id="youtube-player" ref={playerContainerRef} className="youtube-player" />
            <SyncStatus status={syncStatus} message={syncStatusMessage} />
          </div>

          {/* Video controls */}
          <div className="video-controls">
            <div className="video-url-input">
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                value={videoUrl}
                onChange={handleVideoUrlChange}
                className="url-input"
              />
              <button onClick={handleLoadVideo} className="load-btn">
                Load
              </button>
            </div>
            <ResyncButton onClick={handleResync} isConnected={isConnected} />
          </div>

          {/* Ad banner (free tier only) */}
          <AdBanner isPro={false} />
        </div>

        {/* Right section: Chat overlay */}
        <div className="video-player-right">
          <ChatOverlay roomId={roomId} currentUser={currentUser} />
        </div>
      </div>

      {/* Connection status indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};

export default VideoPlayer;