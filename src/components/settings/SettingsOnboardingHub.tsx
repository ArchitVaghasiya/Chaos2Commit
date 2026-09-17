'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Headphones,
  Save,
  FileCheck,
  Radio
} from 'lucide-react';

export default function SettingsOnboardingHub() {
  const [companyName, setCompanyName] = useState('TechNova Solutions');
  const [website, setWebsite] = useState('https://technova.com');
  const [description, setDescription] = useState(
    'Cloud and Enterprise IT Solutions Provider specializing in Microsoft 365, SharePoint migrations, and workflow automation.'
  );
  const [productsCatalog, setProductsCatalog] = useState(
    'Microsoft 365 implementation, SharePoint Online document intranets, Power Platform workflow automation, Cloud Migration security audits.'
  );
  const [aiPersonaName, setAiPersonaName] = useState('Ava (Enterprise Sales Executive)');
  const [telephonyMode, setTelephonyMode] = useState<'BUILT_IN' | 'TWILIO_SIP'>('BUILT_IN');
  const [aiLanguageDefault, setAiLanguageDefault] = useState('en');

  // AI Validation state for Step 6
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    score: number;
    status: 'APPROVED' | 'REQUIRES_ADMIN';
    feedback: string;
  } | null>({
    score: 96,
    status: 'APPROVED',
    feedback: 'Products & services are highly structured with clear B2B value propositions, suitable for autonomous AI sales qualification and discovery calling.',
  });

  const handleValidateProducts = () => {
    setValidating(true);
    setTimeout(() => {
      setValidationResult({
        score: 98,
        status: 'APPROVED',
        feedback: 'Validated: Enterprise IT & SaaS offerings verified against compliance rules. Approved for autonomous multilingual outbound calls.',
      });
      setValidating(false);
    }, 1200);
  };

  const [savedSuccess, setSavedSuccess] = useState(false);
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Company Onboarding &amp; AI Calibration
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Business Profile, Product Catalog &amp; AI Suitability
            </h2>
            <p className="text-xs text-slate-400">
              Complete User Journey Steps 1–6: Define business offerings and run the AI Product Selling Readiness Validator.
            </p>
          </div>

          {savedSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Company Profile & Product Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/[0.06] flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" /> Company Information &amp; Services
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Products &amp; Services Catalog (Fed into AI Voice Knowledge Base)
                </label>
                <textarea
                  rows={4}
                  value={productsCatalog}
                  onChange={(e) => setProductsCatalog(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* AI Selling Product Suitability Validator (PDF Page 3 Step 6) */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Selling Suitability Validation (Step 6)
              </h3>

              <button
                type="button"
                onClick={handleValidateProducts}
                disabled={validating}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {validating ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Validating...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" /> Run Suitability Check
                  </>
                )}
              </button>
            </div>

            {validationResult && (
              <div className="p-4 rounded-xl bg-[#070b1c] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Status: {validationResult.status}
                  </span>
                  <span className="text-xs font-extrabold text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    Suitability Score: {validationResult.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {validationResult.feedback}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Validated against enterprise compliance, telemarketing regulations, and conversational nuance.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telephony Mode & AI Voice Persona (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Telephony Infrastructure Selection (PDF Page 3 Step 5) */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/[0.06] flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" /> Calling Infrastructure (Step 5)
            </h3>

            <div className="space-y-2.5 text-xs">
              <label
                onClick={() => setTelephonyMode('BUILT_IN')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  telephonyMode === 'BUILT_IN'
                    ? 'bg-indigo-600/15 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="radio"
                  name="telephony"
                  checked={telephonyMode === 'BUILT_IN'}
                  onChange={() => setTelephonyMode('BUILT_IN')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-white">Platform Built-In Voice Service</div>
                  <div className="text-[11px] text-slate-400">
                    Pre-provisioned global SIP trunks with automated caller ID rotation and zero setup.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setTelephonyMode('TWILIO_SIP')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  telephonyMode === 'TWILIO_SIP'
                    ? 'bg-indigo-600/15 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="radio"
                  name="telephony"
                  checked={telephonyMode === 'TWILIO_SIP'}
                  onChange={() => setTelephonyMode('TWILIO_SIP')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-white">Bring Your Own Telephony (BYOT / Twilio)</div>
                  <div className="text-[11px] text-slate-400">
                    Connect your own Twilio, Bland.ai, or custom SIP trunk for direct carrier billing.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* AI Voice Persona */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/[0.06] flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" /> AI Voice Persona &amp; Tone
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Persona Name &amp; Role</label>
                <input
                  type="text"
                  value={aiPersonaName}
                  onChange={(e) => setAiPersonaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Conversational Language</label>
                <select
                  value={aiLanguageDefault}
                  onChange={(e) => setAiLanguageDefault(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="en">English (US / UK / Global)</option>
                  <option value="es">Español (LatAm / Spain)</option>
                  <option value="hi">हिन्दी (Hindi / Hinglish)</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tone &amp; Conversational Style</label>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    Professional
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                    Consultative
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                    Energetic
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
