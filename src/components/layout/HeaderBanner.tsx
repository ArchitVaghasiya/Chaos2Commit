'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Headphones, 
  FileCheck2, 
  TrendingUp, 
  Sparkles,
  Languages,
  Upload,
  ChevronDown,
  Plus,
  Check,
  LogIn,
  User,
  LogOut,
  Rocket
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getTranslation } from '@/lib/i18n/translations';

interface HeaderBannerProps {
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onOpenCsvImport?: () => void;
  onOpenNewCampaign?: () => void;
  currentUser?: { name: string; email?: string } | null;
  onSignOut?: () => void;
  onOpenProfile?: () => void;
}

export default function HeaderBanner({
  currentLanguage = 'English',
  onLanguageChange,
  onOpenCsvImport,
  onOpenNewCampaign,
  currentUser,
  onSignOut,
  onOpenProfile,
}: HeaderBannerProps) {
  const t = getTranslation(currentLanguage);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full glass-card p-4 sm:p-5 mb-6 border-slate-200/80 dark:border-indigo-500/20 bg-gradient-to-r from-slate-50/95 via-white/90 to-blue-50/95 dark:from-[#0c1228]/95 dark:via-[#0e1738]/90 dark:to-[#101432]/95 shadow-xl dark:shadow-2xl relative transition-colors z-20">
      {/* Background ambient lighting confined to header bounds */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-72 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* TOP ROW: Brand Identity & Comprehensive Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 relative shadow-md shadow-emerald-500/20 border border-slate-200/80 dark:border-white/10">
              <img src="/ai_sales_logo.jpg" alt="AI Sales Logo" className="w-full h-full object-cover scale-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-800 dark:from-white dark:via-slate-100 dark:to-indigo-200">
                  {t.platformTitle}
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> {t.autonomousBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Right: Actions, Language, Theme & Account */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Value Proposition Badge on wide displays */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mr-1">
              <Rocket className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.moreConversations}</span>
            </div>

            {/* Action Buttons */}
            {onOpenNewCampaign && (
              <button
                onClick={onOpenNewCampaign}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{t.newCampaign}</span>
              </button>
            )}

            {onOpenCsvImport && (
              <button
                onClick={onOpenCsvImport}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] text-xs font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                <span>{t.importCsv}</span>
              </button>
            )}

            {/* Language Dropdown */}
            <div className="relative shrink-0" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-[#080d20] border border-slate-200 dark:border-white/[0.1] flex items-center gap-1.5 transition-colors hover:bg-slate-200 dark:hover:bg-white/[0.05] cursor-pointer"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {languages.find(l => l.label === currentLanguage)?.code.toUpperCase() || 'EN'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-32 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/[0.1] shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange?.(lang.label);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        currentLanguage === lang.label 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {lang.label}
                      {currentLanguage === lang.label && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Account / Authentication Controls */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-white/[0.1]">
                <button
                  onClick={onOpenProfile}
                  className="h-8 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 active:scale-95 text-indigo-700 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200 dark:border-indigo-500/30"
                  title="Click to update profile details"
                >
                  <User className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span className="truncate max-w-[120px]">{currentUser.name}</span>
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="h-8 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-500/15 active:scale-95 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-all cursor-pointer border border-slate-200 dark:border-white/[0.08]"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="h-8 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-1 active:scale-95"
                title="Sign In / Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: The 4 Value Pillars (Spacious, Full-Width Responsive 4-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5 border-t border-slate-200/80 dark:border-white/[0.06]">
          {/* Pillar 1: AI Lead Discovery */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.04] transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block leading-tight">
                {t.discoveryPillar}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                {t.discoveryDesc}
              </p>
            </div>
          </div>

          {/* Pillar 2: AI Voice Agents */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/[0.06] hover:border-purple-500/40 hover:bg-purple-50/40 dark:hover:bg-purple-500/[0.04] transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block leading-tight">
                {t.voicePillar}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                {t.voiceDesc}
              </p>
            </div>
          </div>

          {/* Pillar 3: Smart Enrichment */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/[0.06] hover:border-cyan-500/40 hover:bg-cyan-50/40 dark:hover:bg-cyan-500/[0.04] transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block leading-tight">
                {t.enrichmentPillar}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                {t.enrichmentDesc}
              </p>
            </div>
          </div>

          {/* Pillar 4: Actionable Insights */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/[0.04] transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block leading-tight">
                {t.insightsPillar}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                {t.insightsDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
