'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Headphones, 
  MessageSquare, 
  BarChart3, 
  Globe2, 
  SlidersHorizontal, 
  CreditCard, 
  Settings, 
  Sparkles, 
  SunMoon, 
  Languages, 
  User, 
  FileDown, 
  ArrowRight, 
  Command, 
  CornerDownLeft, 
  X,
  PhoneCall
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/ToastProvider';
import { LeadItem } from '@/components/discovery/DiscoveredLeadCard';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leads: LeadItem[];
  onOpenCallModal?: (lead: LeadItem) => void;
  onOpenProfile?: () => void;
  onOpenShortcuts?: () => void;
  onLanguageChange?: (lang: string) => void;
  currentLanguage?: string;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Leads' | 'Actions' | 'Preferences';
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  badge?: string;
}

export default function GlobalCommandPalette({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  leads,
  onOpenCallModal,
  onOpenProfile,
  onOpenShortcuts,
  onLanguageChange,
  currentLanguage = 'English',
}: GlobalCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct command actions list
  const commandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Dashboard Overview',
        subtitle: 'Main KPI metrics & activity rail',
        icon: LayoutDashboard,
        action: () => {
          setActiveTab('dashboard');
          toast.success('Navigated to Dashboard');
        },
      },
      {
        id: 'nav-lead-discovery',
        category: 'Navigation',
        title: 'Lead Discovery Engine',
        subtitle: 'Search public RFPs & requirement feeds',
        icon: Search,
        badge: 'Live',
        action: () => {
          setActiveTab('lead-discovery');
          toast.success('Navigated to Lead Discovery');
        },
      },
      {
        id: 'nav-leads',
        category: 'Navigation',
        title: 'Leads Management & CRM Pipeline',
        subtitle: 'Filter, import CSV, and manage verified prospects',
        icon: Users,
        action: () => {
          setActiveTab('leads');
          toast.success('Navigated to Leads Hub');
        },
      },
      {
        id: 'nav-campaigns',
        category: 'Navigation',
        title: 'Outbound Campaigns',
        subtitle: 'Schedule automated cadence and tracking',
        icon: Megaphone,
        action: () => {
          setActiveTab('campaigns');
          toast.success('Navigated to Campaigns');
        },
      },
      {
        id: 'nav-ai-voice',
        category: 'Navigation',
        title: 'AI Voice Calling Agent',
        subtitle: 'Sub-150ms multilingual voice qualifications',
        icon: Headphones,
        badge: 'Groq + Gemini',
        action: () => {
          setActiveTab('ai-voice-agent');
          toast.success('Navigated to Voice Agent');
        },
      },
      {
        id: 'nav-conversations',
        category: 'Navigation',
        title: 'Call Transcripts & Audio Recordings',
        subtitle: 'Review conversational transcripts & objection notes',
        icon: MessageSquare,
        action: () => {
          setActiveTab('conversations');
          toast.success('Navigated to Conversations');
        },
      },
      {
        id: 'nav-analytics',
        category: 'Navigation',
        title: 'Performance Analytics',
        subtitle: 'Multi-line charts & conversion breakdown',
        icon: BarChart3,
        action: () => {
          setActiveTab('analytics');
          toast.success('Navigated to Analytics');
        },
      },
      {
        id: 'nav-market-intel',
        category: 'Navigation',
        title: 'Market Intelligence',
        subtitle: 'Company funding, tech stack & hiring signals',
        icon: Globe2,
        action: () => {
          setActiveTab('market-intelligence');
          toast.success('Navigated to Market Intelligence');
        },
      },
      {
        id: 'nav-integrations',
        category: 'Navigation',
        title: 'Connected Integrations',
        subtitle: 'HubSpot, Salesforce, Twilio & Calendly sync',
        icon: SlidersHorizontal,
        action: () => {
          setActiveTab('integrations');
          toast.success('Navigated to Integrations');
        },
      },
      {
        id: 'nav-billing',
        category: 'Navigation',
        title: 'Billing & Voice Quota',
        subtitle: 'Manage subscription tier and usage minutes',
        icon: CreditCard,
        action: () => {
          setActiveTab('billing');
          toast.success('Navigated to Billing');
        },
      },
      {
        id: 'nav-settings',
        category: 'Navigation',
        title: 'Settings & Onboarding',
        subtitle: 'Step 1-6 user journey & voice calibration',
        icon: Settings,
        action: () => {
          setActiveTab('settings');
          toast.success('Navigated to Settings');
        },
      },
      {
        id: 'nav-admin',
        category: 'Navigation',
        title: 'Admin Audit & Security Logs',
        subtitle: 'Compliance logs and system access trail',
        icon: Sparkles,
        action: () => {
          setActiveTab('admin');
          toast.success('Navigated to Admin Audit');
        },
      },

      // Quick Actions
      {
        id: 'action-theme-toggle',
        category: 'Preferences',
        title: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle platform interface color theme',
        icon: SunMoon,
        action: () => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          toast.info(`Switched to ${next} mode`);
        },
      },
      {
        id: 'action-profile',
        category: 'Actions',
        title: 'Edit Account Profile',
        subtitle: 'Update user name, company name & telephony credentials',
        icon: User,
        action: () => {
          onOpenProfile?.();
        },
      },
      {
        id: 'action-shortcuts',
        category: 'Preferences',
        title: 'Keyboard Shortcuts Cheat Sheet',
        subtitle: 'Show all platform hotkeys and hot navigation keys',
        icon: Command,
        action: () => {
          onOpenShortcuts?.();
        },
      },
      {
        id: 'action-lang-en',
        category: 'Preferences',
        title: 'Set Language to English',
        subtitle: 'Platform UI in English',
        icon: Languages,
        action: () => {
          onLanguageChange?.('English');
          toast.info('Language set to English');
        },
      },
      {
        id: 'action-lang-es',
        category: 'Preferences',
        title: 'Set Language to Español',
        subtitle: 'Platform UI in Spanish',
        icon: Languages,
        action: () => {
          onLanguageChange?.('Español');
          toast.info('Idioma cambiado a Español');
        },
      },
      {
        id: 'action-lang-hi',
        category: 'Preferences',
        title: 'Set Language to हिन्दी (Hindi)',
        subtitle: 'Platform UI in Hindi',
        icon: Languages,
        action: () => {
          onLanguageChange?.('हिन्दी');
          toast.info('भाषा बदलकर हिन्दी कर दी गई');
        },
      },
    ];

    // Append Leads dynamically
    if (leads && leads.length > 0) {
      leads.slice(0, 10).forEach((l) => {
        items.push({
          id: `lead-${l.id}`,
          category: 'Leads',
          title: `${l.name} (${l.companyName})`,
          subtitle: `${l.jobTitle} • ${l.intentScore} Intent • "${l.originalPostSnippet?.substring(0, 50)}..."`,
          icon: PhoneCall,
          badge: `${l.intentScore}%`,
          action: () => {
            onOpenCallModal?.(l);
            toast.success(`Launched Live Call with ${l.name}`);
          },
        });
      });
    }

    return items;
  }, [leads, theme, setTheme, setActiveTab, onOpenCallModal, onOpenProfile, onOpenShortcuts, onLanguageChange, toast]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, commandItems]);

  // Keyboard navigation inside modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl glass-card bg-white/95 dark:bg-[#0b1026]/95 border-slate-200 dark:border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-label="Global Command Palette"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center gap-3 relative z-10">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, jump to module, or search leads..."
            className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 relative z-10">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching commands or leads found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const IconComponent = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="truncate">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-50/80 dark:bg-[#070b1a]/80 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 font-mono text-[9px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 font-mono text-[9px]">ESC</kbd> Close
            </span>
          </div>

          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Press &apos;?&apos; for all shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}
