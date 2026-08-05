'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Home, Feather, BarChart3, Settings, Moon, Sun, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  // Command items
  const commands = [
    { label: 'Go Home', action: () => router.push('/'), icon: Home },
    { label: 'Go Dashboard', action: () => router.push('/profile/dashboard'), icon: BarChart3 },
    { label: 'Write New Poem', action: () => router.push('/write'), icon: Feather },
    { label: 'System Settings', action: () => router.push('/admin/settings'), icon: Settings },
    { label: 'Toggle Theme', action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), icon: theme === 'dark' ? Sun : Moon }
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10"
        >
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            className="w-full max-w-lg rounded-2xl glass border border-border/50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input box */}
            <div className="relative border-b border-border/40 p-4">
              <Search className="absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                placeholder="Search commands, directories or shortcuts..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full pl-9 pr-4 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Suggestions list */}
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.label}
                    onClick={() => {
                      cmd.action();
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      index === selectedIndex
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'hover:bg-secondary/40 text-foreground'
                    }`}
                  >
                    <cmd.icon className="w-4 h-4 shrink-0" />
                    <span>{cmd.label}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No commands match your query.
                </div>
              )}
            </div>

            {/* Footer with key info */}
            <div className="border-t border-border/30 bg-secondary/25 p-3 flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/40">ESC</kbd> to close
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" />
                </span>
                to navigate
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/40">ENTER</kbd>
                to select
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
