'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  MessageSquare,
  QrCode,
  Smartphone,
  Wifi,
  Cpu,
  Search,
  UploadCloud,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  Activity,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

import TrustScore from '@/components/dashboard/TrustScore';
import StatCard from '@/components/dashboard/StatCard';
import { ThreatDonutChart, RiskAreaTrendChart } from '@/components/dashboard/ThreatChart';
import {
  mockTrustScore,
  mockOverviewStats,
  mockProtectionModules,
  mockRecentEvents,
  mockThreatDistribution,
  mockRiskTrend30Days,
} from '@/lib/mockData';

const iconMap: Record<string, any> = {
  Globe,
  MessageSquare,
  QrCode,
  Smartphone,
  Wifi,
  Cpu,
};

export default function SecurityOverviewPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '7d' | '24h'>('30d');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              Security Operations Center
            </span>
            <span className="text-xs text-[#8794A8] font-mono">Live Defense Matrix</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
            Security Overview
          </h1>
          <p className="text-xs md:text-sm text-[#8794A8]">
            Real-time telemetry, autonomous agent swarms, and active threat neutralization.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/scanner?tab=url"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 transition-colors text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.15)]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Scan URL</span>
          </Link>
          <Link
            href="/dashboard/scanner?tab=message"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#7C4DFF]/10 text-[#7C4DFF] border border-[#7C4DFF]/30 hover:bg-[#7C4DFF]/20 transition-colors text-xs font-semibold shadow-[0_0_15px_rgba(124,77,255,0.15)]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Analyze Message</span>
          </Link>
          <Link
            href="/dashboard/scanner?tab=image"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 text-[#F4F7FB] border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00D68F]" />
            <span>Upload Image</span>
          </Link>
        </div>
      </div>

      {/* Top Section: Trust Score & 4 Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Digital Trust Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7C4DFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8794A8]">
              Posture Health
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#00D68F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
              Optimal
            </span>
          </div>

          <TrustScore
            score={mockTrustScore.current}
            size={210}
            strokeWidth={14}
            label="Digital Trust Score"
            sublabel="Confidence index calculated from 6 protection layers"
          />

          <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5 text-center">
            <div className="p-2 rounded-lg bg-[#080B12]/50 border border-white/5">
              <span className="text-[10px] text-[#8794A8] uppercase font-mono">30D Momentum</span>
              <p className="text-sm font-bold text-[#00D68F] font-mono">+{mockTrustScore.change} pts</p>
            </div>
            <div className="p-2 rounded-lg bg-[#080B12]/50 border border-white/5">
              <span className="text-[10px] text-[#8794A8] uppercase font-mono">Consensus</span>
              <p className="text-sm font-bold text-[#00E5FF] font-mono">99.4% Multi-AI</p>
            </div>
          </div>
        </motion.div>

        {/* 4 Stats Cards Grid (2x2 on desktop) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockOverviewStats.map((stat, idx) => {
            const icons = [Search, ShieldAlert, FileCheck2, Activity];
            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                max={stat.max}
                change={stat.change}
                trend={stat.trend}
                subtext={stat.subtext}
                color={stat.color}
                icon={icons[idx % icons.length]}
                delay={idx}
              />
            );
          })}
        </div>
      </div>

      {/* Protection Modules Status Row (6 modules) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
              Autonomous Protection Modules
            </h2>
          </div>
          <span className="text-xs text-[#00D68F] font-mono bg-[#00D68F]/10 px-2 py-0.5 rounded border border-[#00D68F]/20">
            6 of 6 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {mockProtectionModules.map((module, i) => {
            const Icon = iconMap[module.iconName] || Globe;
            const isActive = module.status === 'active';

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-4 hover:border-[#00E5FF]/20 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#00E5FF] group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    {/* Status dot */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive
                            ? 'bg-[#00D68F] shadow-[0_0_8px_#00D68F]'
                            : 'bg-[#8794A8]'
                        }`}
                      />
                      <span className="text-[10px] uppercase font-mono font-semibold text-[#8794A8]">
                        {isActive ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-[#F4F7FB]">{module.name}</h3>
                  <p className="text-[11px] text-[#8794A8] mt-1 line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8794A8]">
                  <span>Last active</span>
                  <span className="text-[#F4F7FB]">{module.lastActivity}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts & Trends: 3-column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Level Trend Area Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
                Risk Level Trend
              </h3>
              <p className="text-xs text-[#8794A8]">
                Composite severity score fluctuations over time
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-lg border border-white/5 text-xs">
              {(['30d', '7d', '24h'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTimeframe(t)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    selectedTimeframe === t
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-semibold'
                      : 'text-[#8794A8] hover:text-[#F4F7FB]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <RiskAreaTrendChart
              data={
                selectedTimeframe === '7d'
                  ? mockRiskTrend30Days.slice(-7)
                  : selectedTimeframe === '24h'
                  ? mockRiskTrend30Days.slice(-3)
                  : mockRiskTrend30Days
              }
              height={260}
            />
          </div>
        </div>

        {/* Right 1 Col: Threat Distribution Donut Chart */}
        <div className="lg:col-span-1 rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Threat Distribution
            </h3>
            <p className="text-xs text-[#8794A8]">
              Observed vector composition (Last 30 Days)
            </p>
          </div>

          <div className="mt-2">
            <ThreatDonutChart data={mockThreatDistribution} height={250} />
          </div>
        </div>
      </div>

      {/* Recent Security Events: Timeline list of last 10 events */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Recent Security Events
            </h3>
          </div>
          <Link
            href="/dashboard/investigations"
            className="flex items-center gap-1 text-xs text-[#00E5FF] hover:underline font-mono"
          >
            <span>View Full Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {mockRecentEvents.map((event, idx) => {
            let severityBadgeColor = 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30';
            let IconComponent = ShieldCheck;

            if (event.severity === 'critical') {
              severityBadgeColor = 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30';
              IconComponent = ShieldAlert;
            } else if (event.severity === 'warning') {
              severityBadgeColor = 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30';
              IconComponent = AlertCircle;
            } else if (event.severity === 'info') {
              severityBadgeColor = 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30';
              IconComponent = Activity;
            }

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-[#00E5FF] mt-0.5 shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#F4F7FB]">
                        {event.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${severityBadgeColor}`}
                      >
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#8794A8] mt-1 line-clamp-1">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono text-[11px] text-[#8794A8]">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                    {event.source}
                  </span>
                  <span>{event.timestamp}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
