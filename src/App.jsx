// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ThemeSelector from "./components/Layout/ThemeSelector";

// Public pages
import LandingPage from "./components/Landing/LandingPage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

// Protected pages
import RoomLobby from "./components/Room/RoomLobby";
import RoomCreation from "./components/Room/RoomCreation";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";
import AdminAuth from "./components/Admin/AdminAuth";
import AdminPanel from "./components/Admin/AdminPanel";

// 404
import NotFound from "./components/common/NotFound";

const GlobalThemeSelector = () => {
  const { pathname } = useLocation();
  const hasNavbar =
    pathname === "/lobby" ||
    pathname === "/create-room" ||
    pathname.startsWith("/room/");

  return hasNavbar || pathname === "/" ? null : <ThemeSelector />;
};

const RouteMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isLandingPage = pathname === "/";
    document.title = isLandingPage
      ? "Watch YouTube Together, Wherever You Are | SynCorrazon"
      : "SynCorrazon – Watch Together";

    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) {
      robotsTag.setAttribute(
        "content",
        isLandingPage
          ? "index, follow, max-image-preview:large"
          : "noindex, nofollow"
      );
    }
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <RouteMetadata />
          <GlobalThemeSelector />
          <Routes>
            {/* Public routes – anyone can see these */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes – require authentication */}
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

            <Route
              path="/admin3962"
              element={
                <AdminAuth>
                  <AdminPanel />
                </AdminAuth>
              }
            />

            {/* 404 – catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
