'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DonutCharts() {

  const industries = [
    { label: 'IT Services', percent: 35, color: '#3b82f6' },
    { label: 'Software', percent: 25, color: '#a855f7' },
    { label: 'Consulting', percent: 15, color: '#06b6d4' },
    { label: 'Manufacturing', percent: 10, color: '#10b981' },
    { label: 'Others', percent: 15, color: '#f59e0b' },
  ];

  const sources = [
    { label: 'LinkedIn', percent: 45, color: '#2563eb' },
    { label: 'X (Twitter)', percent: 20, color: '#38bdf8' },
    { label: 'Websites', percent: 15, color: '#6366f1' },
    { label: 'Directories', percent: 10, color: '#c084fc' },
    { label: 'Others', percent: 10, color: '#ec4899' },
  ];

  const calculateDonutSlice = (percent: number, accumulatedPercent: number) => {
    const circumference = 2 * Math.PI * 36; // radius 36
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    return { strokeDasharray, strokeDashoffset };
  };

  // Helper to calculate SVG strokeDasharray & strokeDashoffset for donut slices
  const renderDonutSlices = (data: { label: string; percent: number; color: string }[]) => {
    let accumulatedPercent = 0;

    return data.map((item, index) => {
      const { strokeDasharray, strokeDashoffset } = calculateDonutSlice(item.percent, accumulatedPercent);
      accumulatedPercent += item.percent;

      return (
        <motion.circle
          key={index}
          cx="50"
          cy="50"
          r="36"
          fill="transparent"
          stroke={item.color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: 300 }} // Larger than circumference to start hidden
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-md hover:stroke-[13px]"
        />
      );
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 mb-6">
      {/* 1. Top Industries Donut */}
      <div className="glass-card p-4 border-slate-200 dark:border-white/[0.06] shadow-xl flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Top Industries</h4>

        <div className="flex items-center justify-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="transparent" className="stroke-slate-100 dark:stroke-white/5" strokeWidth="11" />
              {renderDonutSlices(industries)}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">Leads</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-[11px] flex-1">
            {industries.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 dark:text-slate-300 truncate">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 ml-2">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Lead Source Distribution Donut */}
      <div className="glass-card p-4 border-slate-200 dark:border-white/[0.06] shadow-xl flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Lead Source Distribution</h4>

        <div className="flex items-center justify-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="transparent" className="stroke-slate-100 dark:stroke-white/5" strokeWidth="11" />
              {renderDonutSlices(sources)}
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-[9px] text-slate-700 dark:text-slate-400">Total</span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">24,568</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-[11px] flex-1">
            {sources.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 dark:text-slate-300 truncate">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 ml-2">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
