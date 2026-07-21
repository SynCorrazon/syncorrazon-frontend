// src/components/VideoPlayer/AdBanner.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the ad banner placeholder – shows a banner ad for free tier users.
  2. It receives an `isPro` prop – if true, the ad is hidden.
  3. For MVP, all users are free, so `isPro` is always false.
  4. Later, when Pro tier is implemented, this will hide ads for paying users.
  5. The banner is placed at the bottom of the VideoPlayer screen.
*/

import React from 'react';
import './AdBanner.css';

const AdBanner = ({ isPro = false }) => {
  // If user is Pro, don't show ads
  if (isPro) {
    return null;
  }

  return (
    <div className="ad-banner">
      <div className="ad-banner-content">
        <span className="ad-banner-label">📢 Ad</span>
        <span className="ad-banner-text">
          Support SynCorrazon – watch free with ads
        </span>
      </div>
      {/* In the future, AdMob will replace this placeholder */}
    </div>
  );
};

export default AdBanner;