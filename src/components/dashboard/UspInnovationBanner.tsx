'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  PhoneCall,
  ShieldCheck,
  Globe2,
  Users,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Layers,
  Bot,
  Flame
} from 'lucide-react';

export default function UspInnovationBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  const usps = [
    {
      id: 'sentiment',
      title: 'Multimodal Sentiment & Objection Analyzer',
      badge: 'USP 1 • Real-Time AI',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Dynamic conversational sentiment gauge detecting hesitation, budget pushback, and skepticism on live voice turns, triggering real-time pitch adaptation.'
    },
    {
      id: 'negative_handoff',
      title: 'Negative-Call De-escalation & Human Handoff',
      badge: 'USP 2 • Zero Friction',
      icon: ShieldCheck,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      description: 'Gracefully de-escalates reluctant prospects with instant Do-Not-Call (DND) compliance suppression, or triggers an instant audio bridge to human account executives.'
    },
    {
      id: 'timezone',
      title: 'Timezone Regulatory Compliance Guard',
      badge: 'USP 3 • TCPA & GDPR',
      icon: Clock,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Enforces strict 9:00 AM – 5:00 PM outbound calling windows mapped automatically from prospect country/area code, preventing unlawful calling outside business hours.'
    },
    {
      id: 'telephony',
      title: 'Dual-Channel Telephony (Twilio PSTN + Web Studio)',
      badge: 'USP 4 • Live Telecom',
      icon: PhoneCall,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description: 'Dials real mobile phones over Twilio carrier trunks while offering a zero-latency WebRTC browser studio for instant evaluation, recording full audio & transcripts.'
    },
    {
      id: 'workflow',
      title: 'Dual Workflow Choice (Calling Only vs Leads + Calling)',
      badge: 'USP 5 • Enterprise Flexibility',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description: 'Businesses with existing lead lists can upload CSV/Excel and launch voice calling directly without running lead discovery, or use end-to-end AI lead scraping.'
    }
  ];

  return (
    <div className="glass-card p-4 sm:p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0b122f]/80 to-purple-950/40 shadow-xl mb-6 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Chaos2Commit • 5 Flagship Innovations &amp; USPs
              </h3>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                Beyond Minimum Requirements
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Multilingual Calling &bull; Twilio PSTN &bull; Negative DND De-escalation &bull; Human Handoff &bull; Timezone Calling Rules
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200 dark:border-white/10 shrink-0"
        >
          <span>{isExpanded ? 'Hide Details' : 'Inspect 5 USPs'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-slate-200 dark:border-white/[0.08] animate-in fade-in duration-200">
          {usps.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b1e] border border-slate-200 dark:border-white/[0.06] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${u.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                      {u.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{u.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {u.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
