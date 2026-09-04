import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PsychoTheme, ThemeOption } from '../types';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sage_botanical',
    name: 'Serene Botanical',
    tagline: 'Sage, Warm Stone & Biophilic Calming',
    badge: 'Pilihan 1',
    primaryColor: '#2D5A46',
    bgColor: '#F8FAF7',
    isDark: false,
  },
  {
    id: 'cognitive_slate',
    name: 'Cognitive Haven',
    tagline: 'Deep Midnight Slate & Calming Teal',
    badge: 'Pilihan 2',
    primaryColor: '#14B8A6',
    bgColor: '#0B1118',
    isDark: true,
  },
  {
    id: 'sand_therapy',
    name: 'Warm Sand Therapy',
    tagline: 'Terracotta & Linen Paper Humanistik',
    badge: 'Pilihan 3',
    primaryColor: '#9C533A',
    bgColor: '#FAF6F0',
    isDark: false,
  },
];

interface ThemeContextType {
  theme: PsychoTheme;
  setTheme: (theme: PsychoTheme) => void;
  currentOption: ThemeOption;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'gemini_psycho_theme_choice';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PsychoTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as PsychoTheme;
    if (saved && ['sage_botanical', 'cognitive_slate', 'sand_therapy'].includes(saved)) {
      return saved;
    }
    return 'sage_botanical';
  });

  const setTheme = (newTheme: PsychoTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  useEffect(() => {
    // Update body dataset / classes for global CSS styling
    document.documentElement.setAttribute('data-theme', theme);
    if (currentOption.isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0B1118';
      document.body.style.color = '#F1F5F9';
    } else if (theme === 'sage_botanical') {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAF7';
      document.body.style.color = '#162A20';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FAF6F0';
      document.body.style.color = '#291E19';
    }
  }, [theme, currentOption]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentOption,
        isDark: currentOption.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function usePsychoTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('usePsychoTheme must be used within a ThemeProvider');
  }
  return context;
}
