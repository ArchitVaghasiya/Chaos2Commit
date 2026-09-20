'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Clock,
  Globe2,
  Users,
  CheckCircle2,
  Calendar,
  BarChart3,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  PhoneCall,
  CalendarCheck,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { getHubsTranslation } from '@/lib/i18n/hubsTranslations';

interface CampaignItem {
  id: string;
  name: string;
  status: 'RUNNING' | 'PAUSED' | 'SCHEDULED' | 'COMPLETED';
  targetIndustry: string;
  targetLocation: string;
  progressPercent: number;
  totalLeadsCount: number;
  callsMadeCount: number;
  conversationsCount: number;
  interestedCount: number;
  meetingsBooked: number;
  scheduleType: string;
  timezone: string;
  createdAt: string;
}

interface CampaignsHubProps {
  currentLanguage?: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Enterprise M365 & SharePoint Outreach',
    status: 'RUNNING',
    targetIndustry: 'IT Services & Software',
    targetLocation: 'North America (EST / PST)',
    progressPercent: 67,
    totalLeadsCount: 1874,
    callsMadeCount: 1256,
    conversationsCount: 632,
    interestedCount: 198,
    meetingsBooked: 45,
    scheduleType: 'Daily (9 AM - 5 PM Local)',
    timezone: 'America/New_York',
    createdAt: '2025-05-01'
  },
  {
    id: 'camp-2',
    name: 'Cloud Data Warehouse Modernization',
    status: 'RUNNING',
    targetIndustry: 'Consulting & Financial Services',
    targetLocation: 'Europe (CET)',
    progressPercent: 42,
    totalLeadsCount: 940,
    callsMadeCount: 395,
    conversationsCount: 180,
    interestedCount: 64,
    meetingsBooked: 18,
    scheduleType: 'Weekly (Tues & Thurs)',
    timezone: 'Europe/Berlin',
    createdAt: '2025-05-04'
  },
  {
    id: 'camp-3',
    name: 'Healthcare Clinical Workflow Automation',
    status: 'PAUSED',
    targetIndustry: 'Healthcare & Pharma',
    targetLocation: 'Global',
    progressPercent: 88,
    totalLeadsCount: 520,
    callsMadeCount: 458,
    conversationsCount: 210,
    interestedCount: 72,
    meetingsBooked: 24,
    scheduleType: 'Immediate Launch',
    timezone: 'UTC',
    createdAt: '2025-04-20'
  }
];

export default function CampaignsHub({ currentLanguage = 'English' }: CampaignsHubProps) {
  const t = getHubsTranslation(currentLanguage).campaigns;
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New campaign form state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newIndustry, setNewIndustry] = useState('IT Services');
  const [newLocation, setNewLocation] = useState('North America');
  const [newScheduleType, setNewScheduleType] = useState('Daily (Local Timezone)');
  const [newDailyLimit, setNewDailyLimit] = useState(150);

  // Toggle campaign status
  const handleToggleStatus = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const created: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: newCampaignName,
      status: 'RUNNING',
      targetIndustry: newIndustry,
      targetLocation: newLocation,
      progressPercent: 0,
      totalLeadsCount: newDailyLimit * 3,
      callsMadeCount: 0,
      conversationsCount: 0,
      interestedCount: 0,
      meetingsBooked: 0,
      scheduleType: newScheduleType,
      timezone: 'Auto (Prospect Local)',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns([created, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaignName('');
  };

  // Video Slide 6 volume chart data points
  const volumeData = [
    { day: 'Mon', count: 420 },
    { day: 'Tue', count: 680 },
    { day: 'Wed', count: 910 },
    { day: 'Thu', count: 1150 },
    { day: 'Fri', count: 980 },
    { day: 'Sat', count: 320 },
    { day: 'Sun', count: 180 },
    { day: 'Mon', count: 780 },
    { day: 'Tue', count: 1100 },
    { day: 'Wed', count: 1256 },
  ];

  const maxVolume = Math.max(...volumeData.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Top Header Card matching Video Slide 6 */}
      <div className="glass-card p-6 border-indigo-500/20 shadow-xl bg-gradient-to-r from-[#0d1334] via-[#0e163b] to-[#121035]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {t.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-slate-900 dark:text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> {t.newCampaign}
          </button>
        </div>

        {/* 4 Metric Pills directly matching Slide 6 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t.totalLeadsTargeted}</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">12,568</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18% vs last month
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t.activeCampaigns}</span>
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">4,231</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +24% vs last month
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t.callsConnected}</span>
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">2,847</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +31% vs last month
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t.meetingsBooked}</span>
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">612</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +27% vs last month
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Lead Volume Over Time Bar Chart + Team & Campaign Control (Directly matching Slide 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Volume Over Time Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Lead volume over time
            </h3>
            <span className="text-xs text-slate-600">Daily outbound volume</span>
          </div>

          {/* Bar chart rendering */}
          <div className="h-48 flex items-end gap-2 sm:gap-3 pt-8 pb-2 px-2 border-b border-slate-200 dark:border-white/[0.06]">
            {volumeData.map((d, i) => {
              const heightPx = Math.max(18, Math.round((d.count / maxVolume) * 135));
              return (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 pointer-events-none z-10 whitespace-nowrap">
                    {d.count} calls
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPx}px` }}
                    className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 hover:from-indigo-500 hover:to-purple-400 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                  />
                  {/* Day label */}
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-3">
            <span>Average: 780 daily calls processed</span>
            <span className="text-emerald-400 font-semibold">99.4% Delivery Rate</span>
          </div>
        </div>

        {/* Right Column: Team & campaign control (5 cols) matching Slide 6 */}
        <div className="lg:col-span-5 glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Team &amp; campaign control
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Assign leads to sales reps</div>
                  <div className="text-[11px] text-slate-600">Owner-based routing by territory and deal size</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Approve or reject discovered leads</div>
                  <div className="text-[11px] text-slate-600">Quality gate threshold (Intent Score &ge; 75)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Create and monitor campaigns</div>
                  <div className="text-[11px] text-slate-600">Live status tracking with sub-second event telemetry</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Role-based access control</div>
                  <div className="text-[11px] text-slate-600">Admin &bull; Manager &bull; Representative tiers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-600">
            <span>Enterprise governance</span>
            <span className="text-indigo-400 font-semibold cursor-pointer">Manage Permissions &rarr;</span>
          </div>
        </div>
      </div>

      {/* Active Campaigns Management Table (PDF Page 2 & Page 3 Step 10) */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Campaigns &amp; Schedules</h3>
            <p className="text-xs text-slate-600">Monitor live progress, pause/resume, and review booked meetings</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-white/[0.03] text-slate-600 border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Target &amp; Schedule</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Performance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-600">Created: {c.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.status === 'RUNNING'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 dark:text-slate-200">{c.targetIndustry}</div>
                    <div className="text-[10px] text-slate-600">{c.targetLocation} • {c.scheduleType}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                        <span>{c.callsMadeCount} / {c.totalLeadsCount}</span>
                        <span className="font-bold">{c.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] text-slate-600">Conversations</div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.conversationsCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-600">Interested</div>
                        <div className="font-bold text-amber-400">{c.interestedCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-600">Meetings</div>
                        <div className="font-bold text-emerald-400">{c.meetingsBooked}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all cursor-pointer ${
                        c.status === 'RUNNING'
                          ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30'
                          : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                      }`}
                    >
                      {c.status === 'RUNNING' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Resume
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card border-indigo-500/30 p-6 bg-white dark:bg-[#0c1228] shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" /> Create Autonomous AI Campaign
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Configure target audience, calling hours based on prospect timezone, and daily limit.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Q3 Cloud Security Outreach"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Industry</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IT Services">IT Services &amp; Cloud</option>
                    <option value="Software">Software &amp; SaaS</option>
                    <option value="Healthcare">Healthcare &amp; Life Sciences</option>
                    <option value="Finance">Financial Services</option>
                    <option value="Manufacturing">Manufacturing &amp; Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Location &amp; Timezone</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="North America (EST/PST)">North America (EST / PST)</option>
                    <option value="Europe (CET/GMT)">Europe (CET / GMT)</option>
                    <option value="APAC (SGT/AEST)">APAC (SGT / AEST)</option>
                    <option value="Global (Follow Timezone)">Global (Follow Prospect Timezone)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Cadence / Schedule</label>
                  <select
                    value={newScheduleType}
                    onChange={(e) => setNewScheduleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Daily (9 AM - 5 PM Local)">Daily (9 AM - 5 PM Local)</option>
                    <option value="Weekly Batches">Weekly Batches</option>
                    <option value="Immediate Launch">Immediate Launch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Daily Call Limit</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={newDailyLimit}
                    onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
