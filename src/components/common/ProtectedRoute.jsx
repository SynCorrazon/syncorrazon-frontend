// src/components/common/ProtectedRoute.jsx

/*
  INSTRUCTIONS:
  1. This component wraps any page that requires a logged-in user.
  2. If a user is not logged in, it redirects them to the login page.
  3. If a user is logged in, it shows the page they requested.
  4. I need to use this in App.jsx to protect routes like /lobby, /create-room, /room/:roomId.
  5. It depends on useAuth() from AuthContext.jsx – that must be working first.
*/

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // If auth is still loading, show nothing or a loader
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, show the page
  return children;
};

export default ProtectedRoute;