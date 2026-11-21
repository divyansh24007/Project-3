'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Globe,
  Link as LinkIcon,
  Server,
  Search,
  ShieldAlert,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  Tag,
  Code,
  Terminal,
} from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import { ThreatBarChart } from '@/components/dashboard/ThreatChart';
import { mockThreatIntelligence } from '@/lib/mockData';

export default function ThreatIntelligencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { stats, indicators, categoryDistribution, knownPatterns } = mockThreatIntelligence;

  // Filter indicators by search and category
  const filteredIndicators = useMemo(() => {
    return indicators.filter((item) => {
      const matchesSearch =
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || item.type.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [indicators, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              Global Cyber Recon
            </span>
            <span className="text-xs text-[#8794A8] font-mono">IOC Threat Feeds</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
            Threat Intelligence
          </h1>
          <p className="text-xs md:text-sm text-[#8794A8]">
            Curated global indicators of compromise (IOCs), reverse proxy heuristics, and active campaign tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#00D68F] bg-[#00D68F]/10 px-3 py-1.5 rounded-lg border border-[#00D68F]/20">
          <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-ping" />
          <span>Sync Active • Feeds Updated 5m ago</span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Indicators"
          value={stats.totalIndicators}
          change="+1,420"
          trend="up"
          subtext="Across 14 global feeds"
          color="#00E5FF"
          icon={Database}
          delay={0}
        />
        <StatCard
          label="Phishing Domains"
          value={stats.phishingDomains}
          change="+340 today"
          trend="up"
          subtext="Lookalike & punycode"
          color="#FF4560"
          icon={Globe}
          delay={1}
        />
        <StatCard
          label="Malicious URLs"
          value={stats.maliciousUrls}
          change="+890 today"
          trend="up"
          subtext="Active credential hooks"
          color="#FFB020"
          icon={LinkIcon}
          delay={2}
        />
        <StatCard
          label="Suspicious IPs"
          value={stats.suspiciousIps}
          change="-45 mitigated"
          trend="down"
          subtext="Bulletproof ASNs"
          color="#7C4DFF"
          icon={Server}
          delay={3}
        />
      </div>

      {/* Threat Category Distribution (Bar Chart) */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Threat Category Volume Distribution
            </h3>
            <p className="text-xs text-[#8794A8]">
              Active threats cataloged in AEGISOS Intelligence Matrix
            </p>
          </div>
          <span className="text-xs font-mono text-[#00E5FF] bg-white/5 px-2.5 py-1 rounded">
            18,492 Active IOCs
          </span>
        </div>

        <ThreatBarChart
          data={categoryDistribution}
          dataKey="count"
          xAxisKey="category"
          height={260}
        />
      </div>

      {/* Threat Search and Indicators Table */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-2 border-b border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
              Live Threat Indicators Table
            </h3>
            <p className="text-xs text-[#8794A8]">
              Search active domain, URL, IP, or cryptographic hash signatures
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8794A8] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain / URL / IP..."
                className="pl-8 pr-4 py-1.5 rounded-lg bg-[#080B12] border border-white/10 text-xs text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#00E5FF]/40 font-mono w-60"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#080B12] border border-white/10 text-xs text-[#F4F7FB] font-mono focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="ip">IP</option>
              <option value="hash">File Hash</option>
            </select>
          </div>
        </div>

        {/* Indicators Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101725] text-[#8794A8] font-mono text-[10px] uppercase border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Indicator Value</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Tags</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredIndicators.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 uppercase font-bold text-[#00E5FF]">
                    {item.type}
                  </td>
                  <td className="py-3 px-3 text-[#F4F7FB] max-w-xs truncate font-semibold">
                    {item.value}
                  </td>
                  <td className="py-3 px-3 text-[#8794A8] font-sans">
                    {item.category}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.severity === 'critical'
                          ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30'
                          : item.severity === 'warning'
                          ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                          : 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#F4F7FB]">{item.confidence}%</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#8794A8]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        item.status === 'active'
                          ? 'text-[#FF4560] bg-[#FF4560]/10'
                          : item.status === 'mitigated'
                          ? 'text-[#00D68F] bg-[#00D68F]/10'
                          : 'text-[#8794A8] bg-white/5'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Known Phishing Patterns List */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Fingerprint className="w-4 h-4 text-[#7C4DFF]" />
          <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
            Known Phishing Patterns & Attack Signatures
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knownPatterns.map((pat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#080B12]/60 border border-white/5 space-y-2 hover:border-[#7C4DFF]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs md:text-sm font-bold text-[#F4F7FB]">
                  {pat.title}
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#FF4560]/15 text-[#FF4560] border border-[#FF4560]/20 text-[10px] font-mono font-bold uppercase">
                  {pat.riskRating}
                </span>
              </div>
              <p className="text-xs text-[#8794A8] leading-relaxed">
                {pat.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8794A8] border-t border-white/5">
                <span className="text-[#00E5FF]">{pat.threatType}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-[#7C4DFF]">
                  {pat.signature}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
