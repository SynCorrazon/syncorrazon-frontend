// src/hooks/useHeartbeat.js

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the HEART of SynCorrazon – the sync engine.
  2. It runs every 500ms (2 times per second) to check if videos are in sync.
  3. It detects drift and applies corrections based on the rules:
     - Green (<1s): Do nothing.
     - Yellow (1-3s): Auto-seek Follower to Leader.
     - Orange (3-5s): Pause both, seek, auto-play.
     - Red (>5s): Countdown, seek, play.
  4. It uses the WebRTC data channel to send commands to the Follower.
  5. It exposes: startHeartbeat, stopHeartbeat, manualResync, syncStatus.
*/

import { useState, useEffect, useRef, useCallback } from 'react';
import { playerControls } from '../utils/youtube';

// Default threshold values (in seconds)
const DEFAULT_THRESHOLDS = {
  green: 1, // Perfect sync – do nothing
  yellow: 3, // Mild drift – auto-seek
  orange: 5, // Significant drift – pause + seek + play
  red: 5, // Network failure – countdown + seek + play
};

const HEARTBEAT_INTERVAL = 500; // 500ms – 2 times per second

const useHeartbeat = ({
  isLeader,
  playerRef,
  sendCommand,
  onCommand,
  driftThresholds = DEFAULT_THRESHOLDS,
}) => {
  const [drift, setDrift] = useState(0);
  const [syncStatus, setSyncStatus] = useState('green');
  const [syncStatusMessage, setSyncStatusMessage] = useState('Synced');

  const heartbeatIntervalRef = useRef(null);
  const isRunningRef = useRef(false);
  const leaderTimestampRef = useRef(0);
  const followerTimestampRef = useRef(0);
  const isPausedRef = useRef(false);
  const countdownActiveRef = useRef(false);

  // Determine sync status based on drift
  const determineSyncStatus = useCallback(
    (driftValue) => {
      const absDrift = Math.abs(driftValue);

      if (absDrift <= driftThresholds.green) {
        return { status: 'green', message: 'Synced' };
      } else if (absDrift <= driftThresholds.yellow) {
        return { status: 'yellow', message: 'Adjusting...' };
      } else if (absDrift <= driftThresholds.orange) {
        return { status: 'orange', message: 'Resyncing...' };
      } else {
        return { status: 'red', message: 'Poor Connection' };
      }
    },
    [driftThresholds]
  );

  // Apply drift correction based on severity
  const applyCorrection = useCallback(
    (driftValue, isFollower) => {
      const absDrift = Math.abs(driftValue);

      // Green zone – do nothing
      if (absDrift <= driftThresholds.green) {
        return;
      }

      // Yellow zone – auto-seek
      if (absDrift <= driftThresholds.yellow) {
        if (isFollower && playerRef.current) {
          const leaderTime = leaderTimestampRef.current;
          playerControls.seekTo(playerRef.current, leaderTime);
          setSyncStatusMessage('🔄 Syncing network...');
          setTimeout(() => {
            const status = determineSyncStatus(driftValue);
            setSyncStatus(status.status);
            setSyncStatusMessage(status.message);
          }, 2000);
        }
        return;
      }

      // Orange zone – pause + seek + play
      if (absDrift <= driftThresholds.orange) {
        if (isFollower && playerRef.current) {
          // Pause both (Leader pauses, Follower pauses via command)
          if (isLeader) {
            playerControls.pause(playerRef.current);
            sendCommand({ type: 'pause', timestamp: playerControls.getCurrentTime(playerRef.current) });
          }

          // Seek Follower to Leader
          const leaderTime = leaderTimestampRef.current;
          playerControls.seekTo(playerRef.current, leaderTime);
          setSyncStatusMessage('Network lag detected. Resyncing...');

          // Auto-play after 300ms
          setTimeout(() => {
            if (playerRef.current) {
              playerControls.play(playerRef.current);
              if (isLeader) {
                sendCommand({ type: 'play', timestamp: playerControls.getCurrentTime(playerRef.current) });
              }
            }
            const status = determineSyncStatus(driftValue);
            setSyncStatus(status.status);
            setSyncStatusMessage(status.message);
          }, 300);
        }
        return;
      }

      // Red zone – countdown + seek + play
      if (absDrift > driftThresholds.red) {
        if (isFollower && playerRef.current && !countdownActiveRef.current) {
          countdownActiveRef.current = true;

          // Pause both
          if (isLeader) {
            playerControls.pause(playerRef.current);
            sendCommand({ type: 'pause', timestamp: playerControls.getCurrentTime(playerRef.current) });
          }

          // Countdown with toast notifications
          const countdownSteps = ['Syncing in 3...', 'Syncing in 2...', 'Syncing in 1...'];
          countdownSteps.forEach((msg, index) => {
            setTimeout(() => {
              setSyncStatusMessage(msg);
            }, index * 1000);
          });

          // At "1": seek + play
          setTimeout(() => {
            const leaderTime = leaderTimestampRef.current;
            playerControls.seekTo(playerRef.current, leaderTime);

            setTimeout(() => {
              if (playerRef.current) {
                playerControls.play(playerRef.current);
                if (isLeader) {
                  sendCommand({ type: 'play', timestamp: playerControls.getCurrentTime(playerRef.current) });
                }
              }
              const status = determineSyncStatus(driftValue);
              setSyncStatus(status.status);
              setSyncStatusMessage(status.message);
              countdownActiveRef.current = false;
            }, 200);
          }, 3500);
        }
        return;
      }
    },
    [isLeader, playerRef, sendCommand, determineSyncStatus, driftThresholds]
  );

  // Handle heartbeat logic – runs every 500ms
  const handleHeartbeat = useCallback(() => {
    if (!playerRef.current) return;

    if (isLeader) {
      // Leader: send current timestamp
      const currentTime = playerControls.getCurrentTime(playerRef.current);
      leaderTimestampRef.current = currentTime;
      sendCommand({ type: 'heartbeat', timestamp: currentTime });
    } else {
      // Follower: receive timestamp from Leader via onCommand
      // The actual receiving happens in the onCommand listener
    }
  }, [isLeader, playerRef, sendCommand]);

  // Handle incoming heartbeat from Leader
  const handleHeartbeatCommand = useCallback(
    (command) => {
      if (command.type === 'heartbeat' && !isLeader) {
        const leaderTime = command.timestamp;
        const followerTime = playerControls.getCurrentTime(playerRef.current);
        const driftValue = leaderTime - followerTime;

        leaderTimestampRef.current = leaderTime;
        setDrift(driftValue);

        const { status, message } = determineSyncStatus(driftValue);
        setSyncStatus(status);
        setSyncStatusMessage(message);

        // Apply correction if needed
        applyCorrection(driftValue, true);
      }
    },
    [isLeader, playerRef, applyCorrection, determineSyncStatus]
  );

  // Manual resync – forces Follower to Leader's timestamp
  const manualResync = useCallback(() => {
    if (!playerRef.current || !isLeader) return;

    const leaderTime = playerControls.getCurrentTime(playerRef.current);
    sendCommand({ type: 'seek', timestamp: leaderTime });
    setSyncStatusMessage('✅ Sync restored!');
    setTimeout(() => {
      const { status, message } = determineSyncStatus(0);
      setSyncStatus(status);
      setSyncStatusMessage(message);
    }, 1500);
  }, [isLeader, playerRef, sendCommand, determineSyncStatus]);

  // Start the heartbeat
  const startHeartbeat = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Start new interval
    heartbeatIntervalRef.current = setInterval(() => {
      handleHeartbeat();
    }, HEARTBEAT_INTERVAL);
  }, [handleHeartbeat]);

  // Stop the heartbeat
  const stopHeartbeat = useCallback(() => {
    isRunningRef.current = false;
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Register onCommand listener for heartbeat messages
  useEffect(() => {
    if (!onCommand) return;

    const unsubscribe = onCommand(handleHeartbeatCommand);
    return unsubscribe;
  }, [onCommand, handleHeartbeatCommand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    drift,
    syncStatus,
    syncStatusMessage,
    startHeartbeat,
    stopHeartbeat,
    manualResync,
    isRunning: isRunningRef.current,
  };
};

export default useHeartbeat;