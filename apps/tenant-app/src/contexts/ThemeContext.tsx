import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadSavedTheme } from '@/lib/theme';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface ThemeContextType {
  reloadTheme: () => void;
  themeVersion: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeVersion, setThemeVersion] = useState(0);

  const reloadTheme = () => {
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser?.tenantId) {
      loadSavedTheme(currentUser.tenantId);
      setThemeVersion(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Load theme initially
    reloadTheme();

    // Listen for storage changes (theme updates, tenant switches)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CURRENT_USER || e.key === STORAGE_KEYS.THEME_CONFIGS) {
        reloadTheme();
      }
    };

    // Listen for custom theme change events
    const handleThemeChange = () => {
      reloadTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ reloadTheme, themeVersion }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
