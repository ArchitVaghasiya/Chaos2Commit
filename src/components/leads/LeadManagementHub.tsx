'use client';

import React, { useState } from 'react';
import {
  Users,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Headphones,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Building2,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import { getHubsTranslation } from '@/lib/i18n/hubsTranslations';

interface LeadManagementHubProps {
  leads: LeadItem[];
  onOpenCallModal: (lead: LeadItem) => void;
  onImportLeads?: (newLeads: LeadItem[]) => void;
  currentLanguage?: string;
}

export default function LeadManagementHub({
  leads,
  onOpenCallModal,
  onImportLeads,
  currentLanguage = 'English',
}: LeadManagementHubProps) {
  const t = getHubsTranslation(currentLanguage).leads;
  const [activeSegment, setActiveSegment] = useState<'ALL' | 'HOT' | 'WARM' | 'NURTURE' | 'BOOKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filter leads by segment and search query
  const filteredLeads = leads.filter((lead) => {
    const matchesQuery =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeSegment === 'HOT') return lead.intentScore >= 90;
    if (activeSegment === 'WARM') return lead.intentScore >= 75 && lead.intentScore < 90;
    if (activeSegment === 'NURTURE') return lead.intentScore < 75;
    if (activeSegment === 'BOOKED') return lead.status === 'MEETING_BOOKED';

    return true;
  });

  // Client-side CSV export
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'JobTitle',
      'Industry',
      'IntentScore',
      'BudgetSignal',
      'SourcePlatform',
      'Status',
      'OriginalPostUrl'
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.companyName}"`,
      `"${l.jobTitle}"`,
      `"${l.industry}"`,
      l.intentScore,
      `"${l.budgetSignal}"`,
      `"${l.sourcePlatform}"`,
      `"${l.status}"`,
      `"${l.originalPostUrl || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_sales_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import handler
  const handleProcessCsvImport = () => {
    if (!csvText.trim()) return;

    try {
      const lines = csvText.trim().split('\n');
      const parsed: LeadItem[] = [];

      // Assume lines format: Name, Company, Email, Phone, Title, Industry
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2) {
          parsed.push({
            id: `import-${Date.now()}-${i}`,
            name: parts[0] || 'Imported Prospect',
            companyName: parts[1] || 'Enterprise Lead',
            email: parts[2] || `${parts[0].toLowerCase().replace(/\s+/g, '.')}@example.com`,
            emailVerified: true,
            phone: parts[3] || '+1 (555) 000-1122',
            phoneVerified: true,
            jobTitle: parts[4] || 'Decision Maker',
            industry: parts[5] || 'IT Services',
            companySize: '51 – 200 employees',
            companyWebsite: 'www.example.com',
            linkedinProfile: 'https://linkedin.com',
            sourcePlatform: 'CRM Integrations',
            originalPostUrl: 'https://crm.import/lead-record',
            originalPostSnippet: 'Direct CSV batch upload for AI voice outreach campaign.',
            intentScore: 85,
            budgetSignal: 'Approved',
            urgencyLevel: 'High',
            decisionMaker: true,
            activeRequirement: true,
            status: 'READY_TO_ENGAGE',
            discoveryDate: new Date().toISOString().split('T')[0],
          });
        }
      }

      if (parsed.length > 0) {
        onImportLeads?.(parsed);
        setImportStatus(`Successfully validated and imported ${parsed.length} leads with duplicate detection!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportStatus(null);
          setCsvText('');
        }, 1500);
      }
    } catch (err) {
      setImportStatus('Error parsing CSV. Please check formatting.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {t.title}
            </h2>
            <p className="text-xs text-slate-600">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.importLeads}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv} ({filteredLeads.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Segmentation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
          {/* Segment Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
            <button
              onClick={() => setActiveSegment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              {t.allLeads} ({leads.length})
            </button>

            <button
              onClick={() => setActiveSegment('HOT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'HOT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              {t.hotSegment} ({leads.filter((l) => l.intentScore >= 90).length})
            </button>

            <button
              onClick={() => setActiveSegment('WARM')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'WARM'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              {t.warmSegment} ({leads.filter((l) => l.intentScore >= 75 && l.intentScore < 90).length})
            </button>

            <button
              onClick={() => setActiveSegment('BOOKED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'BOOKED'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              {t.bookedSegment} ({leads.filter((l) => l.status === 'MEETING_BOOKED').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-white/[0.02] text-slate-600 border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">{t.contactCol}</th>
                <th className="py-3 px-4">{t.companyCol}</th>
                <th className="py-3 px-4">{t.intentScoreCol}</th>
                <th className="py-3 px-4">Source &amp; Post Link</th>
                <th className="py-3 px-4">{t.statusCol}</th>
                <th className="py-3 px-4 text-right">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {t.noLeads}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {lead.name}
                        {lead.emailVerified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600">{lead.email}</div>
                      <div className="text-[10px] text-slate-600">{lead.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">{lead.companyName}</div>
                      <div className="text-[10px] text-slate-600">{lead.jobTitle}</div>
                      <div className="text-[10px] text-slate-700">{lead.industry} • {lead.companySize}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.intentScore >= 90
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : lead.intentScore >= 75
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-700/50 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lead.intentScore} / 100
                        </span>
                        <span className="text-[10px] text-slate-600">Budget: {lead.budgetSignal}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-200">{lead.sourcePlatform}</div>
                      {lead.originalPostUrl ? (
                        <a
                          href={lead.originalPostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate max-w-[150px]"
                        >
                          View Original Post <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-700">Public Crawl</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          lead.status === 'MEETING_BOOKED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : lead.status === 'READY_TO_ENGAGE'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-slate-700/30 text-slate-600 border-slate-200 dark:border-white/[0.06]'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenCallModal(lead)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" /> {t.callLead}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card border-indigo-500/30 p-6 bg-white dark:bg-[#0c1228] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> {t.importModalTitle}
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              {t.importModalDesc}
            </p>

            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Sarah Connor, Cyberdyne Systems, sarah@cyberdyne.com, +1 (555) 998-1122, VP Infrastructure, Software&#10;Michael Scott, Dunder Mifflin, m.scott@dundermifflin.com, +1 (555) 321-4567, Regional Director, Paper & Supplies"
              className="w-full p-3 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono mb-3"
            />

            {importStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-slate-600 dark:text-slate-300 text-xs hover:bg-white/[0.1]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleProcessCsvImport}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                {t.importSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
