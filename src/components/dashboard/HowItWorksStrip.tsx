'use client';

import React from 'react';
import { 
  UserPlus, 
  Search, 
  FileText, 
  Headphones, 
  UserCheck, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';

export default function HowItWorksStrip() {
  const steps = [
    {
      number: 1,
      title: 'Register & Setup',
      desc: 'Sign up & provide your business, products & services.',
      icon: UserPlus,
      color: 'bg-blue-500',
    },
    {
      number: 2,
      title: 'AI Discovers Opportunities',
      desc: 'AI finds where prospects post their requirements publicly.',
      icon: Search,
      color: 'bg-indigo-500',
    },
    {
      number: 3,
      title: 'Leads Enriched Automatically',
      desc: 'Get enriched leads with contacts, company info & original post links.',
      icon: FileText,
      color: 'bg-cyan-500',
    },
    {
      number: 4,
      title: 'AI Voice Agent Engages',
      desc: 'AI calls, qualifies, answers FAQs & handles conversations.',
      icon: Headphones,
      color: 'bg-purple-500',
    },
    {
      number: 5,
      title: 'Interested Leads Ready for You',
      desc: 'Focus on hot leads, book meetings & close deals.',
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      number: 6,
      title: 'Analyze & Scale',
      desc: 'Track performance, get insights & repeat successful campaigns.',
      icon: TrendingUp,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="glass-card p-5 mb-6 border-white/[0.06] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>How It Works</span>
        </h3>
        <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-medium">
          Autonomous 6-Step Workflow
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-6 h-6 rounded-full ${step.color} text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/20`}
                  >
                    {step.number}
                  </div>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-xs font-bold text-slate-100 mb-1 leading-snug">
                  {step.title}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600 pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
