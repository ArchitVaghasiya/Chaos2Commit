'use client';

import React from 'react';
import {
  PhoneCall,
  MessageSquare,
  UserCheck,
  CalendarCheck,
  Voicemail,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface VoiceActivityRailProps {
  onViewAll?: () => void;
}

export default function VoiceActivityRail({ onViewAll }: VoiceActivityRailProps) {
  const activities = [
    { label: 'Calls Made', value: '6,843', change: '↑ 36.7%', icon: PhoneCall, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Conversations', value: '3,248', change: '↑ 29.1%', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Interested Leads', value: '1,024', change: '↑ 28.4%', icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Meetings Booked', value: '312', change: '↑ 31.2%', icon: CalendarCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Voicemails Left', value: '1,752', change: '↑ 22.6%', icon: Voicemail, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Call Success Rate', value: '47.3%', change: '↑ 8.6%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="glass-card p-4 mb-5 border-white/[0.06] shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          AI Voice Agent Activity
        </h3>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-300 font-medium">{item.label}</div>
                  <div className="text-xs font-bold text-white">{item.value}</div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-emerald-400 flex items-center">
                {item.change}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
