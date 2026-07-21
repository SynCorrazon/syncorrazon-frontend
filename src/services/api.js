// src/services/api.js

/*
  INSTRUCTIONS:
  1. This file connects my React frontend to Theo's backend.
  2. For now, it points to my local machine (localhost) so I can test alone.
  3. When Theo gives me the live backend URL (Render, ngrok, etc.),
     I need to change the API_BASE_URL in my .env file.
  4. The .env change: REACT_APP_API_URL=http://localhost:5000/api 
     becomes REACT_APP_API_URL=https://syncorrazon-backend.onrender.com/api
  5. Then I restart my frontend with npm start.
*/

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function that handles all my API calls
const apiRequest = async (endpoint, method = 'GET', body = null, headers = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
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

// Auth endpoints – verify my Firebase token with Theo's backend
export const authApi = {
  verifyToken: (idToken) => {
    return apiRequest('/auth/verify', 'POST', { idToken });
  },
};

// Room endpoints – create, join, leave rooms
export const roomApi = {
  createRoom: (roomData) => {
    return apiRequest('/rooms', 'POST', roomData);
  },

  getRoom: (roomId) => {
    return apiRequest(`/rooms/${roomId}`, 'GET');
  },

  joinRoom: (roomId, userData) => {
    return apiRequest(`/rooms/${roomId}/join`, 'POST', userData);
  },

  leaveRoom: (roomId, userId) => {
    return apiRequest(`/rooms/${roomId}/leave`, 'POST', { userId });
  },
};

// Signaling endpoints – WebRTC handshake between two users
export const signalingApi = {
  sendOffer: (roomId, offerData) => {
    return apiRequest(`/signaling/${roomId}/offer`, 'POST', offerData);
  },

  sendAnswer: (roomId, answerData) => {
    return apiRequest(`/signaling/${roomId}/answer`, 'POST', answerData);
  },

  sendIceCandidate: (roomId, candidateData) => {
    return apiRequest(`/signaling/${roomId}/ice`, 'POST', candidateData);
  },
};

// Export everything together
const api = {
  auth: authApi,
  room: roomApi,
  signaling: signalingApi,
};

export default api;