'use client';

import React from 'react';
import { 
  Bot, 
  Search, 
  Headphones, 
  FileCheck2, 
  TrendingUp, 
  Rocket, 
  Sparkles,
  Globe2,
  Upload,
  Plus
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

interface HeaderBannerProps {
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onOpenCsvImport?: () => void;
  onOpenNewCampaign?: () => void;
}

export default function HeaderBanner({
  currentLanguage = 'English',
  onLanguageChange,
  onOpenCsvImport,
  onOpenNewCampaign,
}: HeaderBannerProps) {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  const t = getTranslation(currentLanguage);

  return (
    <header className="w-full glass-card p-4 sm:p-5 mb-6 border-indigo-500/20 bg-gradient-to-r from-[#0c1228]/95 via-[#0e1738]/90 to-[#101432]/95 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
        {/* Left: Branding & Robot Icon */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#090d20] rounded-[14px] flex items-center justify-center relative">
                <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-indigo-400" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#090d20]"></span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                {t.platformTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> {t.autonomousBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              {t.tagline}
            </p>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {t.onePlatformSubtitle}
            </p>
          </div>
        </div>

        {/* Center: 4 Value Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-4 w-full xl:w-auto">
          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 transition-all">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t.discoveryPillar}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{t.discoveryDesc}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t.voicePillar}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{t.voiceDesc}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 transition-all">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t.enrichmentPillar}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{t.enrichmentDesc}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t.insightsPillar}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{t.insightsDesc}</div>
            </div>
          </div>
        </div>

        {/* Right: Growth Banner & Global Controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 w-full xl:w-auto justify-between xl:justify-end">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenNewCampaign && (
              <button
                onClick={onOpenNewCampaign}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.newCampaign}</span>
              </button>
            )}

            {onOpenCsvImport && (
              <button
                onClick={onOpenCsvImport}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.importCsv}</span>
              </button>
            )}

            {/* Global Multilingual Selector */}
            <div className="relative flex items-center">
              <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange?.(e.target.value)}
                aria-label="Select platform language"
                className="pl-7 pr-3 py-1.5 rounded-xl bg-[#080d20] border border-indigo-500/30 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-400 cursor-pointer shadow-sm hover:border-indigo-400 transition-colors"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.label}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Growth Banner Pill */}
          <div className="hidden 2xl:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-gradient-to-br from-indigo-600/30 via-blue-600/20 to-purple-600/30 border border-indigo-400/30 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white tracking-wide">
                {t.moreConversations}
              </div>
              <div className="text-[10px] text-indigo-200">
                {t.closeDeals}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
