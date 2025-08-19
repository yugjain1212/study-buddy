import { useEffect, useState } from 'react';

// Simple hook to persist and toggle dark mode. Default is dark to match current design.
export function useDarkMode() {
  const getInitial = () => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    if (stored === 'light') return false;
    if (stored === 'dark') return true;
    // No preference saved: prefer system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return {
    isDark,
    toggle: () => setIsDark((prev) => !prev)
  } as const;
}
