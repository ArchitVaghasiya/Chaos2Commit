'use client';

import React, { useState } from 'react';

export default function CampaignPerformanceChart() {
  const [activeHoverPoint, setActiveHoverPoint] = useState<number | null>(null);

  const dates = ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'];

  // Trend data points (scaled to viewBox 0 0 500 180)
  // Calls (Blue), Conversations (Purple), Interested (Green), Meetings (Amber)
  const lines = [
    {
      name: 'Calls',
      color: '#3b82f6',
      points: [
        { x: 30, y: 120, val: 380 },
        { x: 130, y: 95, val: 560 },
        { x: 230, y: 80, val: 680 },
        { x: 330, y: 65, val: 790 },
        { x: 470, y: 40, val: 980 },
      ],
    },
    {
      name: 'Conversations',
      color: '#a855f7',
      points: [
        { x: 30, y: 140, val: 240 },
        { x: 130, y: 120, val: 390 },
        { x: 230, y: 105, val: 510 },
        { x: 330, y: 90, val: 620 },
        { x: 470, y: 70, val: 780 },
      ],
    },
    {
      name: 'Interested',
      color: '#10b981',
      points: [
        { x: 30, y: 155, val: 110 },
        { x: 130, y: 145, val: 190 },
        { x: 230, y: 135, val: 280 },
        { x: 330, y: 120, val: 380 },
        { x: 470, y: 100, val: 510 },
      ],
    },
    {
      name: 'Meetings',
      color: '#f59e0b',
      points: [
        { x: 30, y: 170, val: 32 },
        { x: 130, y: 165, val: 68 },
        { x: 230, y: 160, val: 112 },
        { x: 330, y: 150, val: 195 },
        { x: 470, y: 135, val: 312 },
      ],
    },
  ];

  // Generates smooth SVG cubic Bezier curve path
  const generatePath = (points: { x: number; y: number }[]) => {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  return (
    <div className="glass-card p-5 mb-6 border-white/[0.06] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-bold text-white">Campaign Performance</h3>

        {/* Legend matching reference design */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {lines.map((l) => (
            <div key={l.name} className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] font-medium">{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Multi-line Chart Container */}
      <div className="w-full relative">
        <svg
          viewBox="0 0 500 200"
          className="w-full h-44 sm:h-52 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines and Y-axis labels */}
          {[
            { y: 30, label: '1K' },
            { y: 65, label: '750' },
            { y: 105, label: '500' },
            { y: 145, label: '250' },
            { y: 180, label: '0' },
          ].map((grid, idx) => (
            <g key={idx}>
              <line
                x1="25"
                y1={grid.y}
                x2="485"
                y2={grid.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x="15"
                y={grid.y + 3}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {grid.label}
              </text>
            </g>
          ))}

          {/* Render Multi-lines */}
          {lines.map((line) => (
            <g key={line.name}>
              <path
                d={generatePath(line.points)}
                fill="none"
                stroke={line.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 4px 6px ${line.color}33)` }}
              />

              {/* Data points */}
              {line.points.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#070a14"
                  stroke={line.color}
                  strokeWidth="2"
                  className="transition-all hover:r-5 cursor-pointer"
                  onMouseEnter={() => setActiveHoverPoint(pIdx)}
                  onMouseLeave={() => setActiveHoverPoint(null)}
                />
              ))}
            </g>
          ))}

          {/* X Axis Dates */}
          {dates.map((date, idx) => {
            const xCoords = [30, 130, 230, 330, 470];
            return (
              <text
                key={idx}
                x={xCoords[idx]}
                y="198"
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
