'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  RefreshCw,
} from 'lucide-react';

import RiskGauge from '@/components/dashboard/RiskGauge';
import ScannerAnimation from '@/components/dashboard/ScannerAnimation';
import AgentTimeline from '@/components/dashboard/AgentTimeline';
import { InvestigationStep, ThreatIndicator } from '@/lib/mockData';

type TabType = 'url' | 'message' | 'image' | 'qr';

interface ScanResultState {
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  threatCategory: string;
  summary: string;
  evidence: {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'warning' | 'info';
    indicators?: ThreatIndicator[];
  }[];
  steps: InvestigationStep[];
  recommendations: string[];
  ocrText?: string;
  extractedUrls?: string[];
  suspiciousPhrases?: string[];
}

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'url';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['url', 'message', 'image', 'qr'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle Scan Trigger
  const handleStartScan = (tab: TabType) => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate multi-agent swarm investigation latency
    setTimeout(() => {
      setIsScanning(false);

      if (tab === 'url') {
        const isMalicious = urlInput.toLowerCase().includes('chase') ||
          urlInput.toLowerCase().includes('login') ||
          urlInput.toLowerCase().includes('verify') ||
          urlInput.toLowerCase().includes('crypto') ||
          urlInput.length > 0;

        setScanResult({
          riskScore: isMalicious ? 95 : 12,
          riskLevel: isMalicious ? 'critical' : 'safe',
          threatCategory: isMalicious ? 'Credential Harvester & Phishing' : 'Clean Resource',
          summary: isMalicious
            ? 'Identified active lookalike banking portal with cloned SSL identity and credential exfiltration hooks.'
            : 'Verified legitimate domain certificates, strict HSTS, and zero presence in threat feeds.',
          evidence: isMalicious
            ? [
                {
                  title: 'Brand Impersonation & Typosquatting',
                  description: 'Target URL mimics authentic financial institution authorization portal using punycode or recent lookalike domain.',
                  severity: 'critical',
                  indicators: [
                    { type: 'domain', value: urlInput || 'login-chase-update.cc', reputation: 'malicious', confidence: 99, matchedList: 'PhishTank Live' },
                    { type: 'ip', value: '185.193.125.44', reputation: 'malicious', confidence: 94 },
                  ],
                },
                {
                  title: 'Malicious Form Action Webhook',
                  description: 'Client form input sends captured username and OTP directly to an unauthenticated Telegram bot gateway.',
                  severity: 'critical',
                },
              ]
            : [
                {
                  title: 'Valid Extended Validation Certificate',
                  description: 'Certificate issued by trusted root CA with active OCSP stapling and HSTS enforcement.',
                  severity: 'info',
                },
              ],
          steps: [
            { agent: 'WebGuard Sensor', role: 'DNS & HTTP Header Extraction', finding: 'Fetched target HTTP headers and analyzed TLS cipher suite.', duration: '28ms', status: 'complete', severity: 'info' },
            { agent: 'DOM Crawler Swarm', role: 'Visual & Form Structure Analysis', finding: isMalicious ? 'Detected password input field pointing to foreign IP.' : 'Verified authentic single sign-on form parameters.', duration: '110ms', status: 'complete', severity: isMalicious ? 'critical' : 'success' },
            { agent: 'Threat Intel Matcher', role: 'Global IOC Correlator', finding: isMalicious ? 'Correlated 2 active blacklisted IOCs in Spamhaus and AbuseIPDB.' : 'Zero matches across 18.4M malicious IOC signatures.', duration: '65ms', status: 'complete', severity: isMalicious ? 'critical' : 'success' },
            { agent: 'Consensus Coordinator', role: 'LLM Scoring Swarm', finding: `Finalized consensus verdict. Risk score: ${isMalicious ? 95 : 12}/100.`, duration: '40ms', status: 'complete', severity: isMalicious ? 'critical' : 'success' },
          ],
          recommendations: isMalicious
            ? ['Block URL on all perimeter firewalls and endpoint browsers', 'Submit takedown notice to domain registrar', 'Invalidate any credentials potentially submitted']
            : ['No blocking required; domain adheres to safe browsing protocols'],
        });
      } else if (tab === 'message') {
        setScanResult({
          riskScore: 92,
          riskLevel: 'critical',
          threatCategory: 'Financial Smishing & Urgency Scam',
          summary: 'Scam message contains high-urgency artificial deadlines designed to trick recipients into clicking spoofed postal delivery links.',
          suspiciousPhrases: [
            'unpaid postage ($1.95)',
            'within 12 hours',
            'package cannot be delivered',
            'update your details now',
          ],
          evidence: [
            {
              title: 'High-Urgency Lexical Pattern Match',
              description: 'Text triggers known psychological coercion models (urgent penalty deadline combined with low-friction $1.95 payment).',
              severity: 'critical',
            },
            {
              title: 'Extracted Deceptive URL',
              description: 'Embedded link points to an unverified top-level domain (.top) registered 14 hours ago.',
              severity: 'critical',
              indicators: [
                { type: 'domain', value: 'usps-redelivery-postage.top', reputation: 'malicious', confidence: 98, matchedList: 'SmishGuard Feed' },
              ],
            },
          ],
          steps: [
            { agent: 'MessageGuard NLP Engine', role: 'Semantic & Intent Analysis', finding: 'Identified coercive intent and financial coercion markers.', duration: '35ms', status: 'complete', severity: 'critical' },
            { agent: 'Link Extractor Agent', role: 'URL Sanitization & Unshortening', finding: 'Unpacked obfuscated redirect to phishing destination.', duration: '82ms', status: 'complete', severity: 'critical' },
            { agent: 'Consensus Coordinator', role: 'Multi-Agent Scoring', finding: 'Calculated 92/100 risk rating. Phishing attack verified.', duration: '28ms', status: 'complete', severity: 'critical' },
          ],
          recommendations: [
            'Do not reply or click any links in this message',
            'Forward SMS to carrier spam reporting code 7726',
            'Block the sending phone number or sender ID',
          ],
        });
      } else if (tab === 'image') {
        setScanResult({
          riskScore: 86,
          riskLevel: 'high',
          threatCategory: 'Quishing / Visual Phishing Screenshot',
          ocrText: 'MICROSOFT SECURITY: Your corporate password expires today. Scan below QR to authenticate: https://auth-m365-verify.me/corp',
          extractedUrls: ['https://auth-m365-verify.me/corp'],
          summary: 'Visual image contains deceptive Microsoft security alert with an embedded QR code (Quishing) specifically designed to evade text-based mail filters.',
          evidence: [
            {
              title: 'Optical Character Recognition (OCR) Analysis',
              description: 'Extracted text simulates Microsoft IT support alert attempting to induce panic around account expiration.',
              severity: 'high',
            },
            {
              title: 'Embedded Phishing Destination',
              description: 'Extracted URL resolves to malicious reverse-proxy portal collecting Microsoft OAuth tokens.',
              severity: 'critical',
              indicators: [
                { type: 'domain', value: 'auth-m365-verify.me', reputation: 'malicious', confidence: 96 },
              ],
            },
          ],
          steps: [
            { agent: 'MediaGuard OCR Agent', role: 'Optical Character Recognition', finding: 'Extracted 120 characters of high-resolution rendered text.', duration: '68ms', status: 'complete', severity: 'info' },
            { agent: 'Visual Stego Engine', role: 'Barcode & QR Extraction', finding: 'Detected embedded QR code matrix in lower quadrant.', duration: '54ms', status: 'complete', severity: 'warning' },
            { agent: 'Domain Reputation Sensor', role: 'IOC Lookup', finding: 'Target domain flagged for Evilginx3 reverse-proxy deployment.', duration: '41ms', status: 'complete', severity: 'critical' },
            { agent: 'Consensus Coordinator', role: 'Final Swarm Assessment', finding: 'Quishing attack confirmed. Risk score: 86/100.', duration: '31ms', status: 'complete', severity: 'high' },
          ],
          recommendations: [
            'Do not scan the QR code with any mobile device',
            'Submit the original screenshot or email to your enterprise SOC team',
            'Verify IT communications through internal verified Slack/Teams channels',
          ],
        });
      } else if (tab === 'qr') {
        setScanResult({
          riskScore: 89,
          riskLevel: 'critical',
          threatCategory: 'Malicious Web3 QR Drainer',
          summary: 'Decoded QR code attempts to initiate an obfuscated Ethereum transaction requesting max token spending allowance (Permit2 Drainer).',
          extractedUrls: ['ethereum:0x71C.../approve?spender=0xDrainerContract&amount=unlimited'],
          evidence: [
            {
              title: 'Obfuscated Smart Contract Approval',
              description: 'QR matrix decodes to an ERC-20 permit call granting infinite access to wallet assets without immediate gas notice.',
              severity: 'critical',
              indicators: [
                { type: 'wallet', value: '0xDrainerContract...99B4', reputation: 'malicious', confidence: 97, matchedList: 'Etherscan PhishDB' },
              ],
            },
          ],
          steps: [
            { agent: 'MediaGuard QR Engine', role: 'Matrix Payload Parsing', finding: 'Decoded high-density QR payload with embedded Ethereum scheme.', duration: '40ms', status: 'complete', severity: 'info' },
            { agent: 'Web3 Contract Sentinel', role: 'Bytecode & Allowance Audit', finding: 'Identified permit signature targeting arbitrary spender.', duration: '95ms', status: 'complete', severity: 'critical' },
            { agent: 'Consensus Coordinator', role: 'Consensus Finalization', finding: 'Confirmed malicious crypto drainer vector. Risk: 89/100.', duration: '25ms', status: 'complete', severity: 'critical' },
          ],
          recommendations: [
            'Reject any transaction or signature prompt in your Web3 wallet',
            'Do not approve allowances for unknown contract spenders',
            'Scan existing wallet permissions using Revoke.cash',
          ],
        });
      }
    }, 1800);
  };

  const toggleEvidence = (idx: number) => {
    setExpandedEvidence((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
            Multi-Vector Defense
          </span>
          <span className="text-xs text-[#8794A8] font-mono">Autonomous Inspector</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
          Advanced Threat Scanner
        </h1>
        <p className="text-xs md:text-sm text-[#8794A8]">
          Analyze suspicious URLs, SMS & email messages, images, and QR payloads using AEGISOS agent swarms.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {[
          { id: 'url', label: 'URL Scanner', icon: Globe },
          { id: 'message', label: 'Message & SMS', icon: MessageSquare },
          { id: 'image', label: 'Image & OCR', icon: ImageIcon },
          { id: 'qr', label: 'QR Payload', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setScanResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                  : 'text-[#8794A8] hover:text-[#F4F7FB] hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Inputs Section */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
        {activeTab === 'url' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-[#8794A8] uppercase tracking-wider">
              Target URL Analysis
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-[#8794A8] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste URL to analyze (e.g., https://login-chase-update.cc/auth)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#00E5FF]/50 font-mono transition-colors"
                />
              </div>
              <button
                onClick={() => handleStartScan('url')}
                disabled={isScanning || !urlInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.25)] shrink-0"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#080B12]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#080B12]" />
                    <span>Run Deep Scan</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#8794A8]">
              <span>Sample tests:</span>
              <button
                onClick={() => setUrlInput('https://login-chase-online-verify-security.cc/auth')}
                className="text-[#00E5FF] hover:underline font-mono"
              >
                Suspicious Chase Phish
              </button>
              <span>•</span>
              <button
                onClick={() => setUrlInput('https://github.com/torvalds/linux')}
                className="text-[#00D68F] hover:underline font-mono"
              >
                Safe GitHub Repo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#8794A8] uppercase tracking-wider">
                SMS / Email / Social Message Text
              </label>
              <span className="text-xs font-mono text-[#8794A8]">
                {messageInput.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Paste suspicious text or SMS here (e.g. USPS: We tried to deliver your parcel #US89218 but unpaid postage ($1.95) is required: https://usps-redelivery.top)..."
              className="w-full p-4 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#7C4DFF]/50 font-mono transition-colors"
            />
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[11px] text-[#8794A8]">
                <span>Sample tests:</span>
                <button
                  onClick={() =>
                    setMessageInput(
                      'USPS: We tried to deliver your parcel #US89218 but unpaid postage ($1.95) is required. Update within 12 hours: https://usps-redelivery.top'
                    )
                  }
                  className="text-[#7C4DFF] hover:underline font-mono"
                >
                  USPS Smishing Scam
                </button>
              </div>
              <button
                onClick={() => handleStartScan('message')}
                disabled={isScanning || !messageInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-[#080B12] font-bold text-xs md:text-sm flex items-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-40"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Analyze Message</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-[#8794A8] uppercase tracking-wider">
              Visual Screenshot / Document Scan
            </label>
            <div
              onClick={() => {
                setSelectedFile('microsoft-password-quish.png');
              }}
              className="border-2 border-dashed border-white/15 hover:border-[#00E5FF]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#080B12]/50"
            >
              <Upload className="w-8 h-8 text-[#00E5FF] mb-2" />
              <p className="text-sm font-semibold text-[#F4F7FB]">
                {selectedFile ? `Selected: ${selectedFile}` : 'Drag & drop suspicious screenshot or click to browse'}
              </p>
              <p className="text-xs text-[#8794A8] mt-1">
                Supports PNG, JPG, WEBP. Automatic OCR text extraction and barcode decoding.
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#080B12] border border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00E5FF]" />
                  <span className="text-xs font-mono text-[#F4F7FB]">{selectedFile}</span>
                </div>
                <button
                  onClick={() => handleStartScan('image')}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-lg bg-[#00E5FF] text-[#080B12] text-xs font-bold"
                >
                  {isScanning ? 'Extracting OCR...' : 'Run OCR & Threat Audit'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-[#8794A8] uppercase tracking-wider">
              QR Code Matrix Payload Decoder
            </label>
            <div
              onClick={() => {
                setQrFile('crypto-drainer-qr.png');
              }}
              className="border-2 border-dashed border-white/15 hover:border-[#7C4DFF]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#080B12]/50"
            >
              <QrCode className="w-8 h-8 text-[#7C4DFF] mb-2" />
              <p className="text-sm font-semibold text-[#F4F7FB]">
                {qrFile ? `Selected: ${qrFile}` : 'Upload QR Code image for deep decoding'}
              </p>
              <p className="text-xs text-[#8794A8] mt-1">
                Decodes raw URLs, smart contract signatures, Wi-Fi payloads, and binary data.
              </p>
            </div>

            {qrFile && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#080B12] border border-white/10">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#7C4DFF]" />
                  <span className="text-xs font-mono text-[#F4F7FB]">{qrFile}</span>
                </div>
                <button
                  onClick={() => handleStartScan('qr')}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-lg bg-[#7C4DFF] text-[#F4F7FB] text-xs font-bold"
                >
                  {isScanning ? 'Decoding Matrix...' : 'Decode & Inspect Payload'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanning State: Animated Scanner Radar Effect */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl bg-[#151E2D]/90 backdrop-blur-xl border border-[#00E5FF]/20 p-8 shadow-2xl flex flex-col items-center"
          >
            <ScannerAnimation
              statusText="Multi-Agent Threat Analysis Active"
              subText="Ingesting payload, testing against 18.4M threat signatures, running heuristic NLP and zero-day correlation..."
              activeAgents={[
                'Ingestion Sentinel',
                'Heuristic NLP Urgency',
                'Threat Intel Matcher',
                'Consensus Swarm',
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Results Display */}
      <AnimatePresence>
        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Top Results Card: Risk Gauge & High-level assessment */}
            <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 flex justify-center">
                <RiskGauge score={scanResult.riskScore} size={220} label="Consensus Threat Score" />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                      scanResult.riskLevel === 'critical'
                        ? 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30'
                        : scanResult.riskLevel === 'high'
                        ? 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                        : 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
                    }`}
                  >
                    {scanResult.riskLevel} Risk Level
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                    {scanResult.threatCategory}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  Threat Investigation Summary
                </h3>
                <p className="text-xs md:text-sm text-[#8794A8] leading-relaxed">
                  {scanResult.summary}
                </p>

                {/* Extracted Details / Highlighted suspicious items */}
                {scanResult.suspiciousPhrases && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#8794A8] uppercase block mb-1.5">
                      Flagged Deceptive Phrases:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.suspiciousPhrases.map((phrase, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#FF4560]/10 text-[#FF4560] border border-[#FF4560]/20 text-xs font-mono"
                        >
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scanResult.ocrText && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#8794A8] uppercase block mb-1">
                      OCR Extracted Text:
                    </span>
                    <p className="text-xs font-mono bg-[#080B12] p-2.5 rounded-lg border border-white/5 text-[#F4F7FB]">
                      {scanResult.ocrText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Cards Section with Expandable Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
                Forensic Evidence & Threat Indicators
              </h3>
              <div className="space-y-3">
                {scanResult.evidence.map((ev, idx) => {
                  const isExpanded = expandedEvidence[idx] ?? true;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleEvidence(idx)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              ev.severity === 'critical'
                                ? 'bg-[#FF4560]/10 text-[#FF4560]'
                                : 'bg-[#FFB020]/10 text-[#FFB020]'
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs md:text-sm font-bold text-[#F4F7FB]">
                              {ev.title}
                            </h4>
                            <p className="text-xs text-[#8794A8] mt-0.5">{ev.description}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#8794A8]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8794A8]" />
                        )}
                      </button>

                      {isExpanded && ev.indicators && ev.indicators.length > 0 && (
                        <div className="px-4 pb-4 pt-1 border-t border-white/5">
                          <span className="text-[10px] uppercase font-mono text-[#8794A8] block mb-2">
                            Extracted IOC Indicators:
                          </span>
                          <div className="space-y-2">
                            {ev.indicators.map((ind, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#080B12] border border-white/5 text-xs font-mono"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase text-[#00E5FF]">
                                    {ind.type}
                                  </span>
                                  <span className="text-[#F4F7FB]">{ind.value}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {ind.matchedList && (
                                    <span className="text-[10px] text-[#8794A8]">
                                      {ind.matchedList}
                                    </span>
                                  )}
                                  <span className="text-[#FF4560] font-bold">
                                    {ind.confidence}% confidence
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Multi-Agent Execution Timeline */}
            <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
              <AgentTimeline steps={scanResult.steps} />
            </div>

            {/* Recommended Protective Actions */}
            <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-[#00D68F]" />
                <h4 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
                  Recommended Actions
                </h4>
              </div>
              <ul className="space-y-2">
                {scanResult.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#F4F7FB]/90 bg-[#080B12]/50 p-2.5 rounded-lg border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] mt-1.5 shrink-0" />
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
    <Suspense fallback={<div className="p-8 text-xs font-mono text-[#8794A8]">Loading Scanner...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
