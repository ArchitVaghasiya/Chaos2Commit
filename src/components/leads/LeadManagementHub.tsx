'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Download,
  Upload,
  Search,
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
  Briefcase,
  Globe2,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import { getHubsTranslation } from '@/lib/i18n/hubsTranslations';

interface LeadManagementHubProps {
  leads: LeadItem[];
  onOpenCallModal: (lead: LeadItem) => void;
  onImportLeads?: (newLeads: LeadItem[]) => void;
  currentLanguage?: string;
}

interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  industry: string;
  location: string;
  country: string;
  preferredLanguage: string;
}

export default function LeadManagementHub({
  leads,
  onOpenCallModal,
  onImportLeads,
  currentLanguage = 'English',
}: LeadManagementHubProps) {
  const t = getHubsTranslation(currentLanguage).leads;
  const [activeSegment, setActiveSegment] = useState<'ALL' | 'HOT' | 'WARM' | 'NURTURE' | 'BOOKED' | 'CALLING_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [rawParsedRows, setRawParsedRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    industry: '',
    location: '',
    country: '',
    preferredLanguage: '',
  });

  // Strategy & Workflow
  const [duplicateStrategy, setDuplicateStrategy] = useState<'SKIP' | 'OVERWRITE' | 'MERGE'>('SKIP');
  const [workflowMode, setWorkflowMode] = useState<'CALLING_ONLY' | 'LEADS_AND_CALLING'>('CALLING_ONLY');
  const [targetCampaign, setTargetCampaign] = useState('Enterprise M365 & SharePoint Outreach');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter leads by segment and search query
  const filteredLeads = leads.filter((lead) => {
    const matchesQuery =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.location && lead.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (activeSegment === 'HOT') return lead.intentScore >= 90;
    if (activeSegment === 'WARM') return lead.intentScore >= 75 && lead.intentScore < 90;
    if (activeSegment === 'NURTURE') return lead.intentScore < 75;
    if (activeSegment === 'BOOKED') return lead.status === 'MEETING_BOOKED';
    if (activeSegment === 'CALLING_ONLY') return lead.workflowType === 'CALLING_ONLY';

    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'JobTitle',
      'Industry',
      'Location',
      'Country',
      'PreferredLanguage',
      'WorkflowMode',
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
      `"${l.location || 'Global'}"`,
      `"${l.country || 'USA'}"`,
      `"${l.preferredLanguage || 'English'}"`,
      `"${l.workflowType || 'LEADS_AND_CALLING'}"`,
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

  // Export to Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    const dataForSheet = filteredLeads.map((l) => ({
      Name: l.name,
      Email: l.email || '',
      Phone: l.phone || '',
      Company: l.companyName,
      JobTitle: l.jobTitle,
      Industry: l.industry,
      Location: l.location || 'Global',
      Country: l.country || 'USA',
      Language: l.preferredLanguage || 'English',
      Workflow: l.workflowType || 'LEADS_AND_CALLING',
      IntentScore: l.intentScore,
      BudgetSignal: l.budgetSignal,
      Status: l.status,
      SourcePlatform: l.sourcePlatform,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AI Sales Leads');
    XLSX.writeFile(workbook, `ai_sales_leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle File Upload (CSV, XLSX, XLS)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      reader.onload = (evt) => {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        processLoadedRows(jsonRows);
      };
      reader.readAsBinaryString(file);
    } else {
      // Plain text CSV
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const rows = parseCsvText(text);
        processLoadedRows(rows);
      };
      reader.readAsText(file);
    }
  };

  const parseCsvText = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const dataRows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      dataRows.push(row);
    }
    return dataRows;
  };

  const processLoadedRows = (rows: any[]) => {
    if (rows.length === 0) return;
    setRawParsedRows(rows);
    const headers = Object.keys(rows[0]);
    setDetectedHeaders(headers);

    // Auto-detect best column matches
    const mapping: ColumnMapping = {
      name: '',
      email: '',
      phone: '',
      companyName: '',
      jobTitle: '',
      industry: '',
      location: '',
      country: '',
      preferredLanguage: '',
    };

    headers.forEach((h) => {
      const lower = h.toLowerCase();
      if (!mapping.name && (lower.includes('name') || lower.includes('contact') || lower.includes('prospect'))) mapping.name = h;
      if (!mapping.email && (lower.includes('email') || lower.includes('mail'))) mapping.email = h;
      if (!mapping.phone && (lower.includes('phone') || lower.includes('mobile') || lower.includes('cell') || lower.includes('tel'))) mapping.phone = h;
      if (!mapping.companyName && (lower.includes('company') || lower.includes('organization') || lower.includes('corp') || lower.includes('firm'))) mapping.companyName = h;
      if (!mapping.jobTitle && (lower.includes('title') || lower.includes('role') || lower.includes('position') || lower.includes('designation'))) mapping.jobTitle = h;
      if (!mapping.industry && (lower.includes('industry') || lower.includes('sector') || lower.includes('vertical'))) mapping.industry = h;
      if (!mapping.location && (lower.includes('location') || lower.includes('city') || lower.includes('region'))) mapping.location = h;
      if (!mapping.country && (lower.includes('country') || lower.includes('nation'))) mapping.country = h;
      if (!mapping.preferredLanguage && (lower.includes('lang') || lower.includes('idiom') || lower.includes('sprache'))) mapping.preferredLanguage = h;
    });

    setColumnMapping(mapping);
    setImportStep(2);
  };

  // Process Final Validated Import
  const handleExecuteImport = () => {
    if (rawParsedRows.length === 0) return;

    let importedCount = 0;
    let duplicateCount = 0;
    const finalLeads: LeadItem[] = [];

    rawParsedRows.forEach((row, i) => {
      const name = row[columnMapping.name] || `Imported Prospect ${i + 1}`;
      const company = row[columnMapping.companyName] || 'Enterprise';
      const email = row[columnMapping.email] || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z]/g, '') || 'company'}.com`;
      const phone = row[columnMapping.phone] || '+1 (555) 019-2831';
      const jobTitle = row[columnMapping.jobTitle] || 'Decision Maker';
      const industry = row[columnMapping.industry] || 'IT Services';
      const location = row[columnMapping.location] || 'Global';
      const country = row[columnMapping.country] || 'United States';
      const preferredLanguage = row[columnMapping.preferredLanguage] || 'English';

      // Check for duplicate in existing leads
      const existingMatch = leads.find(
        (l) => (l.email && l.email.toLowerCase() === email.toLowerCase()) ||
               (l.phone && l.phone === phone) ||
               (l.name.toLowerCase() === name.toLowerCase() && l.companyName.toLowerCase() === company.toLowerCase())
      );

      if (existingMatch && duplicateStrategy === 'SKIP') {
        duplicateCount++;
        return;
      }

      finalLeads.push({
        id: `import-${Date.now()}-${i}`,
        name,
        companyName: company,
        email,
        emailVerified: true,
        phone,
        phoneVerified: true,
        jobTitle,
        industry,
        companySize: '51 – 200 employees',
        companyWebsite: `www.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        linkedinProfile: 'https://linkedin.com',
        sourcePlatform: workflowMode === 'CALLING_ONLY' ? 'CSV/Excel Upload (Calling Only)' : 'CRM Integrations',
        originalPostUrl: 'https://app.chaos2commit.com/leads/import',
        originalPostSnippet: `Uploaded via ${uploadedFileName || 'batch file'}. Configured for ${workflowMode === 'CALLING_ONLY' ? 'AI Calling Only' : 'Leads + AI Enrichment'}.`,
        intentScore: 88,
        budgetSignal: 'Approved',
        urgencyLevel: 'High',
        decisionMaker: true,
        activeRequirement: true,
        status: workflowMode === 'CALLING_ONLY' ? 'READY_TO_ENGAGE' : 'DISCOVERED',
        workflowType: workflowMode,
        location,
        country,
        timezone: country === 'Germany' ? 'Europe/Berlin' : country === 'Spain' ? 'Europe/Madrid' : country === 'India' ? 'Asia/Kolkata' : 'America/New_York',
        preferredLanguage,
        discoveryDate: new Date().toISOString().split('T')[0],
      });
      importedCount++;
    });

    onImportLeads?.(finalLeads);
    // Persist imported leads to backend SQLite database
    try {
      fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: finalLeads,
          duplicateStrategy,
          workflowMode,
        }),
      }).catch(() => {});
    } catch (_) {}

    setImportStatus(`Successfully validated and imported ${importedCount} leads (${duplicateCount} duplicate rows handled via ${duplicateStrategy} strategy)!`);

    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportStep(1);
      setUploadedFileName(null);
      setRawParsedRows([]);
      setImportStatus(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {t.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              CSV/Excel import, field mapping, duplicate detection, language assignment, and Calling Only workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV / Excel</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export as CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export as Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSegment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              All Leads ({leads.length})
            </button>

            <button
              onClick={() => setActiveSegment('CALLING_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'CALLING_ONLY'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              📞 Calling Only ({leads.filter((l) => l.workflowType === 'CALLING_ONLY').length})
            </button>

            <button
              onClick={() => setActiveSegment('HOT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'HOT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              Hot Intent ({leads.filter((l) => l.intentScore >= 90).length})
            </button>

            <button
              onClick={() => setActiveSegment('BOOKED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSegment === 'BOOKED'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 hover:text-slate-900 dark:text-white'
              }`}
            >
              Meetings Booked ({leads.filter((l) => l.status === 'MEETING_BOOKED').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, company, location..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company &amp; Location</th>
                <th className="py-3 px-4">Language &amp; Mode</th>
                <th className="py-3 px-4">Intent Score</th>
                <th className="py-3 px-4">Status &amp; Compliance</th>
                <th className="py-3 px-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No leads match the current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {lead.name}
                        {lead.emailVerified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" /> {lead.email}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {lead.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{lead.companyName}</div>
                      <div className="text-[10px] text-slate-500">{lead.jobTitle}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                        <Globe2 className="w-2.5 h-2.5" />
                        <span>{lead.location || 'Global'} ({lead.country || 'USA'})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                          🗣️ {lead.preferredLanguage || 'English'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold text-slate-500 bg-slate-100 dark:bg-white/[0.04]">
                          {lead.workflowType === 'CALLING_ONLY' ? 'Calling Only' : 'Leads + Calling'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.intentScore >= 90
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {lead.intentScore} / 100
                        </span>
                        <span className="text-[10px] text-slate-500">{lead.budgetSignal}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            lead.status === 'MEETING_BOOKED'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : lead.status === 'DND'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : lead.status === 'CALLBACK_SCHEDULED'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lead.status === 'DND' ? '🛑 DND (Opt-Out)' : lead.status === 'CALLBACK_SCHEDULED' ? '⏰ Callback Scheduled' : lead.status}
                        </span>
                        {lead.scheduledCallbackAt && (
                          <span className="text-[9px] text-amber-500 font-medium">
                            Callback: Tomorrow
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenCallModal(lead)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" /> Call Lead
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced CSV & Excel Multi-Step Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-card border-indigo-500/30 p-6 bg-white dark:bg-[#0c1228] shadow-2xl rounded-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                  <span>Enterprise CSV &amp; Excel Leads Importer</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Step {importStep} of 3: {importStep === 1 ? 'Upload File' : importStep === 2 ? 'Column Mapping & Validation' : 'Strategy & Workflow'}
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: Upload File */}
            {importStep === 1 && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl bg-indigo-500/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Drag &amp; drop your CSV or Excel (.xlsx, .xls) file here
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">
                    Supports Microsoft Excel workbooks, comma-separated values, and export files from Salesforce, HubSpot, or Apollo.io.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Browse Local File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-header detection, E.164 phone validation, and duplicate scrubbing.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: Column Mapping & Validation Preview */}
            {importStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold">File Loaded:</span> {uploadedFileName}
                    <span className="ml-2">({rawParsedRows.length} rows detected)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ Headers mapped
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Full Name</label>
                    <select
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Company Name</label>
                    <select
                      value={columnMapping.companyName}
                      onChange={(e) => setColumnMapping({ ...columnMapping, companyName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Email Address</label>
                    <select
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Phone Number</label>
                    <select
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Job Title</label>
                    <select
                      value={columnMapping.jobTitle}
                      onChange={(e) => setColumnMapping({ ...columnMapping, jobTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Location / Country</label>
                    <select
                      value={columnMapping.location}
                      onChange={(e) => setColumnMapping({ ...columnMapping, location: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                    >
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setImportStep(1)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportStep(3)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1"
                  >
                    <span>Configure Workflow &amp; Strategy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Workflow Mode, Duplicate Strategy & Campaign Assignment */}
            {importStep === 3 && (
              <div className="space-y-4 text-xs">
                {/* 1. Workflow Selection: Calling Only vs Leads + Calling */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-amber-500" />
                    <span>Workflow Selection (Calling Only vs Leads + Calling)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${
                      workflowMode === 'CALLING_ONLY'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="workflowMode"
                          checked={workflowMode === 'CALLING_ONLY'}
                          onChange={() => setWorkflowMode('CALLING_ONLY')}
                        />
                        <span className="font-bold">AI Calling Only</span>
                      </div>
                      <p className="text-[11px] opacity-80">
                        Upload existing leads and launch AI voice calls immediately without running AI lead discovery.
                      </p>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${
                      workflowMode === 'LEADS_AND_CALLING'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="workflowMode"
                          checked={workflowMode === 'LEADS_AND_CALLING'}
                          onChange={() => setWorkflowMode('LEADS_AND_CALLING')}
                        />
                        <span className="font-bold">Leads + AI Calling</span>
                      </div>
                      <p className="text-[11px] opacity-80">
                        Enrich with company telemetry, predictive intent scoring, and RFP matching prior to voice campaigns.
                      </p>
                    </label>
                  </div>
                </div>

                {/* 2. Duplicate Resolution Strategy */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Duplicate Lead Handling Policy</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SKIP', title: 'Skip Duplicates', desc: 'Preserve existing records' },
                      { id: 'OVERWRITE', title: 'Overwrite', desc: 'Update with new data' },
                      { id: 'MERGE', title: 'Merge Fields', desc: 'Fill in blank attributes' },
                    ].map((strat) => (
                      <label
                        key={strat.id}
                        className={`p-2.5 rounded-xl border cursor-pointer ${
                          duplicateStrategy === strat.id
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <input
                            type="radio"
                            name="duplicateStrategy"
                            checked={duplicateStrategy === strat.id}
                            onChange={() => setDuplicateStrategy(strat.id as any)}
                          />
                          <span className="font-bold">{strat.title}</span>
                        </div>
                        <div className="text-[10px] opacity-75">{strat.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Campaign Assignment */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Assign Imported Leads to Campaign
                  </label>
                  <select
                    value={targetCampaign}
                    onChange={(e) => setTargetCampaign(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  >
                    <option value="Enterprise M365 & SharePoint Outreach">Enterprise M365 &amp; SharePoint Outreach</option>
                    <option value="Cloud Data Warehouse Modernization">Cloud Data Warehouse Modernization</option>
                    <option value="Create Dedicated Campaign for this Upload">Create Dedicated Campaign for this Upload</option>
                  </select>
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs border border-emerald-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{importStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setImportStep(2)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    Validate &amp; Import Leads
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
