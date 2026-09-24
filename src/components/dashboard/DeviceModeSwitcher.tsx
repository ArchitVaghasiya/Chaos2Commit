'use client';

import React from 'react';
import { Monitor, Smartphone, Apple, Sparkles } from 'lucide-react';

interface DeviceModeSwitcherProps {
  deviceMode: 'desktop' | 'mobile';
  setDeviceMode: (mode: 'desktop' | 'mobile') => void;
  mobilePlatform?: 'android' | 'ios';
  setMobilePlatform?: (platform: 'android' | 'ios') => void;
}

export default function DeviceModeSwitcher({
  deviceMode,
  setDeviceMode,
  mobilePlatform = 'ios',
  setMobilePlatform,
}: DeviceModeSwitcherProps) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/80 dark:bg-[#0b1026]/90 border border-slate-200 dark:border-indigo-500/20 shadow-md backdrop-blur-md">
      <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#070a1a] border border-slate-200 dark:border-white/[0.05] text-xs">
        <button
          type="button"
          onClick={() => setDeviceMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            deviceMode === 'desktop'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Switch to Full Desktop SaaS Experience"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Web Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            deviceMode === 'mobile'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Preview Mobile App (Android & iOS)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile App (Android / iOS)</span>
        </button>
      </div>

      {deviceMode === 'mobile' && setMobilePlatform && (
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#070a1a] border border-slate-200 dark:border-white/[0.05] text-xs animate-in fade-in">
          <button
            type="button"
            onClick={() => setMobilePlatform('ios')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              mobilePlatform === 'ios'
                ? 'bg-black/30 text-white font-bold border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Apple className="w-3 h-3" />
            <span>iOS</span>
          </button>
          <button
            type="button"
            onClick={() => setMobilePlatform('android')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              mobilePlatform === 'android'
                ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Android</span>
          </button>
        </div>
      )}
    </div>
  );
}
