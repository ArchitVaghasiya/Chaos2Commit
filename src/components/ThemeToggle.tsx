'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.1] flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/[0.1] transition-colors"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className="h-[14px] w-[14px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700 dark:text-slate-300" />
      <Moon className="absolute h-[14px] w-[14px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-700 dark:text-slate-300" />
    </button>
  );
}
