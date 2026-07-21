// src/components/common/NotFound.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the 404 page – users see it when they go to a URL that doesn't exist.
  2. It's the catch-all route in App.jsx (<Route path="*" element={<NotFound />} />).
  3. It has a "Go Home" button that takes users back to the login page.
  4. It matches the dark theme (Deep Indigo background, Neon Cyan accents).
*/

import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-button">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;