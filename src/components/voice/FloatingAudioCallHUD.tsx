'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Mic, 
  MicOff, 
  Maximize2, 
  PhoneOff, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { LeadItem } from '@/components/discovery/DiscoveredLeadCard';

interface FloatingAudioCallHUDProps {
  isOpen?: boolean;
  lead: LeadItem | null;
  durationSeconds?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onRestoreModal?: () => void;
  onExpand?: () => void;
  onEndCall?: () => void;
  onHangUp?: () => void;
  agentPersona?: string;
  defaultLanguage?: string;
}

export default function FloatingAudioCallHUD({
  isOpen = true,
  lead,
  durationSeconds,
  isMuted: externalMuted,
  onToggleMute,
  onRestoreModal,
  onExpand,
  onEndCall,
  onHangUp,
  agentPersona = 'Ava (Enterprise Solutions)',
}: FloatingAudioCallHUDProps) {
  const [pulseHeights, setPulseHeights] = useState<number[]>([40, 70, 30, 85, 55, 95, 45, 65]);
  const [internalSeconds, setInternalSeconds] = useState(0);
  const [internalMuted, setInternalMuted] = useState(false);

  useEffect(() => {
    if (durationSeconds !== undefined) return;
    const t = setInterval(() => {
      setInternalSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [durationSeconds]);

  const activeDuration = durationSeconds !== undefined ? durationSeconds : internalSeconds;
  const isMuted = externalMuted !== undefined ? externalMuted : internalMuted;

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      setInternalMuted((prev) => !prev);
    }
  };

  const handleExpand = () => {
    if (onExpand) onExpand();
    else if (onRestoreModal) onRestoreModal();
  };

  const handleHangUp = () => {
    if (onHangUp) onHangUp();
    else if (onEndCall) onEndCall();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseHeights([
        Math.floor(25 + Math.random() * 70),
        Math.floor(35 + Math.random() * 65),
        Math.floor(20 + Math.random() * 75),
        Math.floor(40 + Math.random() * 60),
        Math.floor(30 + Math.random() * 70),
        Math.floor(45 + Math.random() * 55),
        Math.floor(20 + Math.random() * 75),
        Math.floor(35 + Math.random() * 65),
      ]);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass-card p-3.5 bg-white/95 dark:bg-[#0a0f26]/95 border-slate-200/90 dark:border-emerald-500/40 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3.5 max-w-sm sm:max-w-md border ring-1 ring-emerald-500/20 transition-colors">
        
        {/* Pulsing AI Persona Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>

        {/* Lead & Call Status Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-[13px] font-heading font-bold text-slate-900 dark:text-white truncate">
              {lead.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 tabular-nums">
              {formatDuration(activeDuration)}
            </span>
          </div>

          <div className="text-[12px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
            {lead.companyName} • <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{agentPersona.split(' ')[0]}</span> speaking
          </div>

          {/* Real-time sound wave frequency visualizer */}
          <div className="flex items-center gap-1 h-3 mt-1.5">
            {pulseHeights.map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-150"
                style={{ height: `${isMuted ? 4 : h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Quick Call Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200/80 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              isMuted
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/10'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleExpand}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 transition-all cursor-pointer"
            title="Expand Full Call Studio"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleHangUp}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
            title="Hang Up"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
