'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle,
  MessageSquare,
  Globe,
  QrCode,
  Smartphone,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Layers,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';

import RiskGauge from '@/components/dashboard/RiskGauge';
import AgentTimeline from '@/components/dashboard/AgentTimeline';
import ScannerAnimation from '@/components/dashboard/ScannerAnimation';
import { api, ScanResult } from '@/lib/api';
import { mockDemoScenarios } from '@/lib/mockData';

const scenarioIcons: Record<string, any> = {
  message: MessageSquare,
  url: Globe,
  qr: QrCode,
  app: Smartphone,
};

export default function DemoModePage() {
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<Record<string, ScanResult>>({});
  const [activeResults, setActiveResults] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunScenario = async (scenarioId: string) => {
    setRunningScenarioId(scenarioId);

    try {
      // Map mock scenario id to backend scenario if needed
      const backendId = scenarioId.startsWith('scenario-')
        ? scenarioId
        : scenarioId === 'demo-1'
        ? 'scenario-1'
        : scenarioId === 'demo-2'
        ? 'scenario-2'
        : scenarioId === 'demo-3'
        ? 'scenario-3'
        : scenarioId === 'demo-4'
        ? 'scenario-4'
        : scenarioId === 'demo-5'
        ? 'scenario-5'
        : 'scenario-1';

      const result = await api.runDemo(backendId);
      setLiveResults((prev) => ({ ...prev, [scenarioId]: result }));
      setActiveResults((prev) => ({ ...prev, [scenarioId]: true }));
    } catch (err) {
      console.error('Failed to run demo scenario:', err);
      // Fallback to active display
      setActiveResults((prev) => ({ ...prev, [scenarioId]: true }));
    } finally {
      setRunningScenarioId(null);
    }
  };

  const toggleResult = (scenarioId: string) => {
    setActiveResults((prev) => ({ ...prev, [scenarioId]: !prev[scenarioId] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Prominent Demo Mode Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#7C4DFF]/25 via-[#00E5FF]/15 to-[#151E2D] border border-[#00E5FF]/30 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] mt-1 shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-widest uppercase bg-[#00E5FF] text-[#080B12]">
                DEMO MODE
              </span>
              <span className="text-xs font-mono text-[#00D68F] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
                Live Swarm Connected
              </span>
            </div>
            <h2 className="text-lg md:text-2xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
              Interactive Multi-Vector Attack Simulator
            </h2>
            <p className="text-xs md:text-sm text-[#8794A8] mt-0.5 leading-relaxed">
              Experience AEGISOS autonomous detection swarms across banking smishing, typosquatting, quishing, and Web3 crypto drainers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF] bg-[#080B12]/80 px-3.5 py-2.5 rounded-xl border border-white/10 shrink-0">
          <Cpu className="w-4 h-4 text-[#00E5FF]" />
          <span>5 Attack Scenarios</span>
        </div>
      </div>

      {/* Scenarios Grid / List */}
      <div className="space-y-6">
        {mockDemoScenarios.map((scenario) => {
          const Icon = scenarioIcons[scenario.type] || Globe;
          const isRunning = runningScenarioId === scenario.id;
          const isResultShown = activeResults[scenario.id];
          const liveData = liveResults[scenario.id];

          // Use live data if available, otherwise mock scenario defaults
          const riskScore = liveData ? liveData.riskScore : scenario.result.riskScore;
          const riskLevel = liveData ? liveData.riskLevel : scenario.result.riskLevel;
          const threatCategory = liveData ? liveData.threatCategory : scenario.result.threatCategory;
          const summary = liveData ? liveData.summary : scenario.result.summary;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl bg-[#151E2D]/85 backdrop-blur-xl border transition-all overflow-hidden ${
                isResultShown
                  ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.12)]'
                  : 'border-white/5 hover:border-[#00E5FF]/20'
              }`}
            >
              {/* Card Header & Preview */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-white/5 text-[#00E5FF] shrink-0 mt-0.5 border border-white/5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#F4F7FB]">
                          {scenario.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            riskLevel === 'critical'
                              ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30 shadow-[0_0_8px_rgba(255,69,96,0.3)]'
                              : riskLevel === 'high'
                              ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                              : 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
                          }`}
                        >
                          {riskLevel}
                        </span>
                        <span className="text-xs font-mono text-[#8794A8]">
                          ({scenario.category})
                        </span>
                      </div>

                      {/* Scenario Preview Box */}
                      <div className="mt-2.5 p-3 rounded-xl bg-[#080B12] border border-white/5 font-mono text-xs text-[#8794A8]">
                        <span className="text-[10px] uppercase text-[#00E5FF] font-bold block mb-1">
                          Simulated Input Artifact:
                        </span>
                        <p className="text-[#F4F7FB] break-all leading-relaxed">
                          {scenario.preview}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Run / Toggle Results Button */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRunScenario(scenario.id)}
                      disabled={isRunning}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] font-black text-xs hover:opacity-95 disabled:opacity-40 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all cursor-pointer active:scale-98"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#080B12]" />
                          <span>Invoking Swarm...</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 text-[#080B12]" />
                          <span>Run Scenario</span>
                        </>
                      )}
                    </button>

                    {isResultShown && !isRunning && (
                      <button
                        onClick={() => toggleResult(scenario.id)}
                        className="text-xs text-[#8794A8] hover:text-[#00E5FF] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{isResultShown ? 'Hide Details' : 'Show Details'}</span>
                        {isResultShown ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* In-Flight Scanning Animation */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-8 border-t border-white/5 bg-[#080B12]/80 flex flex-col items-center justify-center"
                  >
                    <ScannerAnimation
                      statusText={`Analyzing ${scenario.title}...`}
                      subText="Spawning autonomous agent swarm for deep multi-vector inspection..."
                      activeAgents={[
                        'Ingestion Probe',
                        'NLP Deception Swarm',
                        'Threat Registry IOC',
                        'Consensus Arbiter',
                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Results Display */}
              <AnimatePresence>
                {isResultShown && !isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5 bg-[#080B12]/60 p-6 space-y-6"
                  >
                    {/* Top Result Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="flex justify-center md:col-span-1">
                        <RiskGauge score={riskScore} size={200} label="Threat Score" />
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold uppercase border ${
                              riskLevel === 'critical'
                                ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30 shadow-[0_0_8px_rgba(255,69,96,0.3)]'
                                : riskLevel === 'high'
                                ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                                : 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
                            }`}
                          >
                            {riskLevel} Severity
                          </span>
                          <span className="text-xs font-mono text-[#00E5FF] bg-white/5 px-2.5 py-0.5 rounded border border-white/5">
                            {threatCategory}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#F4F7FB]">
                          Autonomous Verdict:
                        </h4>
                        <p className="text-xs md:text-sm text-[#8794A8] leading-relaxed">
                          {summary}
                        </p>
                      </div>
                    </div>

                    {/* Multi-Agent Swarm Timeline */}
                    <div className="rounded-xl bg-[#151E2D] p-5 border border-white/5">
                      <AgentTimeline steps={scenario.result.steps} />
                    </div>

                    {/* Indicators & Recommendations Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Indicators */}
                      <div className="rounded-xl bg-[#151E2D] p-4 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-[#F4F7FB] uppercase font-mono block">
                          Correlated IoCs
                        </span>
                        <div className="space-y-1.5">
                          {scenario.result.indicators.map((ind, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded bg-[#080B12] text-xs font-mono"
                            >
                              <span className="text-[#00E5FF] uppercase font-bold text-[10px]">
                                {ind.type}: {ind.value}
                              </span>
                              <span className="text-[#FF4560] font-semibold text-[10px]">
                                {ind.reputation} ({ind.confidence}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="rounded-xl bg-[#151E2D] p-4 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-[#00D68F] uppercase font-mono block">
                          Recommended Defensive Action
                        </span>
                        <ul className="space-y-1.5">
                          {scenario.result.recommendations.map((rec, i) => (
                            <li
                              key={i}
                              className="text-xs text-[#F4F7FB]/90 flex items-start gap-2 bg-[#080B12] p-2.5 rounded font-mono"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] mt-1 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
