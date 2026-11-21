'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';

export const RECHARTS_COLORS = [
  '#00E5FF', // Cyan
  '#7C4DFF', // Purple
  '#00D68F', // Success Green
  '#FFB020', // Warning Yellow
  '#FF4560', // Critical Red
  '#8794A8', // Muted Gray
];

// Custom Glassmorphic Tooltip
export const CustomGlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-[#151E2D]/95 backdrop-blur-xl border border-white/10 p-3 shadow-2xl text-xs font-mono">
        {label && <p className="font-semibold text-[#F4F7FB] mb-1.5 border-b border-white/10 pb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-[#8794A8]">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill || '#00E5FF' }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-[#F4F7FB]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Donut Chart Component
export function ThreatDonutChart({
  data,
  height = 260,
  innerRadius = 60,
  outerRadius = 85,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className="w-full flex items-center justify-center text-xs text-[#8794A8]">Loading chart...</div>;
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomGlassTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || RECHARTS_COLORS[index % RECHARTS_COLORS.length]}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: '11px', color: '#8794A8' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Risk Area Trend Chart
export function RiskAreaTrendChart({
  data,
  height = 260,
}: {
  data: { date: string; riskScore: number; threatsDetected?: number }[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className="w-full flex items-center justify-center text-xs text-[#8794A8]">Loading trend chart...</div>;
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="threatAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7C4DFF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#8794A8"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#8794A8"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomGlassTooltip />} />
          <Area
            type="monotone"
            dataKey="riskScore"
            name="Risk Score Index"
            stroke="#00E5FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#riskAreaGrad)"
          />
          {data[0]?.threatsDetected !== undefined && (
            <Area
              type="monotone"
              dataKey="threatsDetected"
              name="Threats Detected"
              stroke="#7C4DFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#threatAreaGrad)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Generic Bar Chart Component
export function ThreatBarChart({
  data,
  height = 260,
  dataKey = 'count',
  xAxisKey = 'category',
  layout = 'horizontal',
}: {
  data: any[];
  height?: number;
  dataKey?: string;
  xAxisKey?: string;
  layout?: 'horizontal' | 'vertical';
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className="w-full flex items-center justify-center text-xs text-[#8794A8]">Loading bar chart...</div>;
  }

  const isVertical = layout === 'vertical';

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: isVertical ? 20 : -15, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          {isVertical ? (
            <>
              <XAxis type="number" stroke="#8794A8" fontSize={10} tickLine={false} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                stroke="#8794A8"
                fontSize={10}
                tickLine={false}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} stroke="#8794A8" fontSize={10} tickLine={false} />
              <YAxis stroke="#8794A8" fontSize={10} tickLine={false} />
            </>
          )}
          <Tooltip content={<CustomGlassTooltip />} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`bar-cell-${index}`}
                fill={entry.fill || RECHARTS_COLORS[index % RECHARTS_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
