import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const THEME_OPTIONS = [
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'glass', label: 'Glassmorphism' },
  { value: 'bold', label: 'Bold Accents' },
  { value: 'warm', label: 'Warm & Cozy' },
];

const ThemeSelector = ({ placement = 'floating' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`theme-selector theme-selector--${placement}`}>
      <span>Theme</span>
      <select
        aria-label="Choose appearance theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
      >
        {THEME_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ThemeSelector;
