'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { mockAnalytics } from '@/lib/mockData';
import { CustomGlassTooltip, RECHARTS_COLORS } from '@/components/dashboard/ThreatChart';

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<'30d' | '14d' | '7d' | '24h'>('30d');
  const { summary, detectionTrends, scamCategories, severityDistribution, investigationVolume, scoreHistory } =
    mockAnalytics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              Deep Telemetry
            </span>
            <span className="text-xs text-[#8794A8] font-mono">Consolidated Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
            Analytics & Defense Metrics
          </h1>
          <p className="text-xs md:text-sm text-[#8794A8]">
            Multi-vector threat patterns, volumetric telemetry, and autonomous resolution metrics.
          </p>
        </div>

        {/* Date Range Picker Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#151E2D] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF] ml-2 mr-1" />
            {(['30d', '14d', '7d', '24h'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === range
                    ? 'bg-[#00E5FF] text-[#080B12] font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'text-[#8794A8] hover:text-[#F4F7FB]'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Exporting Analytics PDF Report...')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F4F7FB] border border-white/5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-[#8794A8]">Total Telemetry Scans</span>
          <p className="text-2xl font-black font-mono text-[#F4F7FB] mt-1">{summary.totalScans.toLocaleString()}</p>
          <span className="text-[11px] text-[#00D68F] font-mono">+21.4% MoM</span>
        </div>
        <div className="p-4 rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-[#8794A8]">Threat Intercept Ratio</span>
          <p className="text-2xl font-black font-mono text-[#FFB020] mt-1">{summary.threatRatio}</p>
          <span className="text-[11px] text-[#8794A8] font-mono">1,183 flagged items</span>
        </div>
        <div className="p-4 rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-[#8794A8]">Mean Swarm Resolution</span>
          <p className="text-2xl font-black font-mono text-[#00E5FF] mt-1">{summary.meanResolutionTime}</p>
          <span className="text-[11px] text-[#00D68F] font-mono">-35ms latency</span>
        </div>
        <div className="p-4 rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-[#8794A8]">Consensus Accuracy</span>
          <p className="text-2xl font-black font-mono text-[#00D68F] mt-1">{summary.accuracyRate}</p>
          <span className="text-[11px] text-[#8794A8] font-mono">0.02% false positive</span>
        </div>
      </div>

      {/* Row 1: Threat Detection Trends (Multi-line chart) */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Threat Detection Trends (Last 30 Days)
            </h3>
            <p className="text-xs text-[#8794A8]">
              Volume breakdown across primary vector categories over time
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#00E5FF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" /> Phishing
            </span>
            <span className="flex items-center gap-1.5 text-[#7C4DFF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C4DFF]" /> Smishing
            </span>
            <span className="flex items-center gap-1.5 text-[#FFB020]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020]" /> Malware
            </span>
            <span className="flex items-center gap-1.5 text-[#00D68F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F]" /> Network
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={detectionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#8794A8" fontSize={10} tickLine={false} />
              <YAxis stroke="#8794A8" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomGlassTooltip />} />
              <Line type="monotone" dataKey="phishing" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="smishing" stroke="#7C4DFF" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="malware" stroke="#FFB020" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="network" stroke="#00D68F" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Scam Category Distribution (Horizontal Bar Chart) & Threat Severity (Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scam Category Distribution (Horizontal Bar) */}
        <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Scam Category Distribution
            </h3>
            <p className="text-xs text-[#8794A8]">
              Frequency distribution by social engineering taxonomy
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={scamCategories}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#8794A8" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8794A8"
                  fontSize={10}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomGlassTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {scamCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RECHARTS_COLORS[index % RECHARTS_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Severity Distribution (Pie Chart) */}
        <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Threat Severity Distribution
            </h3>
            <p className="text-xs text-[#8794A8]">
              Severity classification across 4,890 total telemetry audits
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomGlassTooltip />} />
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#8794A8', paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Investigation Volume (Daily Bar Chart) & Security Score History (Area Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Investigation Volume */}
        <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Daily Investigation Volume
            </h3>
            <p className="text-xs text-[#8794A8]">
              Automated scan processing throughput per day of week
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investigationVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#8794A8" fontSize={10} tickLine={false} />
                <YAxis stroke="#8794A8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomGlassTooltip />} />
                <Bar dataKey="volume" name="Total Investigations" fill="#7C4DFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats" name="Threats Neutralized" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#8794A8', paddingTop: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Score History */}
        <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Security Trust Score History
            </h3>
            <p className="text-xs text-[#8794A8]">
              Four-week rolling posture improvement trajectory
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00D68F" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00D68F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="#8794A8" fontSize={10} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#8794A8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomGlassTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Trust Score"
                  stroke="#00D68F"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
