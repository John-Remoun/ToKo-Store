import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const ThemeContext = createContext(null);

export const PALETTES = [
  { id: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { id: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { id: 'slate', label: 'Slate', swatch: '#64748b' },
];

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('toko_mode') || 'light');
  const [palette, setPalette] = useState(() => localStorage.getItem('toko_palette') || 'emerald');

  // Fetch settings from API on load
  useEffect(() => {
    api.get('/settings').then((res) => {
      const data = res.data?.data || res.data;
      if (data && data.themeMode) {
        if (data.themeMode === 'system') {
           const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
           setMode(isDark ? 'dark' : 'light');
        } else {
           setMode(data.themeMode);
        }
      }
      if (data && data.primaryColor) {
        // Map hex to palette name, or just use palette string if backend was updated to save the name.
        // For simplicity we assume primaryColor field stores the palette ID.
        // Let's check if primaryColor matches any palette
        const found = PALETTES.find(p => p.id === data.primaryColor || p.swatch === data.primaryColor);
        if (found) {
          setPalette(found.id);
        }
      }
    }).catch((err) => console.error('Failed to load settings', err));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('toko_mode', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', palette);
    localStorage.setItem('toko_palette', palette);
  }, [palette]);

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
