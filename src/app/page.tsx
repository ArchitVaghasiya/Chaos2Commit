'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HeaderBanner from '@/components/layout/HeaderBanner';
import Sidebar from '@/components/layout/Sidebar';
import OverviewKpis from '@/components/dashboard/OverviewKpis';
import DiscoverySearch from '@/components/discovery/DiscoverySearch';
import DiscoveredLeadCard, { LeadItem } from '@/components/discovery/DiscoveredLeadCard';
import CampaignPerformanceChart from '@/components/dashboard/CampaignPerformanceChart';
import DonutCharts from '@/components/dashboard/DonutCharts';
import VoiceActivityRail from '@/components/dashboard/VoiceActivityRail';
import MobileAppMockup from '@/components/dashboard/MobileAppMockup';
import IntentScoreModal from '@/components/discovery/IntentScoreModal';
import LiveCallSimulatorModal from '@/components/voice/LiveCallSimulatorModal';
import { 
  Sparkles, 
  Users, 
  PhoneCall, 
  Search, 
  CheckCircle2, 
  ArrowUpRight, 
  Headphones, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

const FALLBACK_LEADS: LeadItem[] = [
  {
    id: 'lead-john-smith',
    name: 'John Smith',
    jobTitle: 'CTO',
    companyName: 'TechNova Solutions',
    companyWebsite: 'www.technova.com',
    industry: 'IT Services',
    companySize: '51 – 200 employees',
    email: 'john.smith@technova.com',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/john-smith-cloud',
    sourcePlatform: 'LinkedIn',
    originalPostUrl: 'https://www.linkedin.com/posts/john-smith-technova_sharepoint-m365-migration',
    originalPostSnippet: 'We are looking for a Microsoft 365 & SharePoint implementation partner to streamline our document management and workflow automation. Please DM if you can help! #Microsoft365 #SharePoint #Workflow #DigitalTransformation',
    intentScore: 94,
    budgetSignal: 'High',
    urgencyLevel: 'High',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    discoveryDate: '08 May 2025'
  },
  {
    id: 'lead-priya-nair',
    name: 'Priya Nair',
    jobTitle: 'VP of Engineering',
    companyName: 'CloudTech Inc.',
    companyWebsite: 'www.cloudtech.io',
    industry: 'Software',
    companySize: '201 – 500 employees',
    email: 'priya.nair@cloudtech.io',
    emailVerified: true,
    phone: '+1 (555) 872-9012',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/priya-nair-crm',
    sourcePlatform: 'X (Twitter)',
    originalPostUrl: 'https://x.com/priyanair_tech/status/17892182739182',
    originalPostSnippet: 'Evaluating modern CRM migration and workflow tools to consolidate our sales pipeline. Who is doing great work here?',
    intentScore: 87,
    budgetSignal: 'Approved',
    urgencyLevel: 'Medium',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    discoveryDate: '07 May 2025'
  },
  {
    id: 'lead-marc-weber',
    name: 'Marc Weber',
    jobTitle: 'Head of Data Infrastructure',
    companyName: 'DataSystems GmbH',
    companyWebsite: 'www.datasystems.eu',
    industry: 'Consulting',
    companySize: '500+ employees',
    email: 'm.weber@datasystems.eu',
    emailVerified: true,
    phone: '+49 30 9182345',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/marc-weber-data',
    sourcePlatform: 'Company Websites',
    originalPostUrl: 'https://datasystems.eu/procurement/rfp-data-warehouse-2025',
    originalPostSnippet: 'Public RFP: Looking for certified data engineering partners for Snowflake and cloud data warehouse modernization.',
    intentScore: 82,
    budgetSignal: 'High',
    urgencyLevel: 'Medium',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    discoveryDate: '06 May 2025'
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState('All Sources');
  const [leads, setLeads] = useState<LeadItem[]>(FALLBACK_LEADS);
  const [selectedLead, setSelectedLead] = useState<LeadItem>(FALLBACK_LEADS[0]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Fetch initial leads and stats
  const loadInitialData = useCallback(async () => {
    try {
      const [leadsRes, statsRes] = await Promise.allSettled([
        fetch('/api/leads'),
        fetch('/api/stats')
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value.ok) {
        const data = await leadsRes.value.json();
        if (data.leads && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLead(data.leads[0]);
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle live autonomous lead discovery
  const handleSearch = async (query: string, platform: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, platform }),
      });

      const data = await res.json();
      if (data.success && data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setSelectedLead(data.leads[0]);
      }
    } catch (err) {
      console.error('Discovery search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCallModalForLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsCallModalOpen(true);
  };

  const openScoreModalForLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsScoreModalOpen(true);
  };

  return (
    <div className="min-h-screen text-slate-100 p-3 sm:p-5 lg:p-6 max-w-[1720px] mx-auto">
      {/* Top Banner Header */}
      <HeaderBanner />

      {/* Main Two-Column Layout (Sidebar + Content Workspace) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          voiceMinutesUsed={12450}
          voiceMinutesLimit={20000}
        />

        {/* Center/Right Dynamic Body */}
        <main className="flex-1 w-full min-w-0">
          {/* Top Level Overview KPIs */}
          <OverviewKpis stats={stats} />

          {/* Tab: Dashboard or Lead Discovery */}
          {(activeTab === 'dashboard' || activeTab === 'lead-discovery') && (
            <div className="space-y-6">
              {/* Discovery Search & Platform Filters */}
              <DiscoverySearch
                onSearch={handleSearch}
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                loading={loading}
              />

              {/* Main Workspace: 3-column arrangement */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left/Center Section: Discovered Lead Card & Analytics (8 cols) */}
                <div className="xl:col-span-8 space-y-6">
                  {/* Lead Opportunity Details Card */}
                  {selectedLead && (
                    <DiscoveredLeadCard
                      lead={selectedLead}
                      onOpenCallModal={openCallModalForLead}
                      onOpenScoreModal={openScoreModalForLead}
                    />
                  )}

                  {/* Discovered Opportunities Grid */}
                  <div className="glass-card p-5 border-white/[0.06] shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-bold text-white">Discovered Leads Pipeline</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                          {leads.length} Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Click lead to preview opportunity</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {leads.map((l) => {
                        const isCurrent = l.id === selectedLead?.id;
                        return (
                          <div
                            key={l.id}
                            onClick={() => setSelectedLead(l)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/40'
                                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="truncate">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                  {l.name}
                                  {l.emailVerified && (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {l.jobTitle} • {l.companyName}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                  l.intentScore >= 90
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {l.intentScore} Intent
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 line-clamp-2 bg-white/[0.02] p-2 rounded-lg mb-2.5">
                              &quot;{l.originalPostSnippet}&quot;
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.04]">
                              <span className="text-slate-400">{l.sourcePlatform}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCallModalForLead(l);
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1 transition-all"
                              >
                                <Headphones className="w-3 h-3" /> Call
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campaign Performance Multi-Line Chart */}
                  <CampaignPerformanceChart />

                  {/* Donut Distribution Charts */}
                  <DonutCharts />
                </div>

                {/* Right Rail: Voice Activity & Mobile App Demo (4 cols) */}
                <div className="xl:col-span-4 space-y-6">
                  {/* AI Voice Agent Activity Rail */}
                  <VoiceActivityRail onViewAll={() => setActiveTab('conversations')} />

                  {/* Mobile App Device Showcase Mockup */}
                  <div className="glass-card p-5 border-white/[0.06] shadow-xl text-center">
                    <div className="text-xs font-bold text-white mb-1 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Mobile Sales Executive App
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">
                      Real-time push alerts, call listen-in &amp; CRM sync on iOS &amp; Android.
                    </p>
                    <MobileAppMockup />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Leads */}
          {activeTab === 'leads' && (
            <div className="glass-card p-6 border-white/[0.06] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">All Enriched Leads</h2>
                  <p className="text-xs text-slate-400">Manage all identified leads and qualification statuses</p>
                </div>
                <button
                  onClick={loadInitialData}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Leads
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase bg-white/[0.03] text-slate-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Intent</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div>{lead.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{lead.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>{lead.companyName}</div>
                          <div className="text-[10px] text-slate-400">{lead.jobTitle}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {lead.intentScore} / 100
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{lead.sourcePlatform}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openCallModalForLead(lead)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm"
                          >
                            Call with AI
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: AI Voice Agent */}
          {activeTab === 'ai-voice-agent' && (
            <div className="space-y-6">
              <div className="glass-card p-6 border-white/[0.06] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-indigo-400" />
                      Multilingual AI Voice Calling Agent
                    </h2>
                    <p className="text-xs text-slate-400">
                      Sub-150ms voice conversational qualification, objection handling, and real-time meeting scheduling.
                    </p>
                  </div>
                  <button
                    onClick={() => openCallModalForLead(selectedLead)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" /> Test Live Call Simulator
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-xs text-slate-400 mb-1">AI Voice Persona</div>
                    <div className="text-sm font-bold text-white">Ava (Enterprise Tech Executive)</div>
                    <div className="text-[11px] text-emerald-400 mt-1">✓ Active &amp; Calibrated</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-xs text-slate-400 mb-1">Inference Latency</div>
                    <div className="text-sm font-bold text-white">&lt; 150 ms (Groq Llama 3.3)</div>
                    <div className="text-[11px] text-blue-400 mt-1">Ultra-low latency streaming</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-xs text-slate-400 mb-1">Languages Supported</div>
                    <div className="text-sm font-bold text-white">English, Hindi, Spanish, Arabic + 20 more</div>
                    <div className="text-[11px] text-purple-400 mt-1">Autonomous language detection</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-6">
                  <VoiceActivityRail onViewAll={() => {}} />
                </div>
                <div className="xl:col-span-6">
                  <CampaignPerformanceChart />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Analytics or other tabs */}
          {(activeTab === 'analytics' || activeTab === 'campaigns' || activeTab === 'conversations' || activeTab === 'market-intelligence' || activeTab === 'integrations' || activeTab === 'billing' || activeTab === 'settings') && (
            <div className="glass-card p-6 border-white/[0.06] shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-xs text-slate-400">Autonomous sales operations telemetry and management</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>

              <CampaignPerformanceChart />
              <DonutCharts />
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <IntentScoreModal
        lead={selectedLead}
        pipeline={leads}
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onSelectLead={(l) => setSelectedLead(l)}
      />

      <LiveCallSimulatorModal
        lead={selectedLead}
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onMeetingBookedSuccess={() => {
          loadInitialData();
        }}
      />
    </div>
  );
}
