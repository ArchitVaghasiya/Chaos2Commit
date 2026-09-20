'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
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
  LogIn
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const t = getTranslation(currentLanguage);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
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
    <header className="w-full glass-card p-4 sm:p-5 mb-6 border-indigo-500/20 bg-gradient-to-r from-slate-50/95 via-white/90 to-blue-50/95 dark:from-[#0c1228]/95 dark:via-[#0e1738]/90 dark:to-[#101432]/95 shadow-xl dark:shadow-2xl relative transition-colors z-20">
      {/* Background ambient lighting confined to the header bounds */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-72 h-32 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 relative z-10">
        
        {/* Left Side: Brand & Robot Icon */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative shadow-lg shadow-emerald-500/30">
            <img src="/ai_sales_logo.jpg" alt="AI Sales Logo" className="w-full h-full object-cover scale-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-800 dark:from-white dark:via-slate-100 dark:to-indigo-200">
                {t.platformTitle}
              </h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 uppercase tracking-wider">
                {t.autonomousBadge}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-tight">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center: 4 Value Pillars */}
        <div className="flex items-stretch gap-3 overflow-x-auto hide-scrollbar flex-1 xl:max-w-max pb-2 xl:pb-0">
          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.discoveryPillar}</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">{t.discoveryDesc}</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center shrink-0">
                <Headphones className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.voicePillar}</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">{t.voiceDesc}</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.enrichmentPillar}</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">{t.enrichmentDesc}</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.insightsPillar}</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">{t.insightsDesc}</p>
          </div>
        </div>

        {/* Right Side: CTA & Actions Stacked */}
        <div className="flex flex-col gap-3 shrink-0 xl:w-[380px]">
          
          {/* CTA Banner */}
          <div className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-slate-900 dark:text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
               <Sparkles className="w-10 h-10" />
             </div>
             <div className="relative z-10">
                <div className="text-[13px] font-bold tracking-tight mb-0.5">{t.moreConversations}</div>
                <div className="text-[11px] text-indigo-100 leading-tight">{t.closeDeals}</div>
             </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
            {onOpenNewCampaign && (
              <button
                onClick={onOpenNewCampaign}
                className="h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0"
              >
                <Plus className="w-3 h-3 text-white" /> {t.newCampaign}
              </button>
            )}

            {onOpenCsvImport && (
              <button
                onClick={onOpenCsvImport}
                className="h-7 px-2.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-black/[0.1] dark:border-white/[0.08] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0"
              >
                <Upload className="w-3 h-3 text-slate-700 dark:text-slate-400" /> {t.importCsv}
              </button>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative shrink-0" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="h-7 px-2 rounded-lg bg-black/[0.05] dark:bg-[#080d20] border border-black/10 dark:border-white/[0.1] flex items-center gap-1.5 transition-colors hover:bg-black/[0.1] dark:hover:bg-white/[0.05] cursor-pointer"
                  title="Change Language"
                >
                   <Languages className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                   <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                     {languages.find(l => l.label === currentLanguage)?.code.toUpperCase() || 'EN'}
                   </span>
                   <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/[0.1] shadow-xl py-1 z-50 overflow-hidden">
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
              
              <ThemeToggle />

              <Link
                href="/sign-in"
                className="h-7 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap"
                title="Sign In / Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Sign In</span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}
