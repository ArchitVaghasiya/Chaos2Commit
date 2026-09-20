'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Headphones,
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { getBillingTranslation } from '@/lib/i18n/billingTranslations';

interface BillingHubProps {
  currentLanguage?: string;
}

export default function BillingHub({ currentLanguage = 'English' }: BillingHubProps) {
  const [selectedPlan, setSelectedPlan] = useState('Growth');
  const [extraMinutes, setExtraMinutes] = useState(5000);

  const t = getBillingTranslation(currentLanguage);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {t.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs">
            <div className="text-[10px] text-slate-600 dark:text-slate-400">{t.currentPlanLabel}</div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t.currentPlanName}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{t.activeBadge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tier Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.plans.map((plan) => {
          const isSelected = selectedPlan.toLowerCase().includes(plan.name.toLowerCase()) || 
                             plan.name.toLowerCase().includes(selectedPlan.toLowerCase());
          return (
            <div
              key={plan.name}
              className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-white dark:bg-[#0f1638] border-indigo-500/60 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500/50'
                  : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-200 dark:border-white/[0.15]'
              }`}
            >
              {plan.popularBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-slate-900 dark:text-white shadow-md">
                  {plan.popularBadge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">{plan.period}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
                  {plan.description}
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-indigo-400" />
                    <span>{plan.minutes}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/[0.04]">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{plan.leads}</span>
                  </div>

                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan.name)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-700 dark:text-slate-200'
                }`}
              >
                {isSelected ? plan.activeButton : plan.switchButton}
              </button>
            </div>
          );
        })}
      </div>

      {/* Voice Minutes Top-Up Slider */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-purple-400" /> {t.sliderTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          {t.sliderSubtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <span>{t.selectedMinutesLabel}: {extraMinutes.toLocaleString()} {t.minsSuffix}</span>
              <span className="text-indigo-400 font-bold">${Math.round(extraMinutes * 0.06)} USD</span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={extraMinutes}
              onChange={(e) => setExtraMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-400">
              <span>1,000 {t.minsSuffix}</span>
              <span>25,000 {t.minsSuffix}</span>
              <span>50,000 {t.minsSuffix}</span>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              onClick={() => alert(t.purchaseAlert(extraMinutes.toLocaleString()))}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{t.addMinutesButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
