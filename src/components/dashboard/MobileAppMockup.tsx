'use client';

import React from 'react';
import {
  Bell,
  PhoneCall,
  MessageSquare,
  Heart,
  Calendar,
  LayoutDashboard,
  Users,
  Megaphone,
  MoreHorizontal,
  Wifi,
  Battery,
  Signal,
  Sparkles,
} from 'lucide-react';

export default function MobileAppMockup() {
  return (
    <div className="flex flex-col items-center">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[280px] rounded-[38px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-2xl border-4 border-slate-700 relative overflow-hidden">
        {/* Device Bezel & Screen */}
        <div className="w-full rounded-[28px] bg-white dark:bg-[#070b1c] text-slate-900 dark:text-white p-3.5 flex flex-col justify-between min-h-[510px] text-xs relative overflow-hidden border border-slate-200 dark:border-white/[0.08]">
          {/* Top Speaker / Dynamic Island */}
          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-2 px-1">
            <span className="font-bold">9:41</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Signal className="w-2.5 h-2.5" />
              <Wifi className="w-2.5 h-2.5" />
              <Battery className="w-3 h-3" />
            </div>
          </div>

          {/* User Greeting Bar */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1">
                Hi, Alex! <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-600">Here&apos;s your sales overview</div>
            </div>
            <div className="relative p-1.5 rounded-full bg-white/[0.05]">
              <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
            </div>
          </div>

          {/* Active Campaign Card */}
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-600 font-medium">Active Campaign</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Running
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 truncate">
              Product Demo Outreach
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-600 mb-1">
              <span>Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">67%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            </div>
          </div>

          {/* 4 Mini Metrics */}
          <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
            <div className="p-1.5 rounded-lg bg-white/[0.03] border border-slate-200 dark:border-white/[0.04]">
              <PhoneCall className="w-2.5 h-2.5 mx-auto text-blue-400 mb-0.5" />
              <div className="text-[8px] text-slate-600">Calls</div>
              <div className="text-[10px] font-bold text-slate-900 dark:text-white">1,256</div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.03] border border-slate-200 dark:border-white/[0.04]">
              <MessageSquare className="w-2.5 h-2.5 mx-auto text-purple-400 mb-0.5" />
              <div className="text-[8px] text-slate-600">Conversations</div>
              <div className="text-[10px] font-bold text-slate-900 dark:text-white">632</div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.03] border border-slate-200 dark:border-white/[0.04]">
              <Heart className="w-2.5 h-2.5 mx-auto text-amber-400 mb-0.5" />
              <div className="text-[8px] text-slate-600">Interested</div>
              <div className="text-[10px] font-bold text-slate-900 dark:text-white">198</div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.03] border border-slate-200 dark:border-white/[0.04]">
              <Calendar className="w-2.5 h-2.5 mx-auto text-emerald-400 mb-0.5" />
              <div className="text-[8px] text-slate-600">Meetings</div>
              <div className="text-[10px] font-bold text-slate-900 dark:text-white">45</div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1.5 px-0.5">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Recent Activity</span>
              <span className="text-indigo-400 cursor-pointer">View All</span>
            </div>

            <div className="space-y-1.5 text-[9px]">
              <div className="p-1.5 rounded-lg bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                    AI Call to TechNova Solutions
                  </div>
                  <div className="text-emerald-400 font-semibold">Interested – Meeting Booked</div>
                </div>
                <span className="text-[8px] text-slate-600">2 min ago</span>
              </div>

              <div className="p-1.5 rounded-lg bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                    AI Call to CloudTech Inc.
                  </div>
                  <div className="text-purple-400 font-semibold">Voicemail Left</div>
                </div>
                <span className="text-[8px] text-slate-600">15 min ago</span>
              </div>

              <div className="p-1.5 rounded-lg bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                    AI Call to DataSystems
                  </div>
                  <div className="text-slate-600 font-semibold">No Answer – Retry Scheduled</div>
                </div>
                <span className="text-[8px] text-slate-600">30 min ago</span>
              </div>
            </div>
          </div>

          {/* Bottom Mobile Tab Bar */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-5 text-center text-[8px] text-slate-600">
            <div className="text-indigo-400 font-semibold">
              <LayoutDashboard className="w-3 h-3 mx-auto mb-0.5 text-indigo-400" />
              <span>Dash</span>
            </div>
            <div>
              <Users className="w-3 h-3 mx-auto mb-0.5" />
              <span>Leads</span>
            </div>
            <div>
              <Megaphone className="w-3 h-3 mx-auto mb-0.5" />
              <span>Campaigns</span>
            </div>
            <div>
              <PhoneCall className="w-3 h-3 mx-auto mb-0.5" />
              <span>Calls</span>
            </div>
            <div>
              <MoreHorizontal className="w-3 h-3 mx-auto mb-0.5" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
