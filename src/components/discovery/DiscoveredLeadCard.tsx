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
} from 'lucide-react';

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
}

interface DiscoveredLeadCardProps {
  lead: LeadItem;
  onOpenCallModal: (lead: LeadItem) => void;
  onOpenScoreModal: (lead: LeadItem) => void;
}

export default function DiscoveredLeadCard({
  lead,
  onOpenCallModal,
  onOpenScoreModal,
}: DiscoveredLeadCardProps) {
  return (
    <div className="glass-card p-5 mb-6 border-indigo-500/20 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> High Intent Opportunity
          </span>
          <span className="text-xs text-slate-400">• Discovered autonomously</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenScoreModal(lead)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Intent Score:</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
              {lead.intentScore}
            </span>
          </button>

          <button
            onClick={() => onOpenCallModal(lead)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" /> Launch AI Call
          </button>
        </div>
      </div>

      {/* Two Column Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Original Public Requirement Post */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#090d20] border border-white/[0.06] flex flex-col justify-between">
          <div>
            {/* Author Bar */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white">
                    {lead.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {lead.name}
                    <span className="text-[11px] font-normal text-slate-400">• 2nd</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {lead.jobTitle} at {lead.companyName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>1d • Edited •</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded bg-blue-600 text-white">
                <LinkedinIcon className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Post Content */}
            <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] mb-3">
              &quot;{lead.originalPostSnippet}&quot;
            </p>
          </div>

          {/* Social Reactions Footer */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-blue-400 font-medium">
                <ThumbsUp className="w-3.5 h-3.5 fill-blue-500/20" /> 54
              </span>
              <span className="flex items-center gap-1 hover:text-slate-200">
                <MessageCircle className="w-3.5 h-3.5" /> 23 comments
              </span>
              <span className="flex items-center gap-1 hover:text-slate-200">
                <Repeat2 className="w-3.5 h-3.5" /> 12 reposts
              </span>
            </div>

            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Requirement
            </span>
          </div>
        </div>

        {/* Right Column: Lead Enriched Details with Verified Badges */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#090d20] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Lead Enriched Details
            </h3>
            <span className="text-[10px] text-slate-400">
              Discovered: {lead.discoveryDate || '08 May 2025'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Name
              </span>
              <span className="font-semibold text-white">{lead.name}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-200">{lead.email}</span>
                {lead.emailVerified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-200">{lead.phone}</span>
                {lead.phoneVerified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Company
              </span>
              <span className="font-medium text-slate-200">{lead.companyName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
              </span>
              <a
                href={lead.companyWebsite ? `https://${lead.companyWebsite.replace(/^https?:\/\//, '')}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                {lead.companyWebsite} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Job Title
              </span>
              <span className="font-medium text-slate-200">{lead.jobTitle}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-slate-400">Industry & Size</span>
              <span className="text-slate-300 font-medium">
                {lead.industry} • {lead.companySize}
              </span>
            </div>

            {/* Mandatory Transparency Link to Original Post */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-slate-400">Original Post URL:</span>
              <a
                href={lead.originalPostUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline truncate max-w-[200px]"
              >
                {lead.originalPostUrl || 'linkedin.com/posts/...'} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
