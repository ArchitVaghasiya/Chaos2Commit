'use client';

import React from 'react';
import {
  LayoutDashboard,
  Search,
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
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceMinutesUsed?: number;
  voiceMinutesLimit?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  voiceMinutesUsed = 12450,
  voiceMinutesLimit = 20000,
}: SidebarProps) {
  const percentage = Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lead-discovery', label: 'Lead Discovery', icon: Search },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'ai-voice-agent', label: 'AI Voice Agent', icon: Headphones },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'market-intelligence', label: 'Market Intelligence', icon: Globe2 },
    { id: 'integrations', label: 'Integrations', icon: SlidersHorizontal },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin & Audit', icon: Sparkles },
  ];

  return (
    <aside className="group w-[76px] hover:w-64 transition-[width] duration-300 ease-in-out glass-card py-4 px-3.5 flex flex-col justify-between shrink-0 border-indigo-500/10 min-h-[850px] shadow-xl overflow-hidden relative z-50">
      {/* Top Nav List */}
      <nav className="space-y-1.5 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-slate-900 dark:text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`} />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                {item.label}
              </span>
              {item.id === 'lead-discovery' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/30 text-blue-200 font-bold border border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  Live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Voice Minutes Meter & Plan Widget */}
      <div className="mt-6 w-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.04] dark:to-white/[0.01] border border-black/5 dark:border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <Headphones className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> AI Voice Minutes
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold whitespace-nowrap">
              {percentage}% Used
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 whitespace-nowrap">
            {voiceMinutesUsed.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-700 dark:text-slate-400">
              / {voiceMinutesLimit.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <button
            onClick={() => setActiveTab('billing')}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
