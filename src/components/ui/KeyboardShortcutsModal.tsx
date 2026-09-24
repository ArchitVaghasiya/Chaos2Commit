'use client';

import React, { useEffect } from 'react';
import { 
  Keyboard, 
  X, 
  Command, 
  Search, 
  Headphones, 
  LayoutDashboard, 
  Sparkles, 
  SunMoon 
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      name: 'Global Shortcuts',
      icon: Command,
      shortcuts: [
        { keys: ['⌘', 'K'], label: 'Open Command Palette' },
        { keys: ['?'], label: 'Show Keyboard Shortcuts' },
        { keys: ['Esc'], label: 'Close active modal / dialog' },
        { keys: ['T'], label: 'Toggle Light / Dark theme' },
      ],
    },
    {
      name: 'Quick Navigation',
      icon: LayoutDashboard,
      shortcuts: [
        { keys: ['G', 'D'], label: 'Jump to Dashboard' },
        { keys: ['G', 'S'], label: 'Jump to Discovery' },
        { keys: ['G', 'L'], label: 'Jump to Leads Pipeline' },
        { keys: ['G', 'V'], label: 'Jump to AI Voice Agent' },
        { keys: ['G', 'C'], label: 'Jump to Campaigns' },
      ],
    },
    {
      name: 'AI Voice & Lead Actions',
      icon: Headphones,
      shortcuts: [
        { keys: ['C'], label: 'Launch AI Call Simulator' },
        { keys: ['M'], label: 'Mute / Unmute live audio' },
        { keys: ['E'], label: 'Export Leads CSV' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl glass-card p-6 bg-white/95 dark:bg-[#0c132c]/95 border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-base font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accelerate your daily sales intelligence workflow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Categories */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.name} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <GroupIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{group.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.shortcuts.map((sc) => (
                    <div
                      key={sc.label}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-2">
                        {sc.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {sc.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-[#121838] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Tip: Press <kbd className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 font-mono font-bold text-[10px]">⌘K</kbd> to access quick search anytime.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
