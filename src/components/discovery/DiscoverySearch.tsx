'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Globe,
  FolderArchive,
  Handshake,
  Database,
  Filter,
  ArrowRight,
} from 'lucide-react';

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.97 0-1.75.79-1.75 1.76s.78 1.75 1.75 1.75 1.75-.78 1.75-1.75-.78-1.76-1.75-1.76Z" />
    </svg>
  );
}

function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface DiscoverySearchProps {
  onSearch: (query: string, platform: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  loading?: boolean;
}

export default function DiscoverySearch({
  onSearch,
  selectedPlatform,
  setSelectedPlatform,
  loading = false,
}: DiscoverySearchProps) {
  const [keyword, setKeyword] = useState('Microsoft 365 implementation partner');
  const [industry, setIndustry] = useState('All Industries');
  const [location, setLocation] = useState('Global');
  const [dateRange, setDateRange] = useState('Last 7 Days');

  const platforms = [
    { id: 'LinkedIn', label: 'LinkedIn', count: '12,568', icon: LinkedinIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'X (Twitter)', label: 'X (Twitter)', count: '8,421', icon: TwitterIcon, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { id: 'Company Websites', label: 'Company Websites', count: '6,532', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 'Directories', label: 'Directories', count: '4,321', icon: FolderArchive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'Freelance Platforms', label: 'Freelance Platforms', count: '2,845', icon: Handshake, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'CRM Integrations', label: 'CRM Integrations', count: '3,214', icon: Database, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, selectedPlatform);
  };

  return (
    <div className="glass-card p-5 mb-6 border-indigo-500/20 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" /> Lead Discovery
        </h2>
        <span className="text-xs text-slate-400">
          Autonomous crawler monitoring <span className="text-emerald-400 font-semibold">37,800+</span> active public sources
        </span>
      </div>

      {/* Main Search Input & Filters */}
      <form onSubmit={handleSearchSubmit} className="space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by Keyword, Industry, Location, Company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d1f] border border-white/[0.1] text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Scanning...
              </span>
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Filter Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedPlatform}
            onChange={(e) => {
              setSelectedPlatform(e.target.value);
              onSearch(keyword, e.target.value);
            }}
            aria-label="Platform Source Filter"
            className="px-3 py-1.5 rounded-lg bg-[#090d1f] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All Sources">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X (Twitter)">X (Twitter)</option>
            <option value="Company Websites">Company Websites</option>
            <option value="Directories">Directories</option>
            <option value="Freelance Platforms">Freelance Platforms</option>
            <option value="CRM Integrations">CRM Integrations</option>
          </select>

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="Industry Filter"
            className="px-3 py-1.5 rounded-lg bg-[#090d1f] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All Industries">Industry: All</option>
            <option value="IT Services">IT Services</option>
            <option value="Software">Software & SaaS</option>
            <option value="Consulting">Consulting</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Healthcare">Healthcare</option>
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location Filter"
            className="px-3 py-1.5 rounded-lg bg-[#090d1f] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="Global">Location: Global</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="APAC">APAC</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            aria-label="Date Range Filter"
            className="px-3 py-1.5 rounded-lg bg-[#090d1f] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="Last 24 Hours">Date: Last 24 Hours</option>
            <option value="Last 7 Days">Date: Last 7 Days</option>
            <option value="Last 30 Days">Date: Last 30 Days</option>
          </select>

          <button
            type="button"
            className="ml-auto px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> More Filters
          </button>
        </div>
      </form>

      {/* Source Platform Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                const next = isSelected ? 'All Sources' : p.id;
                setSelectedPlatform(next);
                onSearch(keyword, next);
              }}
              className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/60 shadow-md shadow-indigo-500/20'
                  : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${p.bg} ${p.color} mb-1.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-medium text-slate-300 truncate w-full">{p.label}</div>
              <div className="text-xs font-bold text-white mt-0.5">{p.count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
