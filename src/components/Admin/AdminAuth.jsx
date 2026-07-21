// src/components/Admin/AdminAuth.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the Admin Auth guard – protects the admin panel.
  2. It uses a simple password stored in environment variables.
  3. Later, can be upgraded to Firebase Auth with admin role.
  4. Only I know the password.
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/ToastContainer';
import './Admin.css';

const AdminAuth = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast.success('Welcome admin!');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <h1 className="admin-auth-title">🔐 Admin Access</h1>
        <p className="admin-auth-subtitle">Enter the admin password to continue</p>
        <form onSubmit={handleSubmit} className="admin-auth-form">
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-auth-input"
            autoFocus
          />
          <button type="submit" className="admin-auth-btn">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;