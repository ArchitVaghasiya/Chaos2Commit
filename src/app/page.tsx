'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBanner from '@/components/layout/HeaderBanner';
import Sidebar from '@/components/layout/Sidebar';
import OverviewKpis from '@/components/dashboard/OverviewKpis';
import DiscoverySearch, { DiscoverySearchParams } from '@/components/discovery/DiscoverySearch';
import DiscoveredLeadCard, { LeadItem } from '@/components/discovery/DiscoveredLeadCard';
import BlurText from '@/components/ui/BlurText';

import CampaignPerformanceChart from '@/components/dashboard/CampaignPerformanceChart';
import DonutCharts from '@/components/dashboard/DonutCharts';
import VoiceActivityRail from '@/components/dashboard/VoiceActivityRail';
import MobileDashboard from '@/components/dashboard/MobileDashboard';

import CapabilitiesFooter from '@/components/layout/CapabilitiesFooter';
import IntentScoreModal from '@/components/discovery/IntentScoreModal';
import LiveCallSimulatorModal from '@/components/voice/LiveCallSimulatorModal';
import UpdateProfileModal from '@/components/profile/UpdateProfileModal';

// Dedicated Hubs for all 11 Core Modules
import CampaignsHub from '@/components/campaigns/CampaignsHub';
import LeadManagementHub from '@/components/leads/LeadManagementHub';
import MarketIntelligenceHub from '@/components/intelligence/MarketIntelligenceHub';
import ConversationsHub from '@/components/conversations/ConversationsHub';
import IntegrationsHub from '@/components/integrations/IntegrationsHub';
import BillingHub from '@/components/billing/BillingHub';
import SettingsOnboardingHub from '@/components/settings/SettingsOnboardingHub';
import AdminAuditHub from '@/components/admin/AdminAuditHub';

import { 
  Sparkles, 
  Users, 
  PhoneCall, 
  Search, 
  CheckCircle2, 
  Headphones, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const INITIAL_FALLBACK_LEADS: LeadItem[] = [
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
  },
  {
    id: 'lead-ana-lopez',
    name: 'Ana Lopez',
    jobTitle: 'Director of IT Systems',
    companyName: 'Brightpath Health',
    companyWebsite: 'www.brightpath.com',
    industry: 'Healthcare',
    companySize: '51 – 200 employees',
    email: 'ana.lopez@brightpath.com',
    emailVerified: true,
    phone: '+1 (555) 432-8765',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/ana-lopez-brightpath',
    sourcePlatform: 'Directories',
    originalPostUrl: 'https://directories.techprocure.org/notices/10293',
    originalPostSnippet: 'Seeking automation audit consultants for HIPAA-compliant clinical workflows.',
    intentScore: 78,
    budgetSignal: 'Approved',
    urgencyLevel: 'High',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    discoveryDate: '05 May 2025'
  }
];

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileUpdated = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('chaos2commit_user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const saved = localStorage.getItem('chaos2commit_user');
    if (!saved) {
      router.replace('/sign-in');
    } else {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setCurrentUser(parsed);
          setIsAuthChecking(false);
        } else {
          router.replace('/sign-in');
        }
      } catch {
        router.replace('/sign-in');
      }
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('chaos2commit_user');
    router.replace('/sign-in');
  };

  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState('All Sources');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedLocation, setSelectedLocation] = useState('Global');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 7 Days');
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_FALLBACK_LEADS);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(INITIAL_FALLBACK_LEADS[0]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchEmptyMessage, setSearchEmptyMessage] = useState<string | null>(null);

  // Live in-memory filtered leads based on selectedPlatform & active filters (0 network requests)
  const visibleLeads = useMemo(() => {
    return leads.filter((l) => {
      // Filter by platform
      if (selectedPlatform && selectedPlatform !== 'All Sources') {
        const pNorm = selectedPlatform.toLowerCase();
        const leadPNorm = (l.sourcePlatform || '').toLowerCase();
        if (pNorm.includes('twitter') || pNorm.includes('x')) {
          if (!leadPNorm.includes('twitter') && !leadPNorm.includes('x')) return false;
        } else if (!leadPNorm.includes(pNorm)) {
          return false;
        }
      }

      // Filter by industry
      if (selectedIndustry && selectedIndustry !== 'All Industries') {
        if (l.industry && !l.industry.toLowerCase().includes(selectedIndustry.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [leads, selectedPlatform, selectedIndustry]);

  // Keep selectedLead in sync with the filtered view
  useEffect(() => {
    if (visibleLeads.length > 0) {
      if (!selectedLead || !visibleLeads.some((l) => l.id === selectedLead.id)) {
        setSelectedLead(visibleLeads[0]);
      }
    } else if (leads.length > 0) {
      setSelectedLead(null);
    }
  }, [visibleLeads, selectedLead, leads.length]);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Initial data load
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
          setSelectedLead((prev) => {
            if (!prev) return data.leads[0];
            const matching = data.leads.find((l: LeadItem) => l.id === prev.id);
            return matching || data.leads[0];
          });
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Initial load error:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Lead Discovery search - triggered ONLY on explicit Search button click
  const handleSearch = async (params: DiscoverySearchParams) => {
    const trimmed = (params.keyword || '').trim();

    // If user searched nothing, show nothing! ("if i search nothing so it shouldn't show anything")
    if (!trimmed) {
      setLeads([]);
      setSelectedLead(null);
      setHasSearched(true);
      setSearchEmptyMessage('Please enter a keyword, industry, or requirement to search for opportunities.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSearchEmptyMessage(null);

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          platform: params.platform,
          industry: params.industry,
          location: params.location,
        }),
      });

      const data = await res.json();
      if (data.success && data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setSelectedLead(data.leads[0]);
        setSearchEmptyMessage(null);
      } else {
        setLeads([]);
        setSelectedLead(null);
        setSearchEmptyMessage(
          `No public requirement posts found matching "${trimmed}" on ${params.platform}. Try a different keyword.`
        );
      }
    } catch (err) {
      console.error('Discovery search error:', err);
      setLeads([]);
      setSelectedLead(null);
      setSearchEmptyMessage('Search request failed. Please try again.');
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

  const handleImportLeads = (newLeads: LeadItem[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    setSelectedLead(newLeads[0]);
  };

  if (isAuthChecking) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090d20] text-white">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 mb-5 animate-pulse">
          <img src="/ai_sales_logo.jpg" alt="Loading" className="w-full h-full object-cover scale-[2.2]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090d20] text-white overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/30 mb-8 relative">
            <img src="/ai_sales_logo.jpg" alt="AI Sales Logo" className="w-full h-full object-cover scale-[2.5]" />
          </div>
          
          <div className="mb-2">
            <BlurText
              text="AI Sales Agent Platform"
              delay={100}
              animateBy="words"
              direction="bottom"
              className="text-4xl font-extrabold tracking-tight text-white mb-2"
            />
          </div>
          
          <div className="mb-12">
            <BlurText
              text="Discover. Qualify. Engage. Convert."
              delay={150}
              animateBy="words"
              direction="top"
              className="text-slate-400 font-medium tracking-wide"
            />
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-indigo-400/80 uppercase tracking-widest font-semibold animate-pulse">
              Initializing AI Engine...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden">
        <MobileDashboard />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex min-h-screen text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 max-w-[1720px] mx-auto flex-col justify-between">
        <div>
          <HeaderBanner
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onOpenCsvImport={() => setActiveTab('leads')}
          onOpenNewCampaign={() => setActiveTab('campaigns')}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Two-Column Layout (Sidebar + Content Workspace) */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            voiceMinutesUsed={12450}
            voiceMinutesLimit={20000}
            currentLanguage={currentLanguage}
            currentUser={currentUser}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />

          {/* Center/Right Dynamic Body */}
          <main className="flex-1 w-full min-w-0">
            {/* 1. Dashboard Tab (Matching master PNG pixel-for-pixel) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Top Level Overview KPIs */}
                <OverviewKpis stats={stats} currentLanguage={currentLanguage} />

                {/* Main Workspace 12-column grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Center-Left Section: Discovery Search, Discovered Lead Card, How It Works, and Charts (8 cols) */}
                  <div className="xl:col-span-8 space-y-6">
                    {/* Discovery Search & Platform Pills */}
                    <DiscoverySearch
                      currentLanguage={currentLanguage}
                      onSearch={handleSearch}
                      selectedPlatform={selectedPlatform}
                      setSelectedPlatform={setSelectedPlatform}
                      industry={selectedIndustry}
                      setIndustry={setSelectedIndustry}
                      location={selectedLocation}
                      setLocation={setSelectedLocation}
                      dateRange={selectedDateRange}
                      setDateRange={setSelectedDateRange}
                      loading={loading}
                    />

                    {/* Sample Discovered Lead Card or Empty State */}
                    {selectedLead ? (
                      <DiscoveredLeadCard
                        currentLanguage={currentLanguage}
                        lead={selectedLead}
                        onOpenCallModal={openCallModalForLead}
                        onOpenScoreModal={openScoreModalForLead}
                      />
                    ) : (
                      <div className="glass-card p-6 mb-6 border-white/[0.06] text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                          <Search className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">
                          {hasSearched
                            ? 'No Discovered Opportunities'
                            : visibleLeads.length === 0 && leads.length > 0
                            ? 'No Leads Matching Active Filter'
                            : 'Ready to Discover Leads'}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md">
                          {searchEmptyMessage ||
                            (visibleLeads.length === 0 && leads.length > 0
                              ? `No loaded leads currently match ${selectedPlatform}${selectedIndustry !== 'All Industries' ? ` • ${selectedIndustry}` : ''}. Click "Search" to let AI crawl live feeds, or reset your filters.`
                              : 'Enter search keywords above and click Search to let the AI identify and qualify high-intent opportunities.')}
                        </p>
                      </div>
                    )}


                    {/* Campaign Performance Multi-Line Trend Chart */}
                    <CampaignPerformanceChart currentLanguage={currentLanguage} />

                  </div>

                  {/* Right Rail: Voice Activity Rail & Mobile Mockup (4 cols) */}
                  <div className="xl:col-span-4 space-y-6">
                    {/* AI Voice Agent Activity Rail */}
                    <VoiceActivityRail onViewAll={() => setActiveTab('conversations')} />
                    
                    {/* Two Donut Charts (Top Industries & Lead Source Distribution) */}
                    <DonutCharts />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Lead Discovery Tab */}
            {activeTab === 'lead-discovery' && (
              <div className="space-y-6">
                <DiscoverySearch
                  currentLanguage={currentLanguage}
                  onSearch={handleSearch}
                  selectedPlatform={selectedPlatform}
                  setSelectedPlatform={setSelectedPlatform}
                  industry={selectedIndustry}
                  setIndustry={setSelectedIndustry}
                  location={selectedLocation}
                  setLocation={setSelectedLocation}
                  dateRange={selectedDateRange}
                  setDateRange={setSelectedDateRange}
                  loading={loading}
                />

                {selectedLead ? (
                  <DiscoveredLeadCard
                    currentLanguage={currentLanguage}
                    lead={selectedLead}
                    onOpenCallModal={openCallModalForLead}
                    onOpenScoreModal={openScoreModalForLead}
                  />
                ) : (
                  <div className="glass-card p-6 mb-6 border-white/[0.06] text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {hasSearched
                        ? 'No Discovered Opportunities'
                        : visibleLeads.length === 0 && leads.length > 0
                        ? 'No Leads Matching Active Filter'
                        : 'Ready to Discover Leads'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md">
                      {searchEmptyMessage ||
                        (visibleLeads.length === 0 && leads.length > 0
                          ? `No loaded leads currently match ${selectedPlatform}${selectedIndustry !== 'All Industries' ? ` • ${selectedIndustry}` : ''}. Click "Search" to let AI crawl live feeds, or reset your filters.`
                          : 'Enter search keywords above and click Search to let the AI identify and qualify high-intent opportunities.')}
                    </p>
                  </div>
                )}

                {/* Discovered Opportunities Grid */}
                <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Discovered Leads Pipeline</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold">
                        {leads.length} Available
                      </span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-400">Click lead to preview opportunity</span>
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
                              : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-slate-200 dark:border-white/[0.1]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                {l.name}
                                {l.emailVerified && (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-700 dark:text-slate-400 truncate">
                                {l.jobTitle} • {l.companyName}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                l.intentScore >= 90
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {l.intentScore} Intent
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-800 dark:text-slate-300 line-clamp-2 bg-slate-100 dark:bg-white/[0.02] p-2 rounded-lg mb-2.5">
                            &quot;{l.originalPostSnippet}&quot;
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/[0.04]">
                            <span className="text-slate-800 dark:text-slate-400">{l.sourcePlatform}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCallModalForLead(l);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Headphones className="w-3 h-3" /> Call
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Leads Management Tab (CSV Import, Export, Deduplication, Segmentation) */}
            {activeTab === 'leads' && (
              <LeadManagementHub
                leads={leads}
                onOpenCallModal={openCallModalForLead}
                onImportLeads={handleImportLeads}
                currentLanguage={currentLanguage}
              />
            )}

            {/* 4. Campaigns Management Tab (Video Slide 6 Lead Volume Chart & Controls) */}
            {activeTab === 'campaigns' && <CampaignsHub currentLanguage={currentLanguage} />}

            {/* 5. AI Voice Agent Hub */}
            {activeTab === 'ai-voice-agent' && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5" /> Conversational Telephony
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        Multilingual AI Voice Calling Agent (Groq Llama 3.3 + Gemini)
                      </h2>
                      <p className="text-xs text-slate-800 dark:text-slate-400">
                        Sub-150ms voice conversational qualification, objection handling, voicemail detection, and calendar demo scheduling.
                      </p>
                    </div>

                    <button
                      onClick={() => selectedLead && openCallModalForLead(selectedLead)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" /> Launch Live Voice Call
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                      <div className="text-slate-700 dark:text-slate-400 mb-1">AI Voice Persona</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Ava (Enterprise Solutions Lead)</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">✓ Active &amp; Calibrated</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                      <div className="text-slate-700 dark:text-slate-400 mb-1">Inference Latency</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">&lt; 150 ms (Groq Hardware)</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Ultra-low latency streaming</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                      <div className="text-slate-700 dark:text-slate-400 mb-1">Languages Supported</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">English, Hindi, Spanish, Arabic, French, German</div>
                      <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Autonomous language detection</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-6">
                    <VoiceActivityRail onViewAll={() => setActiveTab('conversations')} />
                  </div>
                  <div className="xl:col-span-6">
                    <CampaignPerformanceChart currentLanguage={currentLanguage} />
                  </div>
                </div>
              </div>
            )}

            {/* 6. Conversations & Transcripts Tab */}
            {activeTab === 'conversations' && <ConversationsHub />}

            {/* 7. Analytics Hub */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <OverviewKpis stats={stats} currentLanguage={currentLanguage} />
                <CampaignPerformanceChart currentLanguage={currentLanguage} />
                <DonutCharts />
              </div>
            )}

            {/* 8. Market Intelligence Hub (PDF Page 1 & Video Slide 4) */}
            {activeTab === 'market-intelligence' && <MarketIntelligenceHub />}

            {/* 9. Integrations Hub (CRM, Calendar, WhatsApp, Telephony) */}
            {activeTab === 'integrations' && <IntegrationsHub />}

            {/* 10. Billing & Plans Hub (Starter, Growth & Enterprise) */}
            {activeTab === 'billing' && <BillingHub currentLanguage={currentLanguage} />}

            {/* 11. Settings & Onboarding Hub (PDF Page 3 User Journey Steps 1–6) */}
            {activeTab === 'settings' && <SettingsOnboardingHub />}

            {/* 12. Admin & Audit Logs (PDF Page 2) */}
            {activeTab === 'admin' && <AdminAuditHub />}
          </main>
        </div>
      </div>

      {/* Master 6-Pillar Capabilities Footer (from PNG) */}
      <CapabilitiesFooter />
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
        defaultLanguage={currentLanguage}
        lead={selectedLead}
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onMeetingBookedSuccess={() => {
          if (selectedLead) {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === selectedLead.id ? { ...l, status: 'MEETING_BOOKED' } : l
              )
            );
          }
          fetch('/api/stats')
            .then((r) => r.json())
            .then((d) => d.stats && setStats(d.stats))
            .catch(() => {});
        }}
      />

      {/* Update Profile Details Modal */}
      <UpdateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
