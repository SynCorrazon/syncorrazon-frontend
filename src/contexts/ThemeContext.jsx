import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

const THEME_STORAGE_KEY = 'syncorrazon-theme';
const THEMES = ['minimalist', 'glass', 'bold', 'warm'];

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(savedTheme) ? savedTheme : 'minimalist';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
