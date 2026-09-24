'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Headphones, 
  ArrowLeft,
  Languages,
  ChevronDown,
  Check
} from 'lucide-react';
import { AuthLanguageProvider, useAuthLanguage } from '@/contexts/AuthLanguageContext';
import { AuthSupportedLanguage } from '@/lib/i18n/authTranslations';

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useAuthLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: { code: string; label: AuthSupportedLanguage }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b19] text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Header Navigation */}
      <header className="w-full relative z-20 px-6 py-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] backdrop-blur-md bg-white/40 dark:bg-[#070b19]/40">
        <Link 
          href="/"
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 relative">
            <img 
              src="/ai_sales_logo.jpg" 
              alt="Chaos2Commit AI Logo" 
              className="w-full h-full object-cover scale-[2.4]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-300">
                Chaos2Commit
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 uppercase tracking-wider">
                Autonomous AI
              </span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Sales Intelligence & Voice Platform
            </span>
          </div>
        </Link>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 px-3.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.backToDashboard}
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="h-8 px-2.5 rounded-lg bg-black/[0.04] dark:bg-[#0f172a] border border-black/10 dark:border-white/[0.1] flex items-center gap-1.5 transition-colors hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-xs font-medium cursor-pointer"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="text-slate-700 dark:text-slate-300">
                {languages.find(l => l.label === language)?.code.toUpperCase() || 'EN'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-36 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/[0.1] shadow-xl py-1.5 z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.label);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      language === lang.label 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    {lang.label}
                    {language === lang.label && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area: Split View on Large Screens */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero & Feature Showcase Column (Hidden on mobile/tablet or secondary) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.multiLangBadge}</span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-slate-950 dark:text-white font-heading">
                {t.heroHeadline} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                  {t.heroHighlight}
                </span>
              </h2>

              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed max-w-lg font-medium">
                {t.heroDescription}
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] backdrop-blur-sm shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-950 dark:text-white font-heading">{t.feature1Title}</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {t.feature1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-sm shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-950 dark:text-white font-heading">{t.feature2Title}</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {t.feature2Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-sm shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-950 dark:text-white font-heading">{t.feature3Title}</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {t.feature3Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof & Metrics */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.1] flex items-center justify-between">
              <div>
                <div className="text-3xl font-extrabold text-slate-950 dark:text-white tabular-nums font-heading">94.2%</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prospect Fit Accuracy</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/[0.1]" />
              <div>
                <div className="text-3xl font-extrabold text-slate-950 dark:text-white tabular-nums font-heading">12,450+</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Voice Minutes Run</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/[0.1]" />
              <div>
                <div className="text-3xl font-extrabold text-slate-950 dark:text-white tabular-nums font-heading">3.8x</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pipeline Velocity</div>
              </div>
            </div>

          </div>

          {/* Right Form Container Column */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            {children}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full relative z-20 py-4 px-6 border-t border-black/[0.04] dark:border-white/[0.06] text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          © {new Date().getFullYear()} Chaos2Commit AI. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Security</Link>
        </div>
      </footer>

    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLanguageProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </AuthLanguageProvider>
  );
}
