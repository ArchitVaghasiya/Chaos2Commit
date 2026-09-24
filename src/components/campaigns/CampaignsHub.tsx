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
  Layers,
  SlidersHorizontal,
  Target,
  Bot,
  Zap,
  ShieldCheck,
  Check,
  PhoneForwarded,
  X
} from 'lucide-react';
import { getHubsTranslation } from '@/lib/i18n/hubsTranslations';

interface CampaignItem {
  id: string;
  name: string;
  status: 'RUNNING' | 'PAUSED' | 'SCHEDULED' | 'COMPLETED';
  workflowType: 'CALLING_ONLY' | 'LEADS_AND_CALLING';
  targetIndustry: string;
  targetLocation: string;
  targetLanguage: string;
  minIntentScore: number;
  progressPercent: number;
  totalLeadsCount: number;
  callsMadeCount: number;
  conversationsCount: number;
  interestedCount: number;
  meetingsBooked: number;
  scheduleType: string;
  timezone: string;
  repeatCadence: string;
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
    workflowType: 'LEADS_AND_CALLING',
    targetIndustry: 'IT Services & Software',
    targetLocation: 'North America (EST / PST)',
    targetLanguage: 'English',
    minIntentScore: 85,
    progressPercent: 67,
    totalLeadsCount: 1874,
    callsMadeCount: 1256,
    conversationsCount: 632,
    interestedCount: 198,
    meetingsBooked: 45,
    scheduleType: 'Daily (9 AM - 5 PM Local)',
    timezone: 'America/New_York',
    repeatCadence: 'Daily',
    createdAt: '2025-05-01'
  },
  {
    id: 'camp-2',
    name: 'DACH Cloud Migration & Compliance',
    status: 'RUNNING',
    workflowType: 'LEADS_AND_CALLING',
    targetIndustry: 'Cloud & Infrastructure',
    targetLocation: 'DACH (Germany, Austria, Switzerland)',
    targetLanguage: 'Deutsch',
    minIntentScore: 80,
    progressPercent: 42,
    totalLeadsCount: 940,
    callsMadeCount: 395,
    conversationsCount: 180,
    interestedCount: 64,
    meetingsBooked: 18,
    scheduleType: 'Weekly (Tues & Thurs)',
    timezone: 'Europe/Berlin',
    repeatCadence: 'Weekly',
    createdAt: '2025-05-04'
  },
  {
    id: 'camp-3',
    name: 'CSV Direct Batch - Calling Only (Financial Services)',
    status: 'RUNNING',
    workflowType: 'CALLING_ONLY',
    targetIndustry: 'Finance & Banking',
    targetLocation: 'Europe (Spain & UK)',
    targetLanguage: 'Auto (Prospect Location)',
    minIntentScore: 75,
    progressPercent: 88,
    totalLeadsCount: 520,
    callsMadeCount: 458,
    conversationsCount: 210,
    interestedCount: 72,
    meetingsBooked: 24,
    scheduleType: 'Immediate Launch',
    timezone: 'Europe/Madrid',
    repeatCadence: 'One-time',
    createdAt: '2025-04-20'
  }
];

export default function CampaignsHub({ currentLanguage = 'English' }: CampaignsHubProps) {
  const t = getHubsTranslation(currentLanguage).campaigns;
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New campaign state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newWorkflowMode, setNewWorkflowMode] = useState<'LEADS_AND_CALLING' | 'CALLING_ONLY'>('LEADS_AND_CALLING');
  const [newIndustry, setNewIndustry] = useState('IT Services');
  const [newLocation, setNewLocation] = useState('North America (EST/PST)');
  const [newLanguage, setNewLanguage] = useState('Auto (Prospect Location)');
  const [newMinIntent, setNewMinIntent] = useState(80);
  const [newDecisionMakerOnly, setNewDecisionMakerOnly] = useState(true);
  const [newScheduleType, setNewScheduleType] = useState('Daily (9 AM - 5 PM Local)');
  const [newRepeatCadence, setNewRepeatCadence] = useState('Daily');
  const [newDailyLimit, setNewDailyLimit] = useState(150);

  // Batch Dialer Simulator State
  const [activeDialerCampId, setActiveDialerCampId] = useState<string | null>(null);
  const [dialerFeedback, setDialerFeedback] = useState<string | null>(null);

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

  // Run Batch Campaign Auto-Dialer Simulator
  const handleRunBatchDialer = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    setActiveDialerCampId(campaignId);
    setDialerFeedback(`Initiating regulatory compliant auto-dialer for ${campaign.name}... Checking prospect local timezones (9 AM - 5 PM window).`);

    setTimeout(() => {
      setDialerFeedback(`Dialing 12 queued prospects across ${campaign.targetLocation} in ${campaign.targetLanguage}... Sub-150ms Groq voice engine streaming.`);
    }, 1500);

    setTimeout(() => {
      setDialerFeedback(`6 calls connected • 3 prospects qualified • 1 demo meeting booked with Solutions Lead!`);
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === campaignId) {
            return {
              ...c,
              callsMadeCount: c.callsMadeCount + 12,
              conversationsCount: c.conversationsCount + 6,
              interestedCount: c.interestedCount + 3,
              meetingsBooked: c.meetingsBooked + 1,
              progressPercent: Math.min(100, c.progressPercent + 6),
            };
          }
          return c;
        })
      );

      setTimeout(() => {
        setActiveDialerCampId(null);
        setDialerFeedback(null);
      }, 3000);
    }, 3800);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const created: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: newCampaignName,
      status: 'RUNNING',
      workflowType: newWorkflowMode,
      targetIndustry: newIndustry,
      targetLocation: newLocation,
      targetLanguage: newLanguage,
      minIntentScore: newMinIntent,
      progressPercent: 0,
      totalLeadsCount: newDailyLimit * 3,
      callsMadeCount: 0,
      conversationsCount: 0,
      interestedCount: 0,
      meetingsBooked: 0,
      scheduleType: newScheduleType,
      timezone: 'Auto (Prospect Local)',
      repeatCadence: newRepeatCadence,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns([created, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaignName('');
  };

  // Slide 6 volume chart data points
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
      {/* Top Header Card */}
      <div className="glass-card p-6 border-indigo-500/20 shadow-xl bg-gradient-to-r from-[#0d1334] via-[#0e163b] to-[#121035]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> Campaign Management &amp; Orchestration
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Autonomous Multilingual AI Campaigns
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Timezone-aware regulatory dialer, custom lead qualification filters, and Calling Only vs Leads workflows.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Campaign Wizard
          </button>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Total Leads Targeted</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">12,568</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18% vs last month
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Calls Dispatched</span>
              <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">8,412</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> 67% connect rate
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Qualified Conversations</span>
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">3,890</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Sub-150ms voice latency
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Demos &amp; Meetings Booked</span>
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">342</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Auto-synced to Calendar
            </div>
          </div>
        </div>

        {/* Regulatory Timezone Compliance Guard Notification */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-200 font-medium">
              <strong className="text-white">Regulatory Timezone Guard Active:</strong> Outbound AI calling strictly respects 9:00 AM – 5:00 PM in each prospect&apos;s verified local timezone.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 self-start sm:self-auto">
            TCPA &amp; GDPR Compliant
          </span>
        </div>
      </div>

      {/* Active Dialer Feedback Notification */}
      {dialerFeedback && (
        <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            <span className="text-white font-semibold">{dialerFeedback}</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
            Groq Llama-3.3 + Twilio
          </span>
        </div>
      )}

      {/* Active Campaigns Management Table */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Campaigns &amp; Automated Schedules</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Manage live campaigns, launch batch dialer, filter criteria, and repeat cadences
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Campaign Name &amp; Workflow</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Target Region &amp; Language</th>
                <th className="py-3 px-4">Timezone Schedule</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Outcomes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        c.workflowType === 'CALLING_ONLY'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                      }`}>
                        {c.workflowType === 'CALLING_ONLY' ? 'Calling Only' : 'Leads + Calling'}
                      </span>
                      <span className="text-[10px] text-slate-500">Min Score: {c.minIntentScore || 75}+</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.status === 'RUNNING'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{c.targetLocation}</div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-300 flex items-center gap-1 mt-0.5 font-semibold">
                      <Globe2 className="w-3 h-3" />
                      <span>{c.targetLanguage || 'English'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{c.scheduleType}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Cadence: {c.repeatCadence || 'Daily'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="w-28">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                        <span>{c.callsMadeCount} / {c.totalLeadsCount}</span>
                        <span className="font-bold">{c.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500">Conversations</div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.conversationsCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Meetings</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{c.meetingsBooked}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRunBatchDialer(c.id)}
                        disabled={activeDialerCampId === c.id}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title="Run batch dialer across queued leads"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{activeDialerCampId === c.id ? 'Dialing...' : 'Auto-Dialer'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          c.status === 'RUNNING'
                            ? 'bg-amber-600/20 text-amber-500 hover:bg-amber-600/30'
                            : 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'
                        }`}
                        title={c.status === 'RUNNING' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {c.status === 'RUNNING' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Campaign Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-card border-indigo-500/30 p-6 bg-white dark:bg-[#0c1228] shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" /> Create Multilingual Campaign
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Q4 DACH Cloud Infrastructure Outreach"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Workflow Mode Selector */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Workflow Execution Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`p-2.5 rounded-xl border cursor-pointer ${
                    newWorkflowMode === 'CALLING_ONLY'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                  }`}>
                    <input
                      type="radio"
                      name="campWorkflow"
                      checked={newWorkflowMode === 'CALLING_ONLY'}
                      onChange={() => setNewWorkflowMode('CALLING_ONLY')}
                      className="mr-2"
                    />
                    <span>AI Calling Only (Direct)</span>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">Dials existing leads directly without web discovery.</p>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer ${
                    newWorkflowMode === 'LEADS_AND_CALLING'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                  }`}>
                    <input
                      type="radio"
                      name="campWorkflow"
                      checked={newWorkflowMode === 'LEADS_AND_CALLING'}
                      onChange={() => setNewWorkflowMode('LEADS_AND_CALLING')}
                      className="mr-2"
                    />
                    <span>Leads + AI Calling</span>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">Scans public feeds, qualifies intent, then executes voice.</p>
                  </label>
                </div>
              </div>

              {/* Target Region and Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Region &amp; Timezone</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  >
                    <option value="North America (EST/PST)">North America (EST / PST)</option>
                    <option value="DACH (Germany, Austria, Switzerland)">DACH (Germany / Austria / Switzerland)</option>
                    <option value="LatAm & Spain (CET/GMT-3)">LatAm &amp; Spain (Español)</option>
                    <option value="France & Benelux (CET)">France &amp; Benelux (Français)</option>
                    <option value="Middle East (GST/AST)">Middle East (Dubai / Riyadh - العربية)</option>
                    <option value="India (IST)">India (IST - हिन्दी / English)</option>
                    <option value="Global (Follow Prospect Timezone)">Global (Follow Prospect Timezone)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target AI Calling Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  >
                    <option value="Auto (Prospect Location)">Auto (Select per Prospect Location)</option>
                    <option value="English">English</option>
                    <option value="Deutsch">Deutsch (German)</option>
                    <option value="Español">Español (Spanish)</option>
                    <option value="Français">Français (French)</option>
                    <option value="हिन्दी">हिन्दी (Hindi)</option>
                    <option value="العربية">العربية (Arabic)</option>
                  </select>
                </div>
              </div>

              {/* Scoring Threshold & Criteria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Minimum Intent Score Filter: <span className="text-indigo-500 font-bold">{newMinIntent}+</span>
                  </label>
                  <input
                    type="range"
                    min={60}
                    max={95}
                    step={5}
                    value={newMinIntent}
                    onChange={(e) => setNewMinIntent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>60 (Broad)</span>
                    <span>80 (Strict)</span>
                    <span>95 (Urgent Only)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Repeat Cadence</label>
                  <select
                    value={newRepeatCadence}
                    onChange={(e) => setNewRepeatCadence(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  >
                    <option value="Daily">Daily Batches</option>
                    <option value="Weekly">Weekly (Tues &amp; Thurs)</option>
                    <option value="Monthly">Monthly Follow-up Cycle</option>
                    <option value="One-time">One-time Immediate</option>
                  </select>
                </div>
              </div>

              {/* Regulatory Timezone Notice in Modal */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>
                  <strong>Timezone Regulatory Guard:</strong> AI voice dialer will only initiate calls between 9 AM and 5 PM in the prospect&apos;s verified local timezone.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
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
