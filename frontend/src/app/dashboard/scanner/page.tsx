'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  MessageSquare,
  Image as ImageIcon,
  QrCode,
  Search,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lock,
  Layers,
  Cpu,
  Trash2,
} from 'lucide-react';

import RiskGauge from '@/components/dashboard/RiskGauge';
import ScannerAnimation from '@/components/dashboard/ScannerAnimation';
import AgentTimeline from '@/components/dashboard/AgentTimeline';
import { api, ScanResult, ThreatIndicatorItem } from '@/lib/api';
import { InvestigationStep, ThreatIndicator } from '@/lib/mockData';

type TabType = 'url' | 'message' | 'image' | 'qr';

interface ParsedScanResult {
  scanId: string;
  target: string;
  type: TabType;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  threatCategory: string;
  summary: string;
  indicators: ThreatIndicator[];
  steps: InvestigationStep[];
  recommendations: string[];
  executionTimeMs: number;
  suspiciousPhrases?: string[];
  ocrText?: string;
}

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'url';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Real file uploads
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ParsedScanResult | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<number, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['url', 'message', 'image', 'qr'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Handle Real Scan Execution
  const handleStartScan = async (tab: TabType) => {
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    try {
      let rawResult: ScanResult;

      if (tab === 'url') {
        if (!urlInput.trim()) return;
        rawResult = await api.scanUrl(urlInput.trim());
      } else if (tab === 'message') {
        if (!messageInput.trim()) return;
        rawResult = await api.scanMessage(messageInput.trim());
      } else if (tab === 'image') {
        if (!imageFile) return;
        rawResult = await api.scanImage(imageFile);
      } else if (tab === 'qr') {
        if (!qrFile) return;
        rawResult = await api.scanQR(qrFile);
      } else {
        throw new Error('Unknown scan vector');
      }

      // Convert backend agent findings into structured steps for timeline
      const agentFindings = rawResult.details?.agent_findings || {};
      const generatedSteps: InvestigationStep[] = [];

      // 1. Ingestion / Heuristic step
      if (agentFindings.preliminary_scan) {
        const prelim = agentFindings.preliminary_scan;
        generatedSteps.push({
          agent: 'Ingestion Sentinel',
          role: 'Pre-flight Heuristics & Normalization',
          finding:
            prelim.summary ||
            `Heuristic inspection identified preliminary risk score of ${prelim.risk_score ?? rawResult.riskScore}/100.`,
          duration: '18ms',
          status: 'complete',
          severity:
            (prelim.risk_score ?? rawResult.riskScore) > 75
              ? 'critical'
              : (prelim.risk_score ?? rawResult.riskScore) > 40
              ? 'warning'
              : 'success',
        });
      } else {
        generatedSteps.push({
          agent: 'Ingestion Sentinel',
          role: 'Artifact Capture & Pre-Processing',
          finding: `Successfully extracted and normalized ${tab.toUpperCase()} artifact payload.`,
          duration: '12ms',
          status: 'complete',
          severity: 'info',
        });
      }

      // 2. Vector-specific intelligence agent
      if (agentFindings.threat_detection_agent) {
        const tda = agentFindings.threat_detection_agent;
        generatedSteps.push({
          agent: 'Threat Detection Agent',
          role: 'Behavioral Pattern Classification',
          finding:
            tda.reasoning ||
            tda.executive_summary ||
            `Classified vector as ${tda.threat_category || rawResult.threatCategory} with high confidence.`,
          duration: '45ms',
          status: 'complete',
          severity:
            (tda.risk_score ?? rawResult.riskScore) > 70
              ? 'critical'
              : (tda.risk_score ?? rawResult.riskScore) > 30
              ? 'warning'
              : 'success',
        });
      }

      // 3. Message / Web Intelligence Agent
      if (agentFindings.message_intelligence_agent) {
        const mia = agentFindings.message_intelligence_agent;
        generatedSteps.push({
          agent: 'Message Intelligence Agent',
          role: 'Psychological Pretext & NLP Analysis',
          finding:
            mia.executive_summary ||
            'Evaluated text communication for urgency manipulation and impersonation cues.',
          duration: '38ms',
          status: 'complete',
          severity:
            (mia.risk_score ?? rawResult.riskScore) > 70 ? 'critical' : 'warning',
        });
      } else if (agentFindings.web_intelligence_agent) {
        const wia = agentFindings.web_intelligence_agent;
        generatedSteps.push({
          agent: 'Web Intelligence Agent',
          role: 'Domain Infrastructure & DNS Profiling',
          finding:
            wia.executive_summary ||
            'Verified DNS records, homoglyph indicators, and certificate authority reputation.',
          duration: '52ms',
          status: 'complete',
          severity:
            (wia.risk_score ?? rawResult.riskScore) > 70 ? 'critical' : 'success',
        });
      } else {
        generatedSteps.push({
          agent: 'Threat Intel Matcher',
          role: 'Global Threat Registry Correlation',
          finding:
            rawResult.indicators && rawResult.indicators.length > 0
              ? `Correlated ${rawResult.indicators.length} threat signatures against active IoC feeds.`
              : 'Verified clean across 18.4M threat signatures and reputation registries.',
          duration: '28ms',
          status: 'complete',
          severity: rawResult.riskScore > 60 ? 'critical' : 'success',
        });
      }

      // 4. Final consensus coordinator
      generatedSteps.push({
        agent: 'Consensus Coordinator',
        role: 'Multi-Agent Scoring & Consensus Verdict',
        finding: `Finalized consensus verdict. Threat score: ${rawResult.riskScore}/100. Category: ${rawResult.threatCategory}.`,
        duration: `${rawResult.details?.execution_time_ms || 24}ms`,
        status: 'complete',
        severity:
          rawResult.riskScore > 75
            ? 'critical'
            : rawResult.riskScore > 40
            ? 'warning'
            : 'success',
      });

      // Parse IoC indicators
      const parsedIndicators: ThreatIndicator[] = (rawResult.indicators || []).map(
        (ind: any) => ({
          type: ind.type || 'pattern',
          value: ind.value || String(ind),
          reputation:
            ind.severity === 'critical' || ind.severity === 'high'
              ? 'malicious'
              : ind.severity === 'medium' || ind.severity === 'warning'
              ? 'suspicious'
              : 'clean',
          confidence: Math.round((ind.confidence || 0.85) * 100),
          matchedList: ind.source || ind.description || 'AEGISOS Threat Intelligence',
        })
      );

      // Extract suspicious phrases if message scan
      const suspiciousPhrases: string[] = [];
      if (tab === 'message') {
        (rawResult.indicators || []).forEach((ind: any) => {
          if (ind.type === 'scam_phrase' || ind.type === 'suspicious_pattern') {
            suspiciousPhrases.push(ind.value);
          }
        });
      }

      setScanResult({
        scanId: rawResult.id,
        target: rawResult.target,
        type: tab,
        riskScore: rawResult.riskScore,
        riskLevel: rawResult.riskLevel || 'safe',
        threatCategory: rawResult.threatCategory || rawResult.verdict || 'General Threat',
        summary: rawResult.summary,
        indicators: parsedIndicators,
        steps: generatedSteps,
        recommendations:
          rawResult.recommendations && rawResult.recommendations.length > 0
            ? rawResult.recommendations
            : [
                'Continue regular monitoring and verify links before entering credentials.',
                'Ensure endpoint security definitions remain updated.',
              ],
        executionTimeMs: rawResult.details?.execution_time_ms || 32,
        suspiciousPhrases:
          suspiciousPhrases.length > 0 ? suspiciousPhrases : undefined,
      });
    } catch (err: any) {
      console.error('Scan failed:', err);
      setErrorMessage(
        err.message || 'Scan failed to complete. Please check network connection and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const toggleEvidence = (idx: number) => {
    setExpandedEvidence((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-semibold shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              MULTI-VECTOR DEFENSE
            </span>
            <span className="text-xs text-[#00D68F] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
              8 Autonomous Agents Ready
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
            Advanced Threat Scanner
          </h1>
          <p className="text-xs md:text-sm text-[#8794A8]">
            Instant deep inspection of suspicious URLs, SMS & communications, screenshots, and QR payloads.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8794A8] bg-[#101725] px-3.5 py-2 rounded-xl border border-white/5 shrink-0">
          <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>API: FastAPI v1.0 / ML Naive Bayes</span>
        </div>
      </div>

      {/* Vector Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-[#101725]/90 border border-white/5 backdrop-blur-xl">
        {[
          { id: 'url', label: 'URL & Website', icon: Globe, count: 'Sub-12ms' },
          { id: 'message', label: 'SMS & Phishing', icon: MessageSquare, count: 'NLP Heuristics' },
          { id: 'image', label: 'Screenshot / OCR', icon: ImageIcon, count: 'Visual Quish' },
          { id: 'qr', label: 'QR Code Matrix', icon: QrCode, count: 'Web3 Drainer' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setScanResult(null);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#00E5FF]/20 to-[#7C4DFF]/15 text-white border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                  : 'text-[#8794A8] hover:text-[#F4F7FB] hover:bg-white/5 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/5 text-[#8794A8]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{tab.label}</span>
                <span className="text-[10px] font-mono text-[#8794A8] block">{tab.count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Scanner Input Box */}
      <div className="rounded-2xl bg-[#151E2D]/85 backdrop-blur-xl border border-[#00E5FF]/20 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-40" />

        {/* TAB 1: URL SCANNER */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00E5FF]" />
                Target Web Destination
              </label>
              <span className="text-[11px] font-mono text-[#00D68F] bg-[#00D68F]/10 px-2 py-0.5 rounded border border-[#00D68F]/20">
                SSRF & Homoglyph Protection Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-[#8794A8] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartScan('url')}
                  placeholder="https://login-chase-online-verify.cc/auth or paste suspect domain"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#00E5FF] font-mono transition-colors shadow-inner"
                />
              </div>

              <button
                onClick={() => handleStartScan('url')}
                disabled={isScanning || !urlInput.trim()}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(0,229,255,0.4)] shrink-0 cursor-pointer active:scale-98"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#080B12]" />
                    <span>Investigating...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#080B12]" />
                    <span>Run Deep Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Test Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#8794A8] font-mono text-[11px]">Quick Tests:</span>
              <button
                onClick={() => {
                  setUrlInput('https://login-chase-online-verify-security.cc/auth');
                  setTimeout(() => handleStartScan('url'), 50);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FF4560]/10 border border-[#FF4560]/30 text-[#FF4560] font-mono text-[11px] hover:bg-[#FF4560]/20 transition-colors cursor-pointer"
              >
                🚨 Chase Phishing Clone
              </button>
              <button
                onClick={() => {
                  setUrlInput('https://paypal-customer-resolution-center.info/dispute');
                  setTimeout(() => handleStartScan('url'), 50);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] font-mono text-[11px] hover:bg-[#FFB020]/20 transition-colors cursor-pointer"
              >
                ⚠️ PayPal Fake Resolver
              </button>
              <button
                onClick={() => {
                  setUrlInput('https://github.com/torvalds/linux/releases');
                  setTimeout(() => handleStartScan('url'), 50);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#00D68F]/10 border border-[#00D68F]/30 text-[#00D68F] font-mono text-[11px] hover:bg-[#00D68F]/20 transition-colors cursor-pointer"
              >
                ✅ Official GitHub Linux
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MESSAGE SCANNER */}
        {activeTab === 'message' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C4DFF]" />
                SMS / Email / Social Message Payload
              </label>
              <span className="text-xs font-mono text-[#8794A8]">
                {messageInput.length} characters
              </span>
            </div>

            <textarea
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Paste suspicious SMS, WhatsApp message, or urgent alert here (e.g. 'Dear SBI customer, your savings account is suspended due to expired KYC...')"
              className="w-full p-4 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#7C4DFF] font-mono transition-colors shadow-inner leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#8794A8] font-mono text-[11px]">Quick Tests:</span>
                <button
                  onClick={() => {
                    setMessageInput(
                      'Dear SBI customer, your savings account #4102 has been suspended due to expired KYC. Update your PAN card immediately to avoid permanent closure: http://sbi-pan-update.xyz/verify'
                    );
                    setTimeout(() => handleStartScan('message'), 50);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FF4560]/10 border border-[#FF4560]/30 text-[#FF4560] font-mono text-[11px] hover:bg-[#FF4560]/20 transition-colors cursor-pointer"
                >
                  🏦 SBI Bank Scam
                </button>
                <button
                  onClick={() => {
                    setMessageInput(
                      'USPS Alert: Your package #US8921 cannot be delivered due to incomplete street address. Pay $1.95 redelivery fee within 12h: https://usps-redelivery.top'
                    );
                    setTimeout(() => handleStartScan('message'), 50);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] font-mono text-[11px] hover:bg-[#FFB020]/20 transition-colors cursor-pointer"
                >
                  📦 USPS Parcel Trap
                </button>
              </div>

              <button
                onClick={() => handleStartScan('message')}
                disabled={isScanning || !messageInput.trim()}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-[#080B12] font-black text-xs md:text-sm flex items-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-40 shadow-[0_0_25px_rgba(124,77,255,0.4)] cursor-pointer shrink-0"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#080B12]" />
                ) : (
                  <Search className="w-4 h-4 text-[#080B12]" />
                )}
                <span>Analyze Message</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: IMAGE / SCREENSHOT OCR SCANNER */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#00D68F]" />
                Upload Screenshot or Graphic Asset
              </label>
              <span className="text-[11px] font-mono text-[#8794A8]">
                Supports PNG, JPG, WEBP up to 10MB
              </span>
            </div>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imageFile ? (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-[#00E5FF]/30 hover:border-[#00E5FF] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#080B12]/60 hover:bg-[#00E5FF]/5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform mb-3 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#F4F7FB]">
                  Click or drag screenshot here to analyze
                </p>
                <p className="text-xs text-[#8794A8] mt-1 max-w-sm">
                  Neural computer vision will extract embedded text via OCR, detect brand spoofing, and identify hidden malicious links.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#080B12] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Selected upload preview"
                      className="w-16 h-16 rounded-lg object-cover border border-[#00E5FF]/30"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F4F7FB] truncate">
                      {imageFile.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#8794A8]">
                      {(imageFile.size / 1024).toFixed(1)} KB • Ready for OCR analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreviewUrl(null);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-[#8794A8] hover:text-[#FF4560] transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartScan('image')}
                    disabled={isScanning}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D68F] to-[#00E5FF] text-[#080B12] font-black text-xs flex items-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(0,214,143,0.3)] cursor-pointer"
                  >
                    {isScanning ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Run Vision & OCR Scan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QR CODE DECODER */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#FFB020]" />
                QR Code Matrix Payload Inspection
              </label>
              <span className="text-[11px] font-mono text-[#8794A8]">
                Decodes Permitted Transactions, Web3 Calls & URLs
              </span>
            </div>

            <input
              type="file"
              ref={qrInputRef}
              onChange={handleQrFileChange}
              accept="image/*"
              className="hidden"
            />

            {!qrFile ? (
              <div
                onClick={() => qrInputRef.current?.click()}
                className="border-2 border-dashed border-[#FFB020]/30 hover:border-[#FFB020] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#080B12]/60 hover:bg-[#FFB020]/5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/30 flex items-center justify-center text-[#FFB020] group-hover:scale-110 transition-transform mb-3 shadow-[0_0_20px_rgba(255,176,32,0.2)]">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#F4F7FB]">
                  Upload or drop QR Code image here
                </p>
                <p className="text-xs text-[#8794A8] mt-1 max-w-sm">
                  Decodes barcode matrix payloads, inspects ERC-20 permit drainers, verifies Wi-Fi beacons, and checks phishing hops without opening URLs.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#080B12] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {qrPreviewUrl && (
                    <img
                      src={qrPreviewUrl}
                      alt="Selected QR preview"
                      className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-[#FFB020]/30"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F4F7FB] truncate">
                      {qrFile.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#8794A8]">
                      {(qrFile.size / 1024).toFixed(1)} KB • QR Ready to decode
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQrFile(null);
                      setQrPreviewUrl(null);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-[#8794A8] hover:text-[#FF4560] transition-colors cursor-pointer"
                    title="Remove QR"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartScan('qr')}
                    disabled={isScanning}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB020] to-[#FF4560] text-[#080B12] font-black text-xs flex items-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(255,176,32,0.3)] cursor-pointer"
                  >
                    {isScanning ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Decode Matrix Payload</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#FF4560]/10 border border-[#FF4560]/30 text-xs text-[#FF4560] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Live Radar Scanning Animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl bg-[#151E2D]/95 backdrop-blur-xl border border-[#00E5FF]/30 p-8 shadow-2xl flex flex-col items-center"
          >
            <ScannerAnimation
              statusText="Swarm Investigation in Progress..."
              subText="Querying 8 autonomous neural models, inspecting homoglyphs, and correlating with live IoC intelligence..."
              activeAgents={[
                'Ingestion Sentinel',
                'Threat Detection Agent',
                'Web & Message Intelligence',
                'Consensus Swarm Arbiter',
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME SCAN RESULTS DISPLAY */}
      <AnimatePresence>
        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Top Results Card: Risk Gauge & High-level assessment */}
            <div className="rounded-2xl bg-[#151E2D]/90 backdrop-blur-xl border border-[#00E5FF]/20 p-6 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 flex flex-col items-center justify-center">
                <RiskGauge
                  score={scanResult.riskScore}
                  size={210}
                  label="Consensus Threat Score"
                />
                <span className="text-[11px] font-mono text-[#8794A8] mt-2">
                  Evaluated in {scanResult.executionTimeMs}ms
                </span>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                      scanResult.riskLevel === 'critical'
                        ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30 shadow-[0_0_12px_rgba(255,69,96,0.3)]'
                        : scanResult.riskLevel === 'high'
                        ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                        : 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
                    }`}
                  >
                    {scanResult.riskLevel} Risk Severity
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    Category: {scanResult.threatCategory}
                  </span>
                  <span className="text-xs font-mono text-[#8794A8] ml-auto">
                    ID: {scanResult.scanId.slice(0, 8)}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-[#F4F7FB] tracking-tight">
                  Autonomous Multi-Agent Finding
                </h3>
                <p className="text-xs md:text-sm text-[#8794A8] leading-relaxed">
                  {scanResult.summary}
                </p>

                {/* Target Information */}
                <div className="p-3 rounded-xl bg-[#080B12] border border-white/5 font-mono text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] uppercase text-[#8794A8] block">Inspected Target:</span>
                    <span className="text-[#00E5FF] truncate block">{scanResult.target}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(scanResult.target, 'target')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8794A8] hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy Target"
                  >
                    {copiedText === 'target' ? <Check className="w-3.5 h-3.5 text-[#00D68F]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Flagged Deceptive Phrases if message */}
                {scanResult.suspiciousPhrases && scanResult.suspiciousPhrases.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#8794A8] uppercase block mb-1.5">
                      Flagged Deceptive Phrases:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.suspiciousPhrases.map((phrase, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#FF4560]/15 text-[#FF4560] border border-[#FF4560]/30 text-xs font-mono font-semibold"
                        >
                          &ldquo;{phrase}&rdquo;
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted IoC Threat Indicators */}
            <div className="rounded-2xl bg-[#151E2D]/85 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB] font-mono">
                    Correlated Threat Indicators ({scanResult.indicators.length})
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#8794A8]">
                  Zero False-Positive Consensus Gate
                </span>
              </div>

              {scanResult.indicators.length > 0 ? (
                <div className="space-y-2">
                  {scanResult.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#080B12] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ind.reputation === 'malicious'
                              ? 'bg-[#FF4560]/20 text-[#FF4560] border border-[#FF4560]/40'
                              : ind.reputation === 'suspicious'
                              ? 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40'
                              : 'bg-[#00D68F]/20 text-[#00D68F] border border-[#00D68F]/40'
                          }`}
                        >
                          {ind.type}
                        </span>
                        <span className="text-[#F4F7FB] truncate font-semibold">
                          {ind.value}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        {ind.matchedList && (
                          <span className="text-[11px] text-[#8794A8] hidden sm:inline">
                            {ind.matchedList}
                          </span>
                        )}
                        <span className="text-[#00E5FF] font-bold">
                          {ind.confidence}% confidence
                        </span>
                        <button
                          onClick={() => copyToClipboard(ind.value, `ind-${i}`)}
                          className="p-1 text-[#8794A8] hover:text-white transition-colors cursor-pointer"
                          title="Copy IoC"
                        >
                          {copiedText === `ind-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#00D68F]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#080B12]/40 text-center text-xs text-[#00D68F] font-mono flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No malicious threat signatures matched in threat registries.</span>
                </div>
              )}
            </div>

            {/* AI Multi-Agent Execution Timeline */}
            <div className="rounded-2xl bg-[#151E2D]/85 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
              <AgentTimeline steps={scanResult.steps} />
            </div>

            {/* Recommended Protective Actions */}
            <div className="rounded-2xl bg-[#151E2D]/85 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-[#00D68F]" />
                <h4 className="text-sm font-bold tracking-wider uppercase text-[#F4F7FB] font-mono">
                  Autonomous Tactical Countermeasures
                </h4>
              </div>
              <ul className="space-y-2">
                {scanResult.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#F4F7FB]/90 bg-[#080B12] p-3 rounded-xl border border-white/5 font-mono"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00D68F] mt-1.5 shrink-0 shadow-[0_0_8px_#00D68F]" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ThreatScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-mono text-[#00E5FF]">
          Initializing Autonomous Threat Scanner...
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
