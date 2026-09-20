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
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: t.kpiLeadsEnriched,
      value: (stats?.leadsEnriched || 18542).toLocaleString(),
      growth: stats?.growth.enriched || '+24.3%',
      icon: UserCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: t.kpiCallsMade,
      value: (stats?.aiCallsMade || 6843).toLocaleString(),
      growth: stats?.growth.calls || '+36.7%',
      icon: PhoneCall,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      title: t.kpiMeetingsBooked,
      value: (stats?.meetingsBooked || 312).toLocaleString(),
      growth: stats?.growth.meetings || '+31.2%',
      icon: CalendarCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">{t.kpiOverviewTitle}</h2>
        <select
          aria-label="Filter overview by timeframe"
          className="px-2.5 py-1 rounded-lg bg-[#0e1428] border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="glass-card glass-card-hover p-4 border-white/[0.06] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium text-slate-300">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> {card.growth}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
