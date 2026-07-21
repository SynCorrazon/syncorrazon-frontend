// src/components/common/ToastContainer.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is my toast notification system – it pops up small messages at the bottom of the screen.
  2. I use it for: errors ("Something went wrong"), success ("Sync restored!"), and info ("Syncing network...").
  3. I call it like: toast.success("Sync restored!") or toast.error("Failed to join room").
  4. It auto-dismisses after 4 seconds (or I can set a custom duration).
  5. It uses React's Context API – I wrap the app with ToastProvider so I can use it anywhere.
*/

import React, { createContext, useContext, useState, useCallback } from 'react';
import './ToastContainer.css';

// Create the context
const ToastContext = createContext();

// Custom hook to use toast anywhere
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ToastProvider – wraps the app
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a toast
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  // Helper methods for different types
  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const info = (message, duration) => addToast(message, 'info', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);

  const value = {
    addToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};