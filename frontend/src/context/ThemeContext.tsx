import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect system theme
  const getSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Validate and parse stored theme mode
  const getStoredThemeMode = (): ThemeMode => {
    const stored = localStorage.getItem('themeMode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  };

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return getStoredThemeMode();
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const mode = getStoredThemeMode();
    return mode === 'system' ? getSystemTheme() : mode;
  });

  // Update theme based on mode
  useEffect(() => {
    const updateTheme = () => {
      const newTheme = themeMode === 'system' ? getSystemTheme() : themeMode;
      setTheme(newTheme);
      
      // Apply Carbon Design System theme via data attribute
      // The Sass themes will handle the CSS variables
      // When system mode, remove attribute to let :root styles apply
      if (themeMode === 'system') {
        document.documentElement.removeAttribute('data-carbon-theme');
      } else if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-carbon-theme', 'g100');
      } else {
        document.documentElement.setAttribute('data-carbon-theme', 'g10');
      }
    };

    updateTheme();

    // Listen for system theme changes when in system mode
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
