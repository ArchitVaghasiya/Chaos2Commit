'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Server,
  Lock,
  Search,
  Eye,
  BarChart2
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'ANOMALY_BLOCKED';
}

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2025-05-08 14:15:22',
    actor: 'system.crawler',
    action: 'LEAD_ENRICHMENT_PASS',
    resource: 'Lead: John Smith (TechNova)',
    ipAddress: '10.0.4.12',
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    timestamp: '2025-05-08 14:18:05',
    actor: 'ava.voice_agent',
    action: 'OUTBOUND_VOICE_CALL_CONNECT',
    resource: 'Call: +1 (555) 123-4567',
    ipAddress: '10.0.8.91',
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    timestamp: '2025-05-08 14:20:41',
    actor: 'ava.voice_agent',
    action: 'CALENDAR_MEETING_BOOKED',
    resource: 'Meeting: Solutions Demo (Thu 3PM)',
    ipAddress: '10.0.8.91',
    status: 'SUCCESS'
  },
  {
    id: 'log-4',
    timestamp: '2025-05-08 13:42:19',
    actor: 'crawler.ingest',
    action: 'SUSPICIOUS_SCRAPE_VELOCITY',
    resource: 'RateLimit: 450 req/min on public portal',
    ipAddress: '198.51.100.44',
    status: 'ANOMALY_BLOCKED'
  },
  {
    id: 'log-5',
    timestamp: '2025-05-08 12:05:10',
    actor: 'admin@technova.com',
    action: 'PRODUCT_CATALOG_VALIDATION',
    resource: 'Suitability Score: 98%',
    ipAddress: '192.168.1.105',
    status: 'SUCCESS'
  }
];

export default function AdminAuditHub() {
  const [logs] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
  const [searchLog, setSearchLog] = useState('');

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.resource.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Platform Governance &amp; Administration
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Lead Quality Monitoring, Fraud Detection &amp; Audit Logs
            </h2>
            <p className="text-xs text-slate-600">
              PDF Page 2 Admin Features: System analytics, voice usage tracking, fraud detection, and security audit logs.
            </p>
          </div>
        </div>

        {/* 4 Admin KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] text-slate-600 mb-1 flex items-center justify-between">
              <span>System Health</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">99.98%</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Operational</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] text-slate-600 mb-1 flex items-center justify-between">
              <span>Avg Lead Quality Score</span>
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">88.4 / 100</div>
            <div className="text-[10px] text-blue-400 mt-0.5">High Intent Benchmark</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] text-slate-600 mb-1 flex items-center justify-between">
              <span>Fraud &amp; Anomaly Shield</span>
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">0 Breaches</div>
            <div className="text-[10px] text-purple-400 mt-0.5">1 Anomaly Blocked Today</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] text-slate-600 mb-1 flex items-center justify-between">
              <span>Concurrent Voice Lines</span>
              <Server className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">12 / 50</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Sub-150ms Latency</div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security &amp; Operational Audit Trail</h3>
            <p className="text-xs text-slate-600">Cryptographically ordered event log of all system activities</p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-white/[0.02] text-slate-600 border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Resource Details</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-600">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.actor}</td>
                  <td className="py-3 px-4 text-indigo-300">{log.action}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.resource}</td>
                  <td className="py-3 px-4 text-slate-600">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
