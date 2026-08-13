// src/components/VideoPlayer/VideoPlayer.jsx

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

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isConnected,
    peerId,
    sendCommand,
    onCommand,
    joinRoom,
    leaveRoom,
    isLeader,
  } = useWebRTC(roomId, currentUser);

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

  // Fetch room info from backend
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!roomId) return;

      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please log in again');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/v1/rooms/${roomId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setVideoUrl(data.data.videoUrl);
        } else {
          toast.error(data.message || 'Failed to load room');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load room info');
      }
    };

    fetchRoomInfo();
  }, [roomId, toast]);

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
            if (event.data === 1 && isLeader && isConnected) {
              sendCommand({ type: 'play', timestamp: playerControls.getCurrentTime(player) });
            } else if (event.data === 2 && isLeader && isConnected) {
              sendCommand({ type: 'pause', timestamp: playerControls.getCurrentTime(player) });
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

    return () => {
      if (playerRef.current) {
        playerControls.destroy(playerRef.current);
      }
    };
  }, []);

  // Load video when URL changes
  useEffect(() => {
    if (isPlayerReady && playerRef.current && videoUrl) {
      const videoId = extractVideoId(videoUrl);
      if (videoId) {
        playerControls.loadVideoById(playerRef.current, videoId);
      }
    }
  }, [videoUrl, isPlayerReady]);

  // Join room when player is ready
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

  // Listen for incoming commands
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
        default:
          break;
      }
    };

    const unsubscribe = onCommand(handleCommand);
    return unsubscribe;
  }, [isConnected, onCommand]);

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

  const handleLeaveRoom = () => {
    leaveRoom();
    stopHeartbeat();
    navigate('/lobby');
  };

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
        <div className="video-player-left">
          <div className="video-player-wrapper">
            <div id="youtube-player" ref={playerContainerRef} className="youtube-player" />
            <SyncStatus status={syncStatus} message={syncStatusMessage} />
          </div>

          <div className="video-controls">
            <div className="video-url-input">
              <input
                type="text"
                placeholder="YouTube URL will load from room..."
                value={videoUrl}
                readOnly
                className="url-input"
              />
            </div>
            <ResyncButton onClick={handleResync} isConnected={isConnected} />
          </div>

          <AdBanner isPro={false} />
        </div>

        <div className="video-player-right">
          <ChatOverlay roomId={roomId} currentUser={currentUser} />
        </div>
      </div>

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};

export default VideoPlayer;