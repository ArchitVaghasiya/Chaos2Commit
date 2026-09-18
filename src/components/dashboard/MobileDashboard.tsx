'use client';

import React from 'react';
import {
  Bell,
  Phone,
  MessageSquare,
  UserCheck,
  Calendar,
  LayoutDashboard,
  Users,
  Megaphone,
  PhoneCall,
  MoreHorizontal
} from 'lucide-react';

export default function MobileDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040814] text-slate-900 dark:text-white pb-20 flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Hi, Alex! <span>👋</span>
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">Here's your sales overview</p>
        </div>
        <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-slate-800 dark:text-slate-300" />
          <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-5">
        
        {/* Active Campaign Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Active Campaign</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Running
            </span>
          </div>
          <h3 className="text-base font-bold mb-4">Product Demo Outreach</h3>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-700 dark:text-slate-400">Progress</span>
            <span className="font-bold">67%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-[67%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-400 mb-0.5">Calls</span>
            <span className="text-lg font-bold">1,256</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-400 mb-0.5">Conversations</span>
            <span className="text-lg font-bold">632</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-400 mb-0.5">Interested</span>
            <span className="text-lg font-bold">198</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-400 mb-0.5">Meetings</span>
            <span className="text-lg font-bold">45</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Recent Activity</h3>
            <button className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { company: 'TechNova Solutions', status: 'Interested - Meeting Booked', time: '2 min ago', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
              { company: 'CloudTech Inc.', status: 'Voicemail Left', time: '15 min ago', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
              { company: 'DataSystems', status: 'No Answer - Retry Scheduled', time: '30 min ago', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            ].map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-white dark:bg-white/[0.02] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold mb-0.5 text-slate-900 dark:text-white">AI Call to {act.company}</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400">{act.status}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 shrink-0 ml-2">{act.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#090d20] border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-around px-2 z-50">
        <button className="flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-medium">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300">
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-medium">Leads</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300">
          <Megaphone className="w-5 h-5" />
          <span className="text-[9px] font-medium">Campaigns</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300">
          <PhoneCall className="w-5 h-5" />
          <span className="text-[9px] font-medium">Calls</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300">
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[9px] font-medium">More</span>
        </button>
      </div>

    </div>
  );
}
