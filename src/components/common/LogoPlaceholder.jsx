// src/components/common/LogoPlaceholder.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is a temporary logo placeholder until I finalise the SynCorrazon logo.
  2. It shows "SynCorrazon" with "ON" highlighted in Neon Cyan (#00D2FF).
  3. I'll replace this with the actual logo component when it's ready.
  4. It's used in the Navbar (top-left corner).
  5. When I have the final logo, I'll swap this out.
*/

import React from 'react';
import './LogoPlaceholder.css';

const LogoPlaceholder = () => {
  return (
    <div className="logo-placeholder">
      <span className="logo-text">Syn</span>
      <span className="logo-text logo-highlight">Corrazon</span>
    </div>
  );
};

export default LogoPlaceholder;