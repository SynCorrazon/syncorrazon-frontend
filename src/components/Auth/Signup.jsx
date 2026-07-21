// src/components/Auth/Signup.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the Signup page – users create a new account here.
  2. It has email/password signup and Google Sign-In.
  3. It uses useAuth() from AuthContext to call signup() and loginWithGoogle().
  4. It uses useToast() to show success/error messages.
  5. After successful signup, users are redirected to /lobby.
  6. It checks that passwords match before submitting.
  7. If a user is already logged in, they're redirected to /lobby automatically.
*/

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import Loader from '../common/Loader';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/lobby');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      toast.success('Account created! Welcome to SynCorrazon 🎉');
      navigate('/lobby');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to SynCorrazon 🎉');
      navigate('/lobby');
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start watching together with SynCorrazon</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="auth-btn auth-btn-google"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 9.5C27.1 9.5 29.9 10.6 32.1 12.5L38.3 6.3C34.6 3.1 29.7 1 24 1C14.8 1 7 6.5 3.5 14.2L10.8 19.9C12.5 13.8 17.8 9.5 24 9.5Z"
              fill="#EA4335"
            />
            <path
              d="M46.5 24.5C46.5 22.5 46.3 20.9 45.9 19.4H24V30.1H36.6C35.8 33.6 33.5 36.6 30.2 38.4L37.4 44C43.1 38.9 46.5 31.3 46.5 24.5Z"
              fill="#4285F4"
            />
            <path
              d="M10.8 28.1C10.2 26.1 9.9 23.9 9.9 21.7C9.9 19.5 10.2 17.3 10.8 15.3L3.5 9.6C1.3 14.1 0 19.2 0 24.5C0 29.8 1.3 34.9 3.5 39.4L10.8 33.7C10.2 31.7 9.9 29.5 10.8 28.1Z"
              fill="#FBBC05"
            />
            <path
              d="M24 47C29.7 47 34.6 45.2 38.3 41.8L31.1 36.2C28.9 37.8 26.1 38.8 24 38.8C17.8 38.8 12.5 34.5 10.8 28.4L3.5 34.1C7 41.8 14.8 47 24 47Z"
              fill="#34A853"
            />
          </svg>
          Sign up with Google
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;