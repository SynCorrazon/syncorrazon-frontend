// src/components/Landing/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ApprovedReviews from '../common/ApprovedReviews';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">
          <img src="/assets/synco-logo.png" alt="SynCorrazon" />
          <span>SynCorrazon</span>
        </h1>
        <p className="landing-subtitle">Watch YouTube together. Anywhere.</p>
        <p className="landing-description">
          Nigerian-first. Low data. Built for MTN, Glo, and Airtel.
        </p>
        <div className="landing-buttons">
          <Link to="/login" className="landing-btn landing-btn-primary">
            Continue
          </Link>
          <Link to="/signup" className="landing-btn landing-btn-secondary">
            Create Account
          </Link>
        </div>
        <p className="landing-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <ApprovedReviews />
      </div>
    </div>
  );
};

export default LandingPage;