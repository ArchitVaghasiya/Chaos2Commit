'use client';

import React from 'react';
import { ArrowUpRight, Users, UserCheck, PhoneCall, CalendarCheck } from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

interface OverviewKpisProps {
  stats?: {
    leadsDiscovered: number;
    leadsEnriched: number;
    aiCallsMade: number;
    meetingsBooked: number;
    growth: {
      discovered: string;
      enriched: string;
      calls: string;
      meetings: string;
    };
  };
  currentLanguage?: string;
}

export default function OverviewKpis({ stats, currentLanguage = 'English' }: OverviewKpisProps) {
  const t = getTranslation(currentLanguage);

  const cards = [
    {
      title: t.kpiLeadsDiscovered,
      value: (stats?.leadsDiscovered || 24568).toLocaleString(),
      growth: stats?.growth.discovered || '+28.5%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: t.kpiLeadsEnriched,
      value: (stats?.leadsEnriched || 18542).toLocaleString(),
      growth: stats?.growth.enriched || '+24.3%',
      icon: UserCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: t.kpiCallsMade,
      value: (stats?.aiCallsMade || 6843).toLocaleString(),
      growth: stats?.growth.calls || '+36.7%',
      icon: PhoneCall,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      title: t.kpiMeetingsBooked,
      value: (stats?.meetingsBooked || 312).toLocaleString(),
      growth: stats?.growth.meetings || '+31.2%',
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white font-heading">{t.kpiOverviewTitle}</h2>
        <select
          aria-label="Filter overview by timeframe"
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1428] border border-slate-300 dark:border-white/[0.12] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
        >
          <option>This Month</option>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="glass-card glass-card-hover p-4 sm:p-5 border-slate-200/90 dark:border-white/[0.1] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight tabular-nums font-heading">
                  {card.value}
                </div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-1.5 tabular-nums">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {card.growth}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
