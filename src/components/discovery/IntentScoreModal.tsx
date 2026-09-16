'use client';

import React from 'react';
import { X, CheckCircle, Zap, DollarSign, Award, Target, ArrowUpRight } from 'lucide-react';
import { LeadItem } from './DiscoveredLeadCard';

interface IntentScoreModalProps {
  lead: LeadItem | null;
  pipeline: LeadItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLead: (lead: LeadItem) => void;
}

export default function IntentScoreModal({
  lead,
  pipeline,
  isOpen,
  onClose,
  onSelectLead,
}: IntentScoreModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card border-indigo-500/30 p-6 shadow-2xl relative bg-[#0a0f28]/95">
        <button
          onClick={onClose}
          aria-label="Close Intent Score dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            AI Qualification &amp; Prioritisation
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Predictive Intent Score &amp; Pipeline Fit
          </h2>
          <p className="text-xs text-slate-400">
            Scored on requirement fit, buying intent, seniority, and company profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
          {/* Left Column: Big Predictive Intent Score Circle */}
          <div className="md:col-span-6 p-5 rounded-2xl bg-[#070a1a] border border-indigo-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="text-xs font-semibold text-slate-400 mb-2">Predictive Intent Score</div>

            {/* Glowing Circular Gauge */}
            <div className="relative flex items-center justify-center w-36 h-36 mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#score-gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(lead.intentScore / 100) * 264} 264`}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {lead.intentScore}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">/ 100</span>
              </div>
            </div>

            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-3">
              <CheckCircle className="w-3.5 h-3.5" /> High potential – Ready to engage
            </div>

            {/* 4 Qualification Signals */}
            <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-3 border-t border-white/[0.06]">
              <div className="p-1.5 rounded-lg bg-white/[0.03] text-slate-300 flex items-center gap-1.5 justify-center">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Budget: {lead.budgetSignal}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.03] text-slate-300 flex items-center gap-1.5 justify-center">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Urgency: {lead.urgencyLevel}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.03] text-slate-300 flex items-center gap-1.5 justify-center">
                <Award className="w-3 h-3 text-blue-400" />
                <span>Decision Maker</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.03] text-slate-300 flex items-center gap-1.5 justify-center">
                <Target className="w-3 h-3 text-purple-400" />
                <span>Active RFP</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prioritised Pipeline List */}
          <div className="md:col-span-6 p-4 rounded-2xl bg-[#070a1a] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
                <span>Prioritised Pipeline</span>
                <span className="text-[10px] text-indigo-400 font-normal">Ranked by Fit</span>
              </div>

              <div className="space-y-2">
                {pipeline.slice(0, 4).map((p) => {
                  const isCurrent = p.id === lead.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectLead(p)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.companyName} • {p.jobTitle}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          p.intentScore >= 90
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.intentScore >= 75
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {p.intentScore}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between mt-3">
              <span>Auto-prioritized by AI Sales Agent</span>
              <span className="text-indigo-400 flex items-center gap-0.5 font-medium">
                Real-time scoring <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Close &amp; Return to Dashboard
        </button>
      </div>
    </div>
  );
}
