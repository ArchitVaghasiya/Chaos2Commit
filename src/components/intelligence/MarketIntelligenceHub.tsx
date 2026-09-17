'use client';

import React, { useState } from 'react';
import {
  Globe2,
  TrendingUp,
  Cpu,
  Users2,
  DollarSign,
  Building,
  ExternalLink,
  Target,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';

interface CompanyDossier {
  name: string;
  website: string;
  industry: string;
  size: string;
  headquarters: string;
  funding: {
    stage: string;
    totalRaised: string;
    lastRoundDate: string;
    leadInvestors: string[];
  };
  hiring: {
    openRolesCount: number;
    highGrowthDepartments: string[];
    recentKeyHires: string[];
  };
  techStack: {
    category: string;
    tools: string[];
  }[];
  competitorInsights: {
    topCompetitors: string[];
    displacementAngle: string;
  };
}

const DOSSIERS: CompanyDossier[] = [
  {
    name: 'TechNova Solutions',
    website: 'https://technova.com',
    industry: 'Enterprise IT Services',
    size: '51 – 200 employees',
    headquarters: 'Austin, Texas, USA',
    funding: {
      stage: 'Series B',
      totalRaised: '$24.5M',
      lastRoundDate: 'January 2025',
      leadInvestors: ['Accel Partners', 'Insight Venture Partners']
    },
    hiring: {
      openRolesCount: 14,
      highGrowthDepartments: ['Cloud Engineering (6)', 'Enterprise Sales (4)', 'DevOps (4)'],
      recentKeyHires: ['VP of Infrastructure (ex-Microsoft)', 'Chief Information Security Officer']
    },
    techStack: [
      { category: 'Cloud & Collaboration', tools: ['Microsoft 365', 'SharePoint Online', 'Azure DevOps', 'Teams'] },
      { category: 'CRM & Pipeline', tools: ['Salesforce Enterprise', 'HubSpot Sales Hub'] },
      { category: 'Security', tools: ['Okta SSO', 'CrowdStrike Falcon', 'Zscaler Zero Trust'] }
    ],
    competitorInsights: {
      topCompetitors: ['Accenture Cloud Practice', 'Slalom Consulting', 'Avanade'],
      displacementAngle: 'Legacy SharePoint custom web-parts suffering performance bottlenecks; looking for modern workflow automation.'
    }
  },
  {
    name: 'CloudTech Inc.',
    website: 'https://cloudtech.io',
    industry: 'Software & SaaS',
    size: '201 – 500 employees',
    headquarters: 'San Francisco, CA, USA',
    funding: {
      stage: 'Series C',
      totalRaised: '$68.0M',
      lastRoundDate: 'November 2024',
      leadInvestors: ['Sequoia Capital', 'Bessemer Venture Partners']
    },
    hiring: {
      openRolesCount: 22,
      highGrowthDepartments: ['Solutions Architecture (8)', 'Customer Success (7)', 'Product (7)'],
      recentKeyHires: ['Chief Revenue Officer (ex-Datadog)']
    },
    techStack: [
      { category: 'Cloud Infrastructure', tools: ['AWS Multi-Region', 'Kubernetes (EKS)', 'Terraform'] },
      { category: 'Data & Analytics', tools: ['Snowflake', 'dbt', 'Databricks', 'Looker'] },
      { category: 'Sales Stack', tools: ['Gong.io', 'Apollo.io', 'Salesforce'] }
    ],
    competitorInsights: {
      topCompetitors: ['CloudBees', 'Harness.io', 'GitLab Enterprise'],
      displacementAngle: 'Evaluating CRM migration and sales pipeline consolidation tools; budget approved for Q3.'
    }
  },
  {
    name: 'DataSystems GmbH',
    website: 'https://datasystems.eu',
    industry: 'Management & IT Consulting',
    size: '500+ employees',
    headquarters: 'Frankfurt, Germany',
    funding: {
      stage: 'Private Enterprise',
      totalRaised: 'Profitable / Bootstrapped',
      lastRoundDate: 'N/A',
      leadInvestors: ['European Tech Growth Fund']
    },
    hiring: {
      openRolesCount: 18,
      highGrowthDepartments: ['Data Engineering (10)', 'SAP S/4HANA Consultants (8)'],
      recentKeyHires: ['Head of Cloud Data Architecture']
    },
    techStack: [
      { category: 'Enterprise ERP', tools: ['SAP S/4HANA', 'Oracle Cloud'] },
      { category: 'Data Warehouse', tools: ['Snowflake', 'Microsoft Fabric'] },
      { category: 'Compliance', tools: ['GDPR Guard', 'OneTrust'] }
    ],
    competitorInsights: {
      topCompetitors: ['Capgemini Europe', 'Atos', 'BearingPoint'],
      displacementAngle: 'Active public RFP for Snowflake and cloud modernization partner; high urgency.'
    }
  }
];

export default function MarketIntelligenceHub() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyDossier>(DOSSIERS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = DOSSIERS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" /> Market Intelligence &amp; Account Profiling
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Deep Account Telemetry, Funding Signals &amp; Tech Stacks
            </h2>
            <p className="text-xs text-slate-400">
              Identify buying windows by correlating public requirements with hiring surges, venture funding, and vendor renewal cycles.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, tech..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#090d1f] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Company Quick Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
          {filteredCompanies.map((c) => {
            const isSelected = c.name === selectedCompany.name;
            return (
              <button
                key={c.name}
                onClick={() => setSelectedCompany(c)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
                    : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] border border-white/[0.04]'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{c.name}</span>
                <span className="text-[10px] opacity-75">({c.industry.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Account Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Funding & Hiring Signals (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Funding Card */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Funding &amp; Capitalization
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedCompany.funding.stage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-slate-400">Total Capital Raised</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{selectedCompany.funding.totalRaised}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-slate-400">Last Round Announced</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{selectedCompany.funding.lastRoundDate}</div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Backing Investors:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCompany.funding.leadInvestors.map((inv, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[0.04] text-slate-200 border border-white/[0.08]">
                    {inv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hiring Signals Card */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-blue-400" /> Hiring Velocity &amp; Team Expansion
              </h3>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {selectedCompany.hiring.openRolesCount} Open Roles
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-[11px] font-semibold text-slate-400">Growth Departments:</div>
              <div className="space-y-1.5 text-xs">
                {selectedCompany.hiring.highGrowthDepartments.map((dept, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-200 flex items-center justify-between">
                    <span>{dept}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active Recruiter Outreach</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Recent Key Executive Appointments:</div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {selectedCompany.hiring.recentKeyHires.map((hire, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[11px] border border-indigo-500/20">
                    &bull; {hire}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Technology Stack & Competitor Insights (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tech Stack Card */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> Detected Technology Stack
              </h3>
              <span className="text-[10px] text-slate-400">Verified via Public DNS &amp; Job Specs</span>
            </div>

            <div className="space-y-3">
              {selectedCompany.techStack.map((cat, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[11px] font-bold text-slate-300 mb-1.5">{cat.category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tools.map((tool, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Insights & Pitch Angle Card */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" /> Competitive Displacement Angle
              </h3>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                High Win Probability
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-3 text-xs">
              <div className="text-[10px] font-bold uppercase text-amber-300 mb-1">Recommended Pitch Hook:</div>
              <p className="text-slate-200 leading-relaxed">
                &quot;{selectedCompany.competitorInsights.displacementAngle}&quot;
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Primary Incumbent Vendors:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCompany.competitorInsights.topCompetitors.map((comp, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] text-slate-300 bg-white/[0.04] border border-white/[0.06]">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
