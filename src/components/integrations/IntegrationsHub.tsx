'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  ExternalLink,
  Key,
  Webhook,
  Calendar,
  MessageSquare,
  Database,
  Radio,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface IntegrationService {
  id: string;
  name: string;
  category: 'CRM' | 'Telephony' | 'Calendar' | 'Messaging' | 'Lead Intelligence';
  description: string;
  connected: boolean;
  iconBg: string;
  syncAvailable?: boolean;
}

const SERVICES: IntegrationService[] = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM',
    description: 'Auto-sync contacts, deal stages, AI call transcripts, and qualification summaries.',
    connected: true,
    syncAvailable: true,
    iconBg: 'bg-orange-500/10 text-orange-400'
  },
  {
    id: 'salesforce',
    name: 'Salesforce Sales Cloud',
    category: 'CRM',
    description: 'Bi-directional synchronization of Leads, Accounts, and logged AI calling tasks.',
    connected: true,
    syncAvailable: true,
    iconBg: 'bg-blue-500/10 text-blue-400'
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    category: 'CRM',
    description: 'Push qualified hot leads and scheduled demo callbacks directly into Zoho pipelines.',
    connected: true,
    syncAvailable: true,
    iconBg: 'bg-emerald-500/10 text-emerald-400'
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'CRM',
    description: 'Real-time deal stage automation and contact activity timeline synchronization.',
    connected: false,
    syncAvailable: true,
    iconBg: 'bg-green-500/10 text-green-400'
  },
  {
    id: 'apollo',
    name: 'Apollo.io B2B Database',
    category: 'Lead Intelligence',
    description: 'Enrich verified executive phone numbers, email deliverability, and funding signals.',
    connected: true,
    syncAvailable: true,
    iconBg: 'bg-purple-500/10 text-purple-400'
  },
  {
    id: 'linkedin_nav',
    name: 'LinkedIn Sales Navigator',
    category: 'Lead Intelligence',
    description: 'Monitor real-time job changes, RFP hiring posts, and executive decision-maker accounts.',
    connected: true,
    syncAvailable: true,
    iconBg: 'bg-cyan-500/10 text-cyan-400'
  },
  {
    id: 'twilio',
    name: 'Twilio Voice Carrier SIP',
    category: 'Telephony',
    description: 'Live PSTN trunking for direct outbound carrier dialing and DTMF capture.',
    connected: true,
    syncAvailable: false,
    iconBg: 'bg-rose-500/10 text-rose-400'
  },
  {
    id: 'gcal',
    name: 'Google Calendar & Meet',
    category: 'Calendar',
    description: 'Instant calendar demo bookings when Ava AI confirms qualification on calls.',
    connected: true,
    syncAvailable: false,
    iconBg: 'bg-emerald-500/10 text-emerald-400'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    category: 'Messaging',
    description: 'Trigger post-call summary decks, WhatsApp meeting confirmations, and brochures.',
    connected: true,
    syncAvailable: false,
    iconBg: 'bg-green-500/10 text-green-400'
  }
];

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(SERVICES);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.technova.com/webhooks/ai-sales');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleToggleConnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => item.id === id ? { ...item, connected: !item.connected } : item)
    );
  };

  const handleSyncCrm = (serviceName: string, serviceId: string) => {
    setSyncingId(serviceId);
    setSyncFeedback(`Connecting to ${serviceName} REST API... Pulling 14 qualified opportunities.`);

    setTimeout(() => {
      setSyncFeedback(`Successfully synchronized 14 verified leads from ${serviceName} with full contact mapping!`);
      setTimeout(() => {
        setSyncingId(null);
        setSyncFeedback(null);
      }, 3500);
    }, 1800);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('sk_live_sales_ai_8932749821739812');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Multi-CRM &amp; Lead Source Connectors
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Enterprise CRM, Telephony &amp; Intelligence Integrations
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Bidirectional data sync with HubSpot, Salesforce, Zoho, Apollo.io, LinkedIn, and Twilio voice trunking.
            </p>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((service) => (
          <div
            key={service.id}
            className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`p-2 rounded-xl text-sm font-bold ${service.iconBg}`}>
                  {service.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      service.connected
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
                    }`}
                  >
                    {service.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{service.name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {service.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">{service.category}</span>
              <div className="flex items-center gap-2">
                {service.connected && service.syncAvailable && (
                  <button
                    type="button"
                    onClick={() => handleSyncCrm(service.name, service.id)}
                    disabled={syncingId === service.id}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-indigo-200 dark:border-indigo-500/30"
                    title={`Sync leads from ${service.name}`}
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingId === service.id ? 'animate-spin' : ''}`} />
                    <span>{syncingId === service.id ? 'Syncing...' : 'Sync Leads'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleToggleConnect(service.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    service.connected
                      ? 'bg-slate-100 dark:bg-white/[0.05] hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-400 border border-slate-200 dark:border-white/[0.08]'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {service.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Developer API Keys & Webhooks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-400" /> Platform REST API Key
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Authenticate programmatic requests to trigger autonomous lead discovery and scheduled voice campaigns.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value="sk_live_sales_ai_8932749821739812"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300 font-mono"
            />
            <button
              onClick={copyApiKey}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Webhook className="w-4 h-4 text-purple-400" /> Inbound / Outbound Webhook URL
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Receive real-time HTTP POST notifications when calls are completed, DND is registered, or meetings are booked.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300 font-mono"
            />
            <button
              onClick={() => alert('Webhook endpoint verified successfully! POST payloads active.')}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Test Ping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
