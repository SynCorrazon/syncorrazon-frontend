// src/components/VideoPlayer/VideoPlayer.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../common/ToastContainer';
import useWebRTC from '../../hooks/useWebRTC';
import useHeartbeat from '../../hooks/useHeartbeat';
import Navbar from '../Layout/Navbar';
import ChatOverlay from '../Chat/ChatOverlay';
import SyncStatus from './SyncStatus';
import ResyncButton from './ResyncButton';
import Loader from '../common/Loader';
import {
  createYouTubePlayer,
  extractYouTubeVideoId,
  playerControls,
} from '../../utils/youtube';
import { getBackendToken, roomApi } from '../../services/api';
import './VideoPlayer.css';

const formatTime = (seconds) => {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const VideoPlayer = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('Your video');
  const [videoAuthor, setVideoAuthor] = useState('');
  const [playback, setPlayback] = useState({ currentTime: 0, duration: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
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

      const token = await getBackendToken(currentUser);
      if (!token) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      try {
        const data = await roomApi.getRoom(roomId, token);
        setVideoUrl(data.data?.videoUrl || data.videoUrl || '');
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error(error.message || 'Failed to load room info');
      }
    };

    fetchRoomInfo();
  }, [roomId, toast, navigate]);

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
            setIsPlaying(event.data === 1);
            if (event.data === 1 && isLeader && isConnected) {
              sendCommand({
                type: 'play',
                timestamp: playerControls.getCurrentTime(player),
              });
            } else if (event.data === 2 && isLeader && isConnected) {
              sendCommand({
                type: 'pause',
                timestamp: playerControls.getCurrentTime(player),
              });
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

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return undefined;

    const updatePlaybackDetails = () => {
      const player = playerRef.current;
      if (!player) return;

      const videoData = player.getVideoData?.();
      if (videoData?.title) setVideoTitle(videoData.title);
      if (videoData?.author) setVideoAuthor(videoData.author);
      setPlayback({
        currentTime: playerControls.getCurrentTime(player),
        duration: playerControls.getDuration(player),
      });
      setIsPlaying(playerControls.isPlaying(player));
    };

    updatePlaybackDetails();
    const intervalId = window.setInterval(updatePlaybackDetails, 1000);
    return () => window.clearInterval(intervalId);
  }, [isPlayerReady]);

  // Load video when URL changes
  useEffect(() => {
    if (isPlayerReady && playerRef.current && videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
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

  const handleLeaveRoom = () => {
    leaveRoom();
    stopHeartbeat();
    navigate('/lobby');
  };

  const handleResync = () => {
    manualResync();
    toast.info('Syncing... 🔄');
  };

  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You';
  const progressPercent =
    playback.duration > 0
      ? Math.min(100, (playback.currentTime / playback.duration) * 100)
      : 0;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={`video-player-container theme-${theme}`}>
      <Navbar
        roomCode={roomId}
        onLeave={handleLeaveRoom}
        isConnected={isConnected}
        syncStatusMessage={isConnected ? syncStatusMessage : 'Waiting'}
        isChatExpanded={isChatExpanded}
        onChatToggle={() => setIsChatExpanded((expanded) => !expanded)}
      />

      <div
        className={`video-player-content${
          isChatExpanded ? ' chat-expanded' : ''
        }`}
      >
        <div className="video-player-left">
          <div className="video-room-status">
            <SyncStatus
              status={isConnected ? syncStatus : 'yellow'}
              message={
                isConnected ? syncStatusMessage : 'Waiting for your friend'
              }
            />
          </div>
          <div className="video-player-wrapper">
            <div
              id="youtube-player"
              ref={playerContainerRef}
              className="youtube-player"
            />
            <div className="video-player-badge">YouTube</div>
          </div>

          <div className="video-meta">
            <div>
              <h1>{videoTitle}</h1>
              {videoAuthor && <p>{videoAuthor}</p>}
            </div>
            <div className="video-meta-actions">
              <span className="watching-badge">
                {isConnected ? 'Watching together' : 'Waiting for your friend'}
              </span>
              <ResyncButton onClick={handleResync} isConnected={isConnected} />
            </div>
          </div>

          <div className="participant-row">
            <div className="participant-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="participant-identity">
              <strong>{displayName}</strong>
              <span>
                <span className="participant-play">
                  {isPlaying ? '▶' : 'Ⅱ'}
                </span>
                {formatTime(playback.currentTime)}
              </span>
            </div>
            <span className="participant-drift">
              {isConnected
                ? `synced ${Math.abs(drift).toFixed(1)}s`
                : 'not connected'}
            </span>
            <span
              className={`participant-live${
                isConnected ? '' : ' participant-live-waiting'
              }`}
            >
              <i /> {isConnected ? 'together' : 'waiting'}
            </span>
          </div>

          {playback.duration > 0 && (
            <div
              className="video-progress"
              role="progressbar"
              aria-label="Video playback progress"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>

        {isChatExpanded && (
          <div className="video-player-right">
            <ChatOverlay
              roomId={roomId}
              currentUser={currentUser}
              isPeerConnected={isConnected}
              isExpanded={isChatExpanded}
              setIsExpanded={setIsChatExpanded}
            />
          </div>
        )}
        {!isChatExpanded && (
          <ChatOverlay
            roomId={roomId}
            currentUser={currentUser}
            isPeerConnected={isConnected}
            isExpanded={isChatExpanded}
            setIsExpanded={setIsChatExpanded}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
