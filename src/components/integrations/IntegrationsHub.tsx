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
  Check
} from 'lucide-react';

interface IntegrationService {
  id: string;
  name: string;
  category: 'CRM' | 'Telephony' | 'Calendar' | 'Messaging';
  description: string;
  connected: boolean;
  iconBg: string;
}

const SERVICES: IntegrationService[] = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM',
    description: 'Auto-sync enriched leads, intent scores, call notes, and deal pipelines.',
    connected: true,
    iconBg: 'bg-orange-500/10 text-orange-400'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Bi-directional sync of contacts, accounts, and tasks into Sales Cloud.',
    connected: true,
    iconBg: 'bg-blue-500/10 text-blue-400'
  },
  {
    id: 'twilio',
    name: 'Twilio Voice SIP',
    category: 'Telephony',
    description: 'Custom carrier trunking for direct outbound telecom dialer and SMS callbacks.',
    connected: false,
    iconBg: 'bg-rose-500/10 text-rose-400'
  },
  {
    id: 'gcal',
    name: 'Google Calendar & Meet',
    category: 'Calendar',
    description: 'Instant calendar demonstration bookings when AI voice qualifies prospect.',
    connected: true,
    iconBg: 'bg-emerald-500/10 text-emerald-400'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    category: 'Messaging',
    description: 'Trigger automated post-call summary brochures and calendar confirmations.',
    connected: true,
    iconBg: 'bg-green-500/10 text-green-400'
  },
  {
    id: 'outlook',
    name: 'Microsoft 365 & Outlook',
    category: 'Calendar',
    description: 'Sync meetings with enterprise Exchange and Teams meeting rooms.',
    connected: true,
    iconBg: 'bg-indigo-500/10 text-indigo-400'
  }
];

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(SERVICES);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.technova.com/webhooks/ai-sales');

  const handleToggleConnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => item.id === id ? { ...item, connected: !item.connected } : item)
    );
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('sk_live_sales_ai_8932749821739812');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Enterprise Connectors &amp; APIs
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              CRM, Calendar, WhatsApp &amp; Telephony Integrations
            </h2>
            <p className="text-xs text-slate-400">
              Deliver autonomous sales intelligence directly into your existing corporate tech stack.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((service) => (
          <div
            key={service.id}
            className="glass-card p-5 border-white/[0.06] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`p-2 rounded-xl text-sm font-bold ${service.iconBg}`}>
                  {service.name.substring(0, 2).toUpperCase()}
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    service.connected
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/40 text-slate-400 border-white/[0.08]'
                  }`}
                >
                  {service.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{service.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {service.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">{service.category}</span>
              <button
                onClick={() => handleToggleConnect(service.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  service.connected
                    ? 'bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/[0.08]'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {service.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Developer API Keys & Webhooks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 border-white/[0.06] shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-400" /> Platform REST API Key
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Authenticate programmatic requests to trigger autonomous lead discovery and scheduled voice campaigns.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value="sk_live_sales_ai_8932749821739812"
              className="flex-1 px-3 py-2 rounded-xl bg-[#090d1f] border border-white/[0.08] text-xs text-slate-300 font-mono"
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

        <div className="glass-card p-5 border-white/[0.06] shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
            <Webhook className="w-4 h-4 text-purple-400" /> Inbound / Outbound Webhook URL
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Receive real-time HTTP POST notifications when calls are completed or meetings are booked.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#090d1f] border border-white/[0.08] text-xs text-slate-300 font-mono"
            />
            <button
              onClick={() => alert('Webhook endpoint verified successfully!')}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Test Ping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
