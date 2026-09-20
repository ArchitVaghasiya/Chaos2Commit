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
  ChevronDown,
  Plus
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  return (
    <header className="w-full glass-card p-4 sm:p-5 mb-6 border-indigo-500/20 bg-gradient-to-r from-slate-50/95 via-white/90 to-blue-50/95 dark:from-[#0c1228]/95 dark:via-[#0e1738]/90 dark:to-[#101432]/95 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 relative z-10">
        
        {/* Left Side: Brand & Robot Icon */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative shadow-lg shadow-emerald-500/30">
            <img src="/ai_sales_logo.jpg" alt="AI Sales Logo" className="w-full h-full object-cover scale-[2.5]" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#090d20]"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-800 dark:from-white dark:via-slate-100 dark:to-indigo-200">
                AI Sales Agent Platform
              </h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 uppercase tracking-wider">
                Autonomous v2.4
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-tight">
              Discover. Qualify. Engage. Convert — All with AI.
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
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">AI Lead Discovery</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">Find high-intent leads across public channels.</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center shrink-0">
                <Headphones className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">AI Voice Agents</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">Multilingual calls that qualify & book meetings.</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Smart Enrichment</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">Verified contacts & company intelligence.</p>
          </div>

          <div className="w-[170px] shrink-0 flex flex-col justify-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Actionable Insights</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">Real-time pipeline ROI & conversation metrics.</p>
          </div>
        </div>

        {/* Right Side: CTA & Actions Stacked */}
        <div className="flex flex-col gap-3 shrink-0 xl:w-[280px]">
          
          {/* CTA Banner */}
          <div className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-slate-900 dark:text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
               <Sparkles className="w-10 h-10" />
             </div>
             <div className="relative z-10">
                <div className="text-[13px] font-bold tracking-tight mb-0.5">More Conversations. More Meetings.</div>
                <div className="text-[11px] text-indigo-100 leading-tight">Let AI do the prospecting while you close deals.</div>
             </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-2 w-full">
            {onOpenNewCampaign && (
              <button
                onClick={onOpenNewCampaign}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3 h-3 text-white" /> New Campaign
              </button>
            )}

            {onOpenCsvImport && (
              <button
                onClick={onOpenCsvImport}
                className="flex-1 py-1.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-black/[0.1] dark:border-white/[0.08] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-3 h-3 text-slate-700 dark:text-slate-400" /> Import CSV
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex items-center shrink-0">
                <Globe2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400 absolute left-2 pointer-events-none" />
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange?.(e.target.value)}
                  aria-label="Select language"
                  className="w-8 h-7 opacity-0 absolute inset-0 cursor-pointer"
                  title="Change Language"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.label}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="w-8 h-[26px] rounded-lg bg-black/[0.05] dark:bg-[#080d20] border border-black/10 dark:border-white/[0.1] flex items-center justify-center pointer-events-none transition-colors">
                   <Globe2 className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                </div>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}
