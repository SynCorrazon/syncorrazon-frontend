import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Room pages
import RoomLobby from './components/Room/RoomLobby';
import RoomCreation from './components/Room/RoomCreation';

// Video Player
import VideoPlayer from './components/VideoPlayer/VideoPlayer';

// 404
import NotFound from './components/common/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes (require authentication) */}
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <RoomLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-room"
            element={
              <ProtectedRoute>
                <RoomCreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />

          {/* 404 – catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;