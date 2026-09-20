'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Calendar, Sparkles } from 'lucide-react';

interface CampaignPerformanceChartProps {
  currentLanguage?: string;
}

const TRANSLATIONS: Record<string, {
  title: string;
  subtitle: string;
  calls: string;
  conversations: string;
  interested: string;
  meetings: string;
  conversion: string;
  totalCalls: string;
  avgConversion: string;
  peakDay: string;
  dates: string[];
}> = {
  English: {
    title: 'Campaign Performance',
    subtitle: 'Daily outbound call volumes, conversations, and meeting bookings over time',
    calls: 'Calls',
    conversations: 'Conversations',
    interested: 'Interested',
    meetings: 'Meetings',
    conversion: 'Conversion',
    totalCalls: '3,390 Outbound Calls',
    avgConversion: '9.2% Conversion Rate',
    peakDay: 'Peak: May 29',
    dates: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'],
  },
  Español: {
    title: 'Rendimiento de la Campaña',
    subtitle: 'Volúmenes diarios de llamadas salientes, conversaciones y reuniones agendadas',
    calls: 'Llamadas',
    conversations: 'Conversaciones',
    interested: 'Interesados',
    meetings: 'Reuniones',
    conversion: 'Conversión',
    totalCalls: '3,390 Llamadas Realizadas',
    avgConversion: '9.2% Tasa de Conversión',
    peakDay: 'Pico: 29 de Mayo',
    dates: ['1 May', '8 May', '15 May', '22 May', '29 May'],
  },
  हिन्दी: {
    title: 'अभियान प्रदर्शन',
    subtitle: 'दैनिक आउटबाउंड कॉल, बातचीत और समय के साथ मीटिंग बुकिंग का रुझान',
    calls: 'कॉल्स',
    conversations: 'बातचीत',
    interested: 'इच्छुक',
    meetings: 'मीटिंग्स',
    conversion: 'रूपांतरण',
    totalCalls: '3,390 आउटबाउंड कॉल्स',
    avgConversion: '9.2% रूपांतरण दर',
    peakDay: 'सर्वोच्च: 29 मई',
    dates: ['1 मई', '8 मई', '15 मई', '22 मई', '29 मई'],
  },
  Français: {
    title: 'Performance des Campagnes',
    subtitle: 'Volumes quotidiens d’appels, conversations et réservations de réunions',
    calls: 'Appels',
    conversations: 'Conversations',
    interested: 'Intéressés',
    meetings: 'Réunions',
    conversion: 'Conversion',
    totalCalls: '3 390 Appels Émis',
    avgConversion: 'Taux de Conversion 9.2%',
    peakDay: 'Pic: 29 Mai',
    dates: ['1 Mai', '8 Mai', '15 Mai', '22 Mai', '29 Mai'],
  },
  Deutsch: {
    title: 'Kampagnenleistung',
    subtitle: 'Tägliches ausgehendes Anrufvolumen, Gespräche und Meetingbuchungen',
    calls: 'Anrufe',
    conversations: 'Gespräche',
    interested: 'Interessiert',
    meetings: 'Meetings',
    conversion: 'Konversion',
    totalCalls: '3.390 Ausgehende Anrufe',
    avgConversion: '9,2% Konversionsrate',
    peakDay: 'Spitze: 29. Mai',
    dates: ['1. Mai', '8. Mai', '15. Mai', '22. Mai', '29. Mai'],
  },
  العربية: {
    title: 'أداء الحملة',
    subtitle: 'حجم المكالمات الصادرة اليومية والمحادثات والاجتماعات المحجوزة بمرور الوقت',
    calls: 'المكالمات',
    conversations: 'المحادثات',
    interested: 'المهتمين',
    meetings: 'الاجتماعات',
    conversion: 'معدل التحويل',
    totalCalls: '3,390 مكالمة صادرة',
    avgConversion: '9.2% معدل التحويل',
    peakDay: 'الذروة: 29 مايو',
    dates: ['1 مايو', '8 مايو', '15 مايو', '22 مايو', '29 مايو'],
  },
};

export default function CampaignPerformanceChart({ currentLanguage = 'English' }: CampaignPerformanceChartProps) {
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.English;
  const dates = t.dates;

  // Chart Coordinate System (880x320 with balanced margins)
  // Left: 55, Right: 45 (Plot width: 780, 4 intervals of 195px)
  // Top: 30, Bottom: 50 (Plot height: 240, from y=30 to y=270)
  const xCoords = [55, 250, 445, 640, 835];
  const baseY = 270;
  const plotHeight = 240; // max val = 1000

  const getY = (val: number) => Math.round(baseY - (val / 1000) * plotHeight);

  const seriesData = [
    {
      id: 'calls',
      name: t.calls,
      color: '#3b82f6',
      gradientId: 'gradCalls',
      values: [380, 560, 680, 790, 980],
    },
    {
      id: 'conversations',
      name: t.conversations,
      color: '#a855f7',
      gradientId: 'gradConv',
      values: [240, 390, 510, 620, 780],
    },
    {
      id: 'interested',
      name: t.interested,
      color: '#10b981',
      gradientId: 'gradInt',
      values: [110, 190, 280, 380, 510],
    },
    {
      id: 'meetings',
      name: t.meetings,
      color: '#f59e0b',
      gradientId: 'gradMeet',
      values: [32, 68, 112, 195, 312],
    },
  ];

  // Helper to generate smooth cubic bezier curves
  const generatePath = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Helper to generate closed area path for gradient fills
  const generateAreaPath = (pts: { x: number; y: number }[]) => {
    const linePath = generatePath(pts);
    return `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
  };

  const gridLevels = [
    { label: '1,000', y: getY(1000) },
    { label: '750', y: getY(750) },
    { label: '500', y: getY(500) },
    { label: '250', y: getY(250) },
    { label: '0', y: baseY },
  ];

  return (
    <div className="glass-card p-5 sm:p-6 mb-6 border-slate-200 dark:border-white/[0.06] shadow-xl relative overflow-hidden">
      {/* Header with Title and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {seriesData.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full relative select-none">
        <svg
          viewBox="0 0 880 320"
          className="w-full h-auto aspect-[880/320] max-h-[380px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {seriesData.map((s) => (
              <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.16" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.00" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Grid lines and Y-axis Labels */}
          {gridLevels.map((grid, idx) => (
            <g key={idx}>
              <line
                x1="55"
                y1={grid.y}
                x2="835"
                y2={grid.y}
                className="stroke-slate-200 dark:stroke-white/[0.08]"
                strokeDasharray="5 5"
                strokeWidth="1"
              />
              <text
                x="45"
                y={grid.y + 4}
                fill="#64748b"
                fontSize="11"
                fontWeight="500"
                textAnchor="end"
                className="select-none font-sans"
              >
                {grid.label}
              </text>
            </g>
          ))}

          {/* Vertical Date Grid Lines & Hover Zones */}
          {dates.map((date, idx) => {
            const x = xCoords[idx];
            const isHovered = activeHoverIndex === idx;

            return (
              <g key={idx}>
                {/* Subtle vertical indicator line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1="30"
                    x2={x}
                    y2={baseY}
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="opacity-70"
                  />
                )}

                {/* X-axis Date Labels */}
                <text
                  x={x}
                  y={baseY + 22}
                  fill={isHovered ? '#6366f1' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  textAnchor="middle"
                  className="transition-colors font-sans"
                >
                  {date}
                </text>

                {/* Invisible wide interactive hover strip */}
                <rect
                  x={x - 90}
                  y="20"
                  width="180"
                  height={baseY}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveHoverIndex(idx)}
                  onMouseLeave={() => setActiveHoverIndex(null)}
                />
              </g>
            );
          })}

          {/* Area Fills under curves */}
          {seriesData.map((s) => {
            const points = s.values.map((val, idx) => ({ x: xCoords[idx], y: getY(val) }));
            return (
              <path
                key={`area-${s.id}`}
                d={generateAreaPath(points)}
                fill={`url(#${s.gradientId})`}
                className="pointer-events-none"
              />
            );
          })}

          {/* Line Curves */}
          {seriesData.map((s, sIdx) => {
            const points = s.values.map((val, idx) => ({ x: xCoords[idx], y: getY(val) }));
            return (
              <g key={`line-${s.id}`}>
                <motion.path
                  d={generatePath(points)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 4px 8px ${s.color}40)` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 1.2, ease: 'easeInOut', delay: sIdx * 0.15 }}
                />

                {/* Data Points / Circles */}
                {points.map((p, pIdx) => {
                  const isPointHovered = activeHoverIndex === pIdx;
                  return (
                    <circle
                      key={pIdx}
                      cx={p.x}
                      cy={p.y}
                      r={isPointHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke={s.color}
                      strokeWidth={isPointHovered ? 3 : 2.2}
                      className="cursor-pointer transition-all duration-200 dark:fill-[#0c1228]"
                      onMouseEnter={() => setActiveHoverIndex(pIdx)}
                      onMouseLeave={() => setActiveHoverIndex(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card on Hover */}
        {activeHoverIndex !== null && (
          <div
            className="absolute -top-3 z-30 p-3 rounded-xl bg-white/95 dark:bg-[#0c1432]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150"
            style={{
              left: `${(xCoords[activeHoverIndex] / 880) * 100}%`,
              transform:
                activeHoverIndex > 2
                  ? 'translateX(calc(-100% - 14px))'
                  : 'translateX(14px)',
            }}
          >
            <div className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 border-b border-slate-200 dark:border-white/[0.08] pb-1.5 mb-2 flex items-center justify-between gap-4">
              <span>{dates[activeHoverIndex]}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                {((seriesData[3].values[activeHoverIndex] / seriesData[0].values[activeHoverIndex]) * 100).toFixed(1)}% {t.conversion}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {seriesData.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {s.values[activeHoverIndex].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer KPI Highlights */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t.totalCalls}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t.avgConversion}
          </span>
          <span className="text-purple-500 font-semibold">
            {t.peakDay}
          </span>
        </div>
      </div>
    </div>
  );
}
