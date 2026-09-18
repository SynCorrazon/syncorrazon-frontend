// src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth endpoints
export const authApi = {
  verifyToken: (idToken) => {
    return apiRequest('/v1/auth', 'POST', { idToken });
  },
  getCurrentUser: (token) => {
    return apiRequest('/v1/auth/me', 'GET', null, token);
  },
};

export const getBackendToken = async (currentUser) => {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) return storedToken;
  if (!currentUser) return null;

  const idToken = await currentUser.getIdToken();
  const data = await authApi.verifyToken(idToken);
  localStorage.setItem('authToken', data.token);
  return data.token;
};

// Room endpoints
export const roomApi = {
  createRoom: (videoUrl, token) => {
    return apiRequest('/v1/rooms', 'POST', { videoUrl }, token);
  },
  getRooms: (token) => {
    return apiRequest('/v1/rooms', 'GET', null, token);
  },
  getRoom: (roomId, token) => {
    return apiRequest(`/v1/rooms/${roomId}`, 'GET', null, token);
  },
  joinRoom: (roomCode, token) => {
    return apiRequest('/v1/rooms/join', 'POST', { roomCode }, token);
  },
  leaveRoom: (roomId, token) => {
    return apiRequest(`/v1/rooms/${roomId}/leave`, 'POST', null, token);
  },
};

export default {
  auth: authApi,
  room: roomApi,
};