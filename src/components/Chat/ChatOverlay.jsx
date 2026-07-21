// src/components/Chat/ChatOverlay.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the chat overlay – it sits on top of the video player.
  2. It uses Firebase Firestore for real-time messages.
  3. It stores messages in: `/rooms/{roomId}/messages/{messageId}`
  4. It shows: user avatar, username, message text, timestamp (on hover).
  5. It collapses into a small bubble icon when not in use.
  6. It's bottom-right corner, semi-transparent with blur effect.
  7. For full-screen mode: floating keyboard + brief toast messages appear.
*/

import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import './ChatOverlay.css';

const ChatOverlay = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  // Fetch messages from Firestore
  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(firestore, 'rooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);

      // Update unread count (if not expanded)
      if (!isExpanded && newMessages.length > 0) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [roomId, isExpanded]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Mark messages as read when expanded
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !roomId || !currentUser) return;

    try {
      const messagesRef = collection(firestore, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        text: input.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Anonymous',
        timestamp: serverTimestamp(),
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    }
  };

  // Toggle chat expansion
  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus input when expanding
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-overlay ${isExpanded ? 'chat-overlay-expanded' : 'chat-overlay-collapsed'}`}>
      {/* Collapsed state – bubble icon */}
      {!isExpanded && (
        <button className="chat-bubble" onClick={toggleChat}>
          <span className="chat-bubble-icon">💬</span>
          {unreadCount > 0 && (
            <span className="chat-bubble-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Expanded state – chat panel */}
      {isExpanded && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <span className="chat-header-title">Chat</span>
            <button className="chat-header-close" onClick={toggleChat}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>No messages yet</p>
                <p className="chat-empty-sub">Start the conversation! 💬</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.userId === currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
                  >
                    <div className="chat-message-avatar">
                      {message.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="chat-message-content">
                      <div className="chat-message-header">
                        <span className="chat-message-username">
                          {message.userName || 'Anonymous'}
                        </span>
                        <span className="chat-message-time">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="chat-message-text">{message.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatOverlay;