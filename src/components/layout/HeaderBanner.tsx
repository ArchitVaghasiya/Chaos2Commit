'use client';

import React from 'react';
import { Bot, Search, Headphones, FileCheck2, TrendingUp, Rocket, Sparkles } from 'lucide-react';

export default function HeaderBanner() {
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
                AI Sales Agent Platform
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3" /> Autonomous v2.4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Discover. Qualify. Engage. Convert — All with AI.
            </p>
            <p className="text-[11px] text-slate-400 hidden md:block">
              One Platform. End-to-End Autonomous Sales Workflow.
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
              <div className="text-xs font-bold text-slate-200">AI Lead Discovery</div>
              <div className="text-[10px] text-slate-400 leading-tight">Find high-intent leads across public channels</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">AI Voice Agents</div>
              <div className="text-[10px] text-slate-400 leading-tight">Multilingual calls that qualify & book meetings</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 transition-all">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Smart Enrichment</div>
              <div className="text-[10px] text-slate-400 leading-tight">Verified contacts & company intelligence</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Actionable Insights</div>
              <div className="text-[10px] text-slate-400 leading-tight">Real-time pipeline ROI & conversation metrics</div>
            </div>
          </div>
        </div>

        {/* Right: Growth Banner Pill */}
        <div className="hidden 2xl:flex items-center gap-3.5 px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-600/30 via-blue-600/20 to-purple-600/30 border border-indigo-400/30 shadow-lg shrink-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              More Conversations. More Meetings.
            </div>
            <div className="text-[11px] text-indigo-200">
              Let AI do the prospecting while you close deals.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
