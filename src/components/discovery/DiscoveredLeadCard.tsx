'use client';

import React from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  Globe,
  Briefcase,
  Users,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Sparkles,
  Headphones,
  ShieldCheck,
  Brain,
  Zap,
  Target,
  Award,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.97 0-1.75.79-1.75 1.76s.78 1.75 1.75 1.75 1.75-.78 1.75-1.75-.78-1.76-1.75-1.76Z" />
    </svg>
  );
}

export interface LeadItem {
  id: string;
  name: string;
  jobTitle: string;
  companyName: string;
  companyWebsite: string | null;
  industry: string;
  companySize: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  linkedinProfile: string | null;
  sourcePlatform: string;
  originalPostUrl: string | null;
  originalPostSnippet: string | null;
  intentScore: number;
  budgetSignal: string;
  urgencyLevel: string;
  decisionMaker: boolean;
  activeRequirement: boolean;
  status: string;
  discoveryDate?: string;
  matchReasoning?: string;
  fitScore?: number;
  keyMatches?: string[];
  recommendedPitch?: string;
  scoreBreakdown?: {
    authority: number;
    budget: number;
    urgency: number;
    fit: number;
  };
  isExample?: boolean;
  matchedQuery?: string;
  location?: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  workflowType?: string;
  retryCount?: number;
  scheduledCallbackAt?: string | null;
  dndStatus?: boolean;
}

interface DiscoveredLeadCardProps {
  lead: LeadItem;
  onOpenCallModal: (lead: LeadItem) => void;
  onOpenScoreModal: (lead: LeadItem) => void;
  isExampleMode?: boolean;
  currentLanguage?: string;
}

export default function DiscoveredLeadCard({
  lead,
  onOpenCallModal,
  onOpenScoreModal,
  isExampleMode = false,
  currentLanguage = 'English',
}: DiscoveredLeadCardProps) {
  const [showLogicDetails, setShowLogicDetails] = React.useState(true);
  const isExample = isExampleMode || lead.isExample;
  const t = getTranslation(currentLanguage);

  const scoreBreakdown = lead.scoreBreakdown || {
    authority: lead.decisionMaker ? 25 : 15,
    budget: lead.budgetSignal === 'Approved' ? 25 : lead.budgetSignal === 'High' ? 24 : 18,
    urgency: lead.urgencyLevel === 'High' ? 24 : 18,
    fit: Math.max(15, (lead.intentScore || 90) - 70),
  };

  const defaultReasoning = isExample
    ? 'Direct public RFP posted by CTO on LinkedIn scouting an implementation partner for SharePoint & Microsoft 365 migration with high urgency and approved budget.'
    : `Prospect explicitly stated an active enterprise requirement matching "${lead.matchedQuery || 'target capability'}" with verified decision-maker authority.`;

  const defaultPitch = isExample
    ? "Introduce TechNova's certified SharePoint migration accelerators and automated workflow connectors; propose a 15-minute architecture discovery session."
    : `Introduce our specialized solution architecture for ${lead.matchedQuery || 'their requirement'} and offer a complimentary technical qualification call.`;

  const keyTags = lead.keyMatches && lead.keyMatches.length > 0
    ? lead.keyMatches
    : ['Active RFP', 'Decision Maker', 'Enterprise Scope', 'High Intent'];

  return (
    <div className="glass-card p-5 mb-6 border-slate-200 dark:border-indigo-500/20 shadow-xl relative overflow-hidden transition-colors">
      {/* Top Banner indicating Example Benchmark vs Live Custom Search Result */}
      {isExample && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500 text-white font-bold text-[10px] tracking-wide uppercase">
              {t.benchmarkBadge}
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {t.benchmarkDesc}
            </span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-300">
            {t.typeCustomQuery}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {isExample ? t.highIntentOpp : `Discovered for "${lead.matchedQuery || 'Custom Search'}"`}
          </span>
          <span className="text-xs text-slate-700 dark:text-slate-400">
            • {isExample ? t.benchmarkBadge : 'Discovered autonomously'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenScoreModal(lead)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{t.intentScoreLabel}:</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
              {lead.intentScore}
            </span>
          </button>

          {lead.originalPostUrl && (
            <a
              href={lead.originalPostUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Connect on original source platform where requirement was published"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t.connectOnPlatform} {lead.sourcePlatform || 'Source'}</span>
            </a>
          )}

          <button
            onClick={() => onOpenCallModal(lead)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" /> {t.launchAiCall}
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Original Public Requirement Post */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-50 dark:bg-[#090d20] border border-slate-200 dark:border-white/[0.06] flex flex-col justify-between">
          <div>
            {/* Author Bar */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
                    {lead.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-1.5 font-heading">
                    {lead.name}
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">• 2nd</span>
                  </div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {lead.jobTitle} at <span className="font-semibold text-slate-900 dark:text-white">{lead.companyName}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span>1d • Edited •</span>
                    <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <LinkedinIcon className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Post Content */}
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-100/90 dark:bg-white/[0.04] p-3.5 rounded-xl border border-slate-300/80 dark:border-white/[0.08] mb-3 font-medium">
              &quot;{lead.originalPostSnippet}&quot;
            </p>
          </div>

          {/* Social Reactions Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white">👍</span>
                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white">❤️</span>
              </span>
              <span>18 reactions</span>
            </div>
            <div className="flex items-center gap-3">
              <span>9 comments</span>
              <span>3 reposts</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 mt-2 border-t border-slate-200 dark:border-white/[0.04] text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
            <button type="button" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer">
              <ThumbsUp className="w-3.5 h-3.5" /> Like
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" /> Comment
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer">
              <Repeat2 className="w-3.5 h-3.5" /> Repost
            </button>
          </div>
        </div>

        {/* Right Column: AI Lead Intelligence & Enriched Contact Info */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-50 dark:bg-[#090d20] border border-slate-200 dark:border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-heading">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.leadEnrichedDetails}
              </h3>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.discoveredOn}: {lead.discoveryDate || '08 May 2025'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.contactName}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{lead.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.contactEmail}
                </span>
                <div className="flex items-center gap-1.5">
                  {lead.email ? (
                    <>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{lead.email}</span>
                      {lead.emailVerified && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {t.verifiedBadge}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/90 italic">{t.notDisclosedBadge}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.contactPhone}
                </span>
                <div className="flex items-center gap-1.5">
                  {lead.phone ? (
                    <>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{lead.phone}</span>
                      {lead.phoneVerified && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {t.verifiedBadge}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/90 italic">{t.notDisclosedBadge}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.companyLabel}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{lead.companyName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.websiteLabel}
                </span>
                <a
                  href={lead.companyWebsite ? `https://${lead.companyWebsite.replace(/^https?:\/\//, '')}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  {lead.companyWebsite} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> {t.jobTitleLabel}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">{lead.jobTitle}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400">{t.industrySizeLabel}</span>
                <span className="text-slate-800 dark:text-slate-300 font-medium">
                  {lead.industry} • {lead.companySize}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" /> Location &amp; Language
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                    {lead.location ? `${lead.location} (${lead.country || ''})` : 'Global'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-bold">
                    {lead.preferredLanguage || 'English'}
                  </span>
                </div>
              </div>

              {/* Mandatory Transparency Link to Original Post */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-700 dark:text-slate-400">{t.originalPostUrlLabel}:</span>
                <a
                  href={lead.originalPostUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 underline truncate max-w-[200px]"
                >
                  {lead.originalPostUrl || 'linkedin.com/posts/...'} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent AI Discovery & Qualification Logic Drawer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>{t.aiLogicTitle}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                Transparent Formula
              </span>
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setShowLogicDetails(!showLogicDetails)}
            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>{showLogicDetails ? t.hideLogicDetails : t.showLogicDetails}</span>
            {showLogicDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showLogicDetails && (
          <div className="mt-3 space-y-3 animate-in fade-in duration-200">
            {/* Top row: Rationale + Tags */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#090d20] border border-slate-200 dark:border-white/[0.06] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {t.semanticMatchTitle}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {t.fitScoreLabel}: {lead.fitScore || lead.intentScore}%
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {lead.matchReasoning || defaultReasoning}
              </p>

              {/* Keyword alignment tags */}
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 mr-1 flex items-center">{t.matchedTags}:</span>
                {keyTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle row: 4 qualification signals breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">{t.authorityCol}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{scoreBreakdown.authority}<span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal"> / 25</span></div>
                <div className="text-[9px] text-indigo-600 dark:text-indigo-300 truncate mt-0.5">{lead.jobTitle}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">{t.budgetCol}</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{scoreBreakdown.budget}<span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal"> / 25</span></div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-300 truncate mt-0.5">{lead.budgetSignal} Budget</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">{t.urgencyCol}</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{scoreBreakdown.urgency}<span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal"> / 25</span></div>
                <div className="text-[9px] text-amber-600 dark:text-amber-300 truncate mt-0.5">{lead.urgencyLevel} Urgency</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">{t.fitCol}</div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{scoreBreakdown.fit}<span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal"> / 25</span></div>
                <div className="text-[9px] text-blue-600 dark:text-blue-300 truncate mt-0.5">High Alignment</div>
              </div>
            </div>

            {/* Bottom row: Recommended Pitch Angle */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 dark:from-indigo-950/40 via-purple-50 dark:via-purple-950/30 to-blue-50 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded-md bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 block mb-0.5">
                  {t.recommendedPitchTitle}
                </span>
                <p className="text-slate-700 dark:text-slate-200 text-[11px] leading-relaxed">
                  {lead.recommendedPitch || defaultPitch}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
