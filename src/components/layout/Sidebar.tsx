'use client';

import React from 'react';
import Link from 'next/link';
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
  User,
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceMinutesUsed?: number;
  voiceMinutesLimit?: number;
  currentLanguage?: string;
  currentUser?: { name?: string; email?: string } | null;
  onOpenProfile?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  voiceMinutesUsed = 12450,
  voiceMinutesLimit = 20000,
  currentLanguage = 'English',
  currentUser,
  onOpenProfile,
}: SidebarProps) {
  const percentage = Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100);
  const t = getTranslation(currentLanguage);

  const menuItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'lead-discovery', label: t.navLeadDiscovery, icon: Search },
    { id: 'leads', label: t.navLeads, icon: Users },
    { id: 'campaigns', label: t.navCampaigns, icon: Megaphone },
    { id: 'ai-voice-agent', label: t.navVoiceAgent, icon: Headphones },
    { id: 'conversations', label: t.navConversations, icon: MessageSquare },
    { id: 'analytics', label: t.navAnalytics, icon: BarChart3 },
    { id: 'market-intelligence', label: t.navMarketIntelligence, icon: Globe2 },
    { id: 'integrations', label: t.navIntegrations, icon: SlidersHorizontal },
    { id: 'billing', label: t.navBilling, icon: CreditCard },
    { id: 'settings', label: t.navSettings, icon: Settings },
    { id: 'admin', label: t.navAdmin, icon: Sparkles },
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
              <Headphones className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {t.voiceQuota}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold whitespace-nowrap">
              {percentage}% {t.voiceMinutesUsed}
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

      {/* Account / Profile Button */}
      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] w-full">
        {onOpenProfile ? (
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3.5 px-2 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all overflow-hidden group/acc text-left cursor-pointer"
            title="Update Profile Details"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover/acc:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'Account Details'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Update Profile
              </div>
            </div>
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="w-full flex items-center gap-3.5 px-2 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all overflow-hidden group/acc"
            title="Sign In / Account"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover/acc:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Sign In / Account</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Manage Profile</div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
