'use client';

import React from 'react';
import {
  Globe2,
  Headphones,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Shield,
} from 'lucide-react';

export default function CapabilitiesFooter() {
  const capabilities = [
    {
      icon: Globe2,
      title: 'Multi-Source Lead Discovery',
      desc: 'LinkedIn, X, Websites, Directories, CRM & Freelance Platforms.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Headphones,
      title: 'AI-Powered Voice Agents',
      desc: 'Multilingual conversations that qualify & engage prospects.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: ShieldCheck,
      title: 'Smart Lead Enrichment',
      desc: 'Verified emails, phones, company insights & intent scoring.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      desc: 'Track performance, conversions & campaign ROI in real-time.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: SlidersHorizontal,
      title: 'Seamless Integrations',
      desc: 'CRM, Email, Calendar, WhatsApp, API & more.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Shield,
      title: 'Secure & Scalable',
      desc: 'Enterprise-grade security, privacy & high availability.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <footer className="mt-8 pt-6 pb-4 border-t border-slate-200 dark:border-white/[0.08]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] hover:bg-white/[0.04] hover:border-slate-200 dark:border-white/[0.08] transition-all flex items-start gap-3"
            >
              <div className={`p-2 rounded-lg ${cap.bg} ${cap.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                  {cap.title}
                </div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  {cap.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Futurrizon Technologies • AI Sales Intelligence &amp; Autonomous Voice Agent Platform</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-slate-600 dark:text-slate-300 transition-colors">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-600 dark:text-slate-300 transition-colors">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-600 dark:text-slate-300 transition-colors">Security &amp; Compliance</span>
          <span>•</span>
          <span className="text-indigo-400 font-semibold">API Status: Operational</span>
        </div>
      </div>
    </footer>
  );
}
