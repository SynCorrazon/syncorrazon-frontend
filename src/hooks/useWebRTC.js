// src/hooks/useWebRTC.js

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the WebRTC hook – it handles P2P connections and data channels.
  2. It uses simple-peer for WebRTC connections and Socket.io for signaling.
  3. It handles: creating a peer, joining a room, sending/receiving commands, and cleanup.
  4. It emits events for the rest of the app: onCommand, onConnect, onDisconnect.
  5. The connection determines who is Leader and who is Follower.
*/

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useToast } from '../components/common/ToastContainer';

// Get the signaling server URL from environment variables
const SIGNALING_SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useWebRTC = (roomId, user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [peerId, setPeerId] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [participants, setParticipants] = useState([]);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const commandListenersRef = useRef([]);
  const toast = useToast();

  // Send a command through the data channel
  const sendCommand = useCallback(
    (command) => {
      if (peerRef.current && isConnected) {
        try {
          peerRef.current.send(JSON.stringify(command));
          return true;
        } catch (error) {
          console.error('Error sending command:', error);
          return false;
        }
      }
      return false;
    },
    [isConnected]
  );

  // Register a listener for incoming commands
  const onCommand = useCallback((listener) => {
    commandListenersRef.current.push(listener);
    // Return unsubscribe function
    return () => {
      commandListenersRef.current = commandListenersRef.current.filter(
        (l) => l !== listener
      );
    };
  }, []);

  // Notify all listeners of a command
  const notifyCommand = useCallback((command) => {
    commandListenersRef.current.forEach((listener) => {
      try {
        listener(command);
      } catch (error) {
        console.error('Error in command listener:', error);
      }
    });
  }, []);

  // Handle incoming commands from the peer
  const handlePeerData = useCallback(
    (data) => {
      try {
        const command = JSON.parse(data);
        notifyCommand(command);
      } catch (error) {
        console.error('Error parsing peer data:', error);
      }
    },
    [notifyCommand]
  );

  // Initialize WebRTC connection
  const initializeConnection = useCallback(() => {
    if (!socketRef.current) return;

    // Create a new peer
    const peer = new Peer({
      initiator: !isLeader,
      trickle: false,
    });

    peerRef.current = peer;

    // Handle peer signals (offer/answer/ICE)
    peer.on('signal', (signal) => {
      socketRef.current.emit('signal', {
        roomId,
        signal,
        userId: user?.uid,
      });
    });

    // Handle connection established
    peer.on('connect', () => {
      console.log('WebRTC connected!');
      setIsConnected(true);
      toast.success('Connected to partner! 🎉');
    });

    // Handle incoming data
    peer.on('data', handlePeerData);

    // Handle disconnection
    peer.on('close', () => {
      console.log('WebRTC disconnected');
      setIsConnected(false);
      peerRef.current = null;
      toast.info('Disconnected from partner.');
    });

    // Handle errors
    peer.on('error', (error) => {
      console.error('WebRTC error:', error);
      toast.error('Connection error. Please try rejoining.');
    });

    return peer;
  }, [roomId, user, isLeader, toast, handlePeerData]);

  // Join a room
  const joinRoom = useCallback(() => {
    if (!roomId || !user) {
      toast.error('Cannot join room: missing room ID or user');
      return;
    }

    // Connect to signaling server
    const socket = io(SIGNALING_SERVER_URL);
    socketRef.current = socket;

    // Join the room
    socket.emit('join-room', {
      roomId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
    });

    // Handle room joined event
    socket.on('room-joined', (data) => {
      setPeerId(data.peerId);
      setIsLeader(data.isLeader);
      setParticipants(data.participants || []);

      if (data.isLeader) {
        toast.info('You are the leader. Share the room code with your partner.');
      } else {
        toast.info('You are the follower. Waiting for the leader to start...');
      }

      // Initialize WebRTC connection
      initializeConnection();
    });

    // Handle signal from other peer
    socket.on('signal', (data) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    // Handle participant joined event
    socket.on('participant-joined', (data) => {
      setParticipants((prev) => [...prev, data]);
      toast.info(`${data.userName} joined the room!`);
    });

    // Handle participant left event
    socket.on('participant-left', (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      toast.info(`${data.userName} left the room.`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error. Please try again.');
    });
  }, [roomId, user, toast, initializeConnection]);

  // Leave the room
  const leaveRoom = useCallback(() => {
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userId: user?.uid });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setPeerId(null);
    setIsLeader(false);
    setParticipants([]);
  }, [roomId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setPeerId(null);
      setIsLeader(false);
      setParticipants([]);
    };
  }, []);

  // Return the API
  return {
    isConnected,
    peerId,
    isLeader,
    participants,
    sendCommand,
    onCommand,
    joinRoom,
    leaveRoom,
  };
};

export default useWebRTC;