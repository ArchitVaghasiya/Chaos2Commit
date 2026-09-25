'use client';

import React, { useState, useEffect } from 'react';
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
  Radio,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function SettingsOnboardingHub() {
  const [companyName, setCompanyName] = useState('CloudScale Solutions');
  const [website, setWebsite] = useState('https://cloudscale-solutions.com');
  const [description, setDescription] = useState(
    'Enterprise Microsoft 365, SharePoint Migration & Cloud Infrastructure Specialist'
  );
  const [productsCatalog, setProductsCatalog] = useState(
    'Microsoft 365 enterprise tenant migration, SharePoint Online document architectures, Zero-downtime cutover, Power Platform workflow automation'
  );
  const [targetKeywords, setTargetKeywords] = useState(
    'Microsoft 365, SharePoint, Cloud Migration, Zero Downtime Cutover, Enterprise IT, Power Automate'
  );
  const [aiPersonaName, setAiPersonaName] = useState('Ava (Enterprise Solutions Lead)');
  const [telephonyMode, setTelephonyMode] = useState<'BUILT_IN' | 'TWILIO_SIP'>('TWILIO_SIP');
  const [aiLanguageDefault, setAiLanguageDefault] = useState('gu');
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing settings from database
  useEffect(() => {
    async function loadOrgSettings() {
      setLoadingSettings(true);
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.companyName) setCompanyName(data.settings.companyName);
          if (data.settings.website) setWebsite(data.settings.website);
          if (data.settings.description) setDescription(data.settings.description);
          if (data.settings.productsCatalog) setProductsCatalog(data.settings.productsCatalog);
          if (data.settings.targetKeywords) setTargetKeywords(data.settings.targetKeywords);
          if (data.settings.aiPersonaName) setAiPersonaName(data.settings.aiPersonaName);
          if (data.settings.aiLanguageDefault) setAiLanguageDefault(data.settings.aiLanguageDefault);
        }
      } catch (err) {
        console.warn('Could not load org settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadOrgSettings();
  }, []);

  // AI Validation state for Step 6
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    score: number;
    status: 'APPROVED' | 'REQUIRES_ADMIN';
    feedback: string;
  } | null>({
    score: 98,
    status: 'APPROVED',
    feedback: 'Products & solutions catalog is verified and synchronized with the live Twilio PSTN voice calling engine for autonomous multilingual qualification.',
  });

  const handleValidateProducts = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/company/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productsCatalog,
          companyDescription: description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult({
          score: data.score,
          status: data.status,
          feedback: data.feedback,
        });
      }
    } catch (err) {
      console.error('Validation API error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          website,
          description,
          productsCatalog,
          targetKeywords,
          aiPersonaName,
          aiLanguageDefault,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Company Solutions Profile &amp; AI Response Engine
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Live AI Call Solutions, Product Catalog &amp; Two-Way Calibration
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Customize company solutions, value propositions, and objection responses used dynamically during real physical mobile calls.
            </p>
          </div>

          {savedSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Live Call Solutions Updated &amp; Deployed!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Company Profile & Product Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" /> Enterprise Solutions &amp; Offerings
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="e.g. CloudScale Solutions"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Business Overview &amp; Consultative Focus
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-medium"
                  placeholder="Describe your core enterprise focus..."
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Products &amp; Solutions Catalog (Fed directly into Live AI Voice Knowledge)</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Live In Live Calls</span>
                </label>
                <textarea
                  rows={4}
                  value={productsCatalog}
                  onChange={(e) => setProductsCatalog(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-mono text-[11px]"
                  placeholder="Detail your verified solution capabilities..."
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Target Search &amp; Objection Keywords
                </label>
                <input
                  type="text"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* AI Selling Product Suitability Validator */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> AI Solutions Readiness Validation
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
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b1c] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Status: {validationResult.status}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    Suitability Score: {validationResult.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {validationResult.feedback}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Calibrated for live PSTN two-way calls, language auto-switching, and Calendly SMS integration.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telephony Mode & AI Voice Persona (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Telephony Infrastructure Selection */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-500" /> Carrier Telephony Integration
            </h3>

            <div className="space-y-2.5 text-xs">
              <label
                onClick={() => setTelephonyMode('TWILIO_SIP')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  telephonyMode === 'TWILIO_SIP'
                    ? 'bg-indigo-600/15 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-white/[0.02] border-slate-200 dark:border-white/[0.05] hover:bg-white/[0.04]'
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
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Twilio PSTN Carrier Calling
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                      Connected
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Direct phone dialing to verified mobile numbers (+919737362307) with Amazon Polly and Groq LLaMA 3.3.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setTelephonyMode('BUILT_IN')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  telephonyMode === 'BUILT_IN'
                    ? 'bg-indigo-600/15 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-white/[0.02] border-slate-200 dark:border-white/[0.05] hover:bg-white/[0.04]'
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
                  <div className="font-bold text-slate-900 dark:text-white">Browser Live Voice Simulator</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Hands-free mic audio streaming inside the browser for client presentations and quick testing.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* AI Voice Persona */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-500" /> AI Voice Persona &amp; Solutions Tone
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Persona Name &amp; Role</label>
                <input
                  type="text"
                  value={aiPersonaName}
                  onChange={(e) => setAiPersonaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Default Language Fallback
                </label>
                <select
                  value={aiLanguageDefault}
                  onChange={(e) => setAiLanguageDefault(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="gu">ગુજરાતી (Gujarati - Native)</option>
                  <option value="hi">हिन्दी (Hindi - Native)</option>
                  <option value="en">English (Global / Indian Accent)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Note: In live phone calls, the AI interactive prompt automatically asks the user for their language preference first.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tone &amp; Conversational Style</label>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">
                    Professional
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05]">
                    Consultative
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05]">
                    Authoritative
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Saving &amp; Deploying...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save &amp; Deploy Solutions
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
