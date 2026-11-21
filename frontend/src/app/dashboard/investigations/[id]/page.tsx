'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Copy,
  Terminal,
  ExternalLink,
  Layers,
  Database,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

import RiskGauge from '@/components/dashboard/RiskGauge';
import AgentTimeline from '@/components/dashboard/AgentTimeline';
import { mockInvestigations, InvestigationItem } from '@/lib/mockData';

export default function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Locate matching investigation or fallback to first
  const investigation: InvestigationItem =
    mockInvestigations.find((item) => item.id.toLowerCase() === id.toLowerCase()) ||
    mockInvestigations[0];

  const handleCopyReport = () => {
    navigator.clipboard?.writeText(
      `AEGISOS Security Investigation Report\nID: ${investigation.id}\nRisk Score: ${investigation.riskScore}/100 (${investigation.riskLevel})\nThreat: ${investigation.threatCategory}\nInput: ${investigation.fullInput || investigation.inputPreview}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this investigation record?')) {
      setDeleted(true);
      setTimeout(() => {
        router.push('/dashboard/investigations');
      }, 1000);
    }
  };

  if (deleted) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FF4560]/10 flex items-center justify-center text-[#FF4560]">
          <Trash2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#F4F7FB]">Investigation Deleted</h2>
        <p className="text-xs text-[#8794A8]">Redirecting back to investigation logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/investigations"
            className="p-2 rounded-lg bg-white/5 text-[#8794A8] hover:text-[#F4F7FB] border border-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#00E5FF] font-bold">{investigation.id}</span>
              <span className="text-xs text-[#8794A8]">• {investigation.timestamp}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#F4F7FB]">
              Investigation Forensic Dossier
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F4F7FB] border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>{copied ? 'Copied Report!' : 'Share Report'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF4560]/10 hover:bg-[#FF4560]/20 text-xs font-semibold text-[#FF4560] border border-[#FF4560]/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Summary Card: Input, Risk Score large gauge, Threat category, status */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 flex justify-center">
          <RiskGauge score={investigation.riskScore} size={220} label="Consensus Risk Score" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
                investigation.riskLevel === 'critical'
                  ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30'
                  : investigation.riskLevel === 'high'
                  ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                  : 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
              }`}
            >
              {investigation.riskLevel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              {investigation.threatCategory}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-white/5 text-[#8794A8]">
              Status: {investigation.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8794A8] block mb-1">
              Investigated Input / Artifact
            </span>
            <p className="text-xs md:text-sm font-mono bg-[#080B12] p-3 rounded-xl border border-white/5 text-[#F4F7FB] break-all">
              {investigation.fullInput || investigation.inputPreview}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8794A8] block mb-1">
              Multi-Agent Verdict
            </span>
            <p className="text-xs text-[#8794A8] leading-relaxed">
              {investigation.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Agent Swarm Execution Timeline */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        <AgentTimeline steps={investigation.steps} title="Autonomous Multi-Agent Swarm Timeline" />
      </div>

      {/* Forensic Evidence & Matched Signatures */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
            Forensic Evidence & Matched Patterns
          </h3>
        </div>

        {investigation.matchedPatterns.length > 0 && (
          <div>
            <span className="text-[11px] font-mono uppercase text-[#8794A8] block mb-2">
              Behavioral Pattern Signatures
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {investigation.matchedPatterns.map((pat, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#080B12] border border-white/5 text-xs font-mono text-[#00E5FF] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  <span>{pat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Threat Indicators Table */}
        <div className="pt-2">
          <span className="text-[11px] font-mono uppercase text-[#8794A8] block mb-2">
            Correlated Threat Indicators (IOCs)
          </span>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101725] text-[#8794A8] font-mono text-[10px] uppercase border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Reputation</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Matched Feed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#080B12]/60 font-mono">
                {investigation.indicators.map((ioc, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-[#00E5FF] uppercase font-bold">{ioc.type}</td>
                    <td className="py-2.5 px-3 text-[#F4F7FB]">{ioc.value}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ioc.reputation === 'malicious'
                            ? 'bg-[#FF4560]/15 text-[#FF4560]'
                            : ioc.reputation === 'suspicious'
                            ? 'bg-[#FFB020]/15 text-[#FFB020]'
                            : 'bg-[#00D68F]/15 text-[#00D68F]'
                        }`}
                      >
                        {ioc.reputation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#F4F7FB]">{ioc.confidence}%</td>
                    <td className="py-2.5 px-3 text-[#8794A8]">{ioc.matchedList || 'Global Threat Matrix'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-[#00D68F]" />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
            Mitigation & Remediation Steps
          </h3>
        </div>
        <ul className="space-y-2">
          {investigation.recommendations.map((rec, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-xs text-[#F4F7FB]/90 bg-[#080B12]/60 p-3 rounded-lg border border-white/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] mt-1.5 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
