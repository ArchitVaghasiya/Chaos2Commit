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
import DeviceModeSwitcher from '@/components/dashboard/DeviceModeSwitcher';
import UspInnovationBanner from '@/components/dashboard/UspInnovationBanner';
import GlobalCommandPalette from '@/components/ui/GlobalCommandPalette';
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal';
import FloatingAudioCallHUD from '@/components/voice/FloatingAudioCallHUD';
import { useToast } from '@/components/ui/ToastProvider';

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
  ArrowRight,
  LayoutDashboard,
  Megaphone
} from 'lucide-react';

import { SEED_LEADS_CATALOG } from '@/lib/ai/lead-discovery-engine';

const INITIAL_FALLBACK_LEADS: LeadItem[] = (SEED_LEADS_CATALOG as any[]).map(l => ({
  ...l,
  id: l.id || `lead-${l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  emailVerified: l.emailVerified ?? true,
  phoneVerified: l.phoneVerified ?? true,
  status: l.status || 'READY_TO_ENGAGE',
  discoveryDate: l.discoveryDate || '08 May 2025'
})) as LeadItem[];

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

  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mobilePlatform, setMobilePlatform] = useState<'android' | 'ios'>('ios');
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
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isExampleMode, setIsExampleMode] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchEmptyMessage, setSearchEmptyMessage] = useState<string | null>(null);

  const { success, error: toastError, info, warning } = useToast();

  // Global Keyboard Shortcuts (⌘K for Command Palette, ? for Shortcuts Cheatsheet)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // '?' -> Shortcuts Modal (skip if typing in input/textarea/contenteditable)
      const target = e.target as HTMLElement;
      if (
        e.key === '?' &&
        target &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Escape -> close dialogs
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isShortcutsOpen]);

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
          const yashLead = data.leads.find((l: any) =>
            (l.phone && l.phone.includes('9737362307')) ||
            (l.companyName && l.companyName.toLowerCase().includes('gohel'))
          );
          if (yashLead) {
            setSelectedLead(yashLead);
          }
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
  }, [isExampleMode]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleResetToExample = () => {
    setLeads(INITIAL_FALLBACK_LEADS);
    setSelectedLead(INITIAL_FALLBACK_LEADS[0]);
    setIsExampleMode(true);
    setHasSearched(false);
    setSearchEmptyMessage(null);
  };

  // Lead Discovery search - triggered ONLY on explicit Search button click or 1-click quick query
  const handleSearch = async (params: DiscoverySearchParams) => {
    const trimmed = (params.keyword || '').trim();

    // If user searched nothing, show prompt
    if (!trimmed) {
      setLeads([]);
      setSelectedLead(null);
      setHasSearched(true);
      setIsExampleMode(false);
      setSearchEmptyMessage('Please enter a keyword, industry, or requirement to search for opportunities.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setIsExampleMode(false);
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
        success('Discovery Scan Completed', `Discovered ${data.leads.length} high-intent prospect requirements.`);
      } else {
        setLeads([]);
        setSelectedLead(null);
        setSearchEmptyMessage(
          `No public requirement posts found matching "${trimmed}" on ${params.platform}. Try a different keyword.`
        );
        warning('No Opportunities Found', `Zero public requirements found for "${trimmed}". Try broad keywords.`);
      }
    } catch (err) {
      console.error('Discovery search error:', err);
      setLeads([]);
      setSelectedLead(null);
      setSearchEmptyMessage('Search request failed. Please try again.');
      toastError('Discovery Failed', 'Network error searching opportunities. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const openCallModalForLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsCallMinimized(false);
    setIsCallModalOpen(true);
    info('Live Carrier Call', `Dispatching direct physical call to ${lead.phone || '+91 9737362307'}...`);
  };

  const openScoreModalForLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsScoreModalOpen(true);
  };

  const handleImportLeads = (newLeads: LeadItem[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    setSelectedLead(newLeads[0]);
    success('Leads Imported', `Successfully added ${newLeads.length} leads to your pipeline.`);
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
      {/* Responsive Platform Container */}
      <div className="min-h-screen text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 max-w-[1720px] mx-auto flex flex-col justify-between pb-20 lg:pb-6">
        <div>
          <HeaderBanner
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onOpenCsvImport={() => setActiveTab('leads')}
            onOpenNewCampaign={() => setActiveTab('campaigns')}
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Top Control Bar: Device Mode Switcher + Live Engine Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Experience View:
              </span>
              <DeviceModeSwitcher
                deviceMode={deviceMode}
                setDeviceMode={setDeviceMode}
                mobilePlatform={mobilePlatform}
                setMobilePlatform={setMobilePlatform}
              />
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">Chaos2Commit v2.4 Live Engine</span>
            </div>
          </div>

          {/* USP & Innovation Banner */}
          <UspInnovationBanner />

          {deviceMode === 'mobile' ? (
            <div className="flex flex-col items-center justify-center py-6 mb-12 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {mobilePlatform === 'ios' ? ' iOS Interactive App Shell' : '🤖 Android Interactive App Shell'}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Demonstrating full mobile client responsiveness, touch navigation, and live calling on {mobilePlatform === 'ios' ? 'iOS (iPhone 16 Pro)' : 'Android (Pixel 9 Pro)'}.
                </p>
              </div>

              {/* Realistic Smartphone Chassis */}
              <div className={`w-[410px] h-[840px] rounded-[52px] p-3 shadow-2xl relative border-4 transition-all duration-300 ${
                mobilePlatform === 'ios'
                  ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-slate-600 shadow-indigo-500/20'
                  : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-zinc-700 shadow-emerald-500/20'
              }`}>
                {/* Screen Bezel */}
                <div className="w-full h-full rounded-[42px] overflow-hidden bg-slate-950 relative border border-white/10 flex flex-col shadow-inner">
                  {/* Status Bar / Dynamic Island or Punch Hole */}
                  <div className="h-10 w-full flex items-center justify-between px-6 pt-2 select-none relative z-30 bg-slate-950/80 backdrop-blur-sm">
                    <span className="text-xs font-bold text-white">9:41</span>
                    {mobilePlatform === 'ios' ? (
                      <div className="w-24 h-5 bg-black rounded-full border border-white/10 flex items-center justify-center gap-1.5 px-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-white/70 font-mono">Live Call</span>
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20" />
                    )}
                    <div className="flex items-center gap-1.5 text-white/80 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 rounded-sm border border-white/60 flex items-center p-0.5">
                        <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Inner Screen Content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <MobileDashboard />
                  </div>

                  {/* Bottom Navigation / Home Bar */}
                  <div className="h-6 w-full flex items-center justify-center bg-slate-950/80 pb-1">
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Main Two-Column Layout (Sidebar + Content Workspace) */
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Desktop Navigation Sidebar */}
              <div className="hidden lg:block shrink-0">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  voiceMinutesUsed={12450}
                  voiceMinutesLimit={20000}
                  currentLanguage={currentLanguage}
                  currentUser={currentUser}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onOpenShortcuts={() => setIsShortcutsOpen(true)}
                />
              </div>

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
                      onResetToExample={handleResetToExample}
                      isExampleMode={isExampleMode}
                    />

                    {/* Sample Discovered Lead Card or Empty State */}
                    {selectedLead ? (
                      <DiscoveredLeadCard
                        currentLanguage={currentLanguage}
                        lead={selectedLead}
                        onOpenCallModal={openCallModalForLead}
                        onOpenScoreModal={openScoreModalForLead}
                        isExampleMode={isExampleMode}
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
                  onResetToExample={handleResetToExample}
                  isExampleMode={isExampleMode}
                />

                {selectedLead ? (
                  <DiscoveredLeadCard
                    currentLanguage={currentLanguage}
                    lead={selectedLead}
                    onOpenCallModal={openCallModalForLead}
                    onOpenScoreModal={openScoreModalForLead}
                    isExampleMode={isExampleMode}
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
                              : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/20'
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
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
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
      )}
      </div>

      {/* Master 6-Pillar Capabilities Footer (from PNG) */}
      <CapabilitiesFooter />
      </div>

      {/* Mobile Floating Bottom Quick Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070b1a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.08] px-3 py-2 flex items-center justify-around shadow-2xl"
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'lead-discovery', label: 'Discovery', icon: Search },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'ai-voice-agent', label: 'Voice AI', icon: Headphones },
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Multitasking Voice Call HUD */}
      <FloatingAudioCallHUD
        isOpen={isCallMinimized && !!selectedLead}
        lead={selectedLead}
        defaultLanguage={currentLanguage}
        onExpand={() => {
          setIsCallMinimized(false);
          setIsCallModalOpen(true);
        }}
        onHangUp={() => {
          setIsCallMinimized(false);
          warning('Voice Call Terminated', `Active voice qualification session with ${selectedLead?.name || 'prospect'} was ended.`);
        }}
      />

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tabId: string) => {
          setActiveTab(tabId);
          info('Navigated', `Switched view to ${tabId.replace('-', ' ').toUpperCase()}`);
        }}
        leads={leads}
        onOpenCallModal={(lead: LeadItem) => {
          setSelectedLead(lead);
          setIsCallMinimized(false);
          setIsCallModalOpen(true);
          info('Voice Agent Initializing', `Outbound voice simulation starting for ${lead.name}...`);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

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
        onClose={() => {
          setIsCallModalOpen(false);
          setIsCallMinimized(false);
        }}
        onMinimize={() => {
          setIsCallModalOpen(false);
          setIsCallMinimized(true);
          info('Call Minimized', 'Audio session docked to floating widget. You can freely browse.');
        }}
        onMeetingBookedSuccess={() => {
          success('Meeting Booked! 📅', `Ava successfully secured a qualification demo with ${selectedLead?.name || 'prospect'}.`);
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

      {/* Floating Multitasking Audio Call HUD */}
      {isCallMinimized && selectedLead && (
        <FloatingAudioCallHUD
          isOpen={isCallMinimized}
          lead={selectedLead}
          defaultLanguage={currentLanguage}
          onExpand={() => {
            setIsCallMinimized(false);
            setIsCallModalOpen(true);
          }}
          onRestoreModal={() => {
            setIsCallMinimized(false);
            setIsCallModalOpen(true);
          }}
          onHangUp={() => {
            setIsCallMinimized(false);
            warning('Call Ended', `Active audio session with ${selectedLead?.name || 'prospect'} ended.`);
          }}
          onEndCall={() => {
            setIsCallMinimized(false);
            warning('Call Ended', `Active audio session with ${selectedLead?.name || 'prospect'} ended.`);
          }}
        />
      )}
      <UpdateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          handleProfileUpdated(updated);
          success('Profile Updated', 'Your profile details have been saved.');
        }}
      />
    </>
  );
}
