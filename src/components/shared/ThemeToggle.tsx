'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<string | null>(null);

  useEffect(() => {
    // Sync local state on mount/update
    setLocalTheme(resolvedTheme || 'dark');
  }, [resolvedTheme]);

  if (!localTheme) {
    // Render static layout placeholder to prevent layout shifting/flashing
    return (
      <div className="w-[38px] h-[38px] rounded-lg bg-secondary/80 border border-border/40 shrink-0" />
    );
  }

  const isDark = localTheme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    
    // 1. Instantly apply the theme class to HTML node to bypass state cycles
    const docEl = document.documentElement;
    if (newTheme === 'dark') {
      docEl.classList.add('dark');
      docEl.classList.remove('light');
    } else {
      docEl.classList.add('light');
      docEl.classList.remove('dark');
    }
    
    // 2. Instantly persist choice in localStorage
    localStorage.setItem('theme', newTheme);
    
    // 3. Update local state to toggle icons synchronously
    setLocalTheme(newTheme);
    
    // 4. Update next-themes background client state
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-secondary/80 text-foreground border border-border/40 hover:bg-secondary transition-all shrink-0 w-[38px] h-[38px] flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400 shrink-0" /> : <Moon className="w-4.5 h-4.5 text-indigo-500 shrink-0" />}
    </button>
  );
}
