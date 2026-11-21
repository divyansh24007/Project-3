"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  Cpu,
  Radio,
  Lock,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Zap,
  Terminal,
  Database,
  ExternalLink,
  Radar,
  Eye,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"architecture" | "agents">("architecture");

  // Feature cards data
  const features = [
    {
      id: "webguard",
      title: "WebGuard",
      tagline: "Active Web Perimeter Defense",
      icon: Globe,
      color: "#00E5FF",
      description:
        "Real-time URL verification, adversary-in-the-middle (AitM) reverse proxy neutralization, punycode spoof detection, and credential harvesting blocker.",
      metrics: "Sub-12ms DNS & DOM validation",
    },
    {
      id: "messageguard",
      title: "MessageGuard",
      tagline: "Contextual Social Engineering Shield",
      icon: MessageSquare,
      color: "#7C4DFF",
      description:
        "Deep semantic NLP models inspect SMS, messaging apps, and corporate emails for urgency manipulation, BEC spear-phishing, and deceptive shorteners.",
      metrics: "99.87% BEC detection accuracy",
    },
    {
      id: "mediaguard",
      title: "MediaGuard",
      tagline: "Visual & Quishing Inspection",
      icon: ImageIcon,
      color: "#00D68F",
      description:
        "AI computer vision scans images and PDF attachments for malicious QR codes (Quishing), hidden steganographic payload entropy, and deepfake artifacts.",
      metrics: "Zero-pixel blind spot analysis",
    },
    {
      id: "appguard",
      title: "AppGuard",
      tagline: "Autonomous Sandbox Isolation",
      icon: Lock,
      color: "#FFB020",
      description:
        "Isolated dynamic execution micro-sandboxes monitor unknown binaries, detecting heap spraying, anti-debug hooks, and unauthorized privilege escalations.",
      metrics: "Kernel-level behavioral telemetry",
    },
    {
      id: "networkguard",
      title: "NetworkGuard",
      tagline: "Zero-Trust Command & Control Barrier",
      icon: Radio,
      color: "#FF6D00",
      description:
        "Detects and severs suspicious outbound beaconing, DNS tunneling exfiltration, and unauthorized lateral network movements across distributed endpoints.",
      metrics: "Adaptive BPF packet inspection",
    },
    {
      id: "aiintelligence",
      title: "AI Intelligence",
      tagline: "Consensus Multi-Agent Reasoning",
      icon: Cpu,
      color: "#00E5FF",
      description:
        "Eight specialized autonomous agents collaborate in an adversarial reasoning loop, mapping indicators directly against the MITRE ATT&CK framework.",
      metrics: "Explainable triage & attribution",
    },
  ];

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Submit Target",
      description:
        "Ingest suspect URLs, files, images, message payloads, or network streams via automated webhooks, browser extensions, or API endpoints.",
      icon: Terminal,
    },
    {
      number: "02",
      title: "Analyze Heuristics",
      description:
        "Parallel neural classifiers examine entropy, DOM structures, cryptographic signatures, and global threat intelligence feeds simultaneously.",
      icon: Radar,
    },
    {
      number: "03",
      title: "Multi-Agent Investigation",
      description:
        "Specialized autonomous agents interrogate the anomaly, reconstructing adversary attack chains and validating zero-day evasion tactics.",
      icon: FileSearch,
    },
    {
      number: "04",
      title: "Autonomous Protection",
      description:
        "Zero-trust firewall policies deploy instantly, neutralizing malicious vectors, revoking exposed tokens, and immunizing your entire fleet.",
      icon: ShieldCheck,
    },
  ];

  // Architecture agents
  const agents = [
    { name: "Web Sentinel", role: "URL & AitM Proxy Interceptor", status: "Active" },
    { name: "NLP Semanticist", role: "Linguistic Social Engineering Analyst", status: "Active" },
    { name: "Vision Core", role: "Quishing & Steganography Engine", status: "Active" },
    { name: "Sandbox Overseer", role: "Dynamic Binary Execution Monitor", status: "Active" },
    { name: "Threat Correlator", role: "MITRE ATT&CK Matrix Cross-Referencing", status: "Active" },
    { name: "Deception Honeytoken", role: "Adversary Poisoning & Fingerprinting", status: "Active" },
    { name: "Forensic Reconstructor", role: "Timeline & Attribution Synthesizer", status: "Active" },
    { name: "Defense Synthesizer", role: "Zero-Trust Policy Auto-Deployer", status: "Active" },
  ];

  // Stats data
  const stats = [
    { label: "Protection Modules", value: "6", suffix: " Full-Stack" },
    { label: "AI Neural Agents", value: "8", suffix: " Autonomous" },
    { label: "Real-time Latency", value: "< 45ms", suffix: " Analysis" },
    { label: "Continuous Guard", value: "24/7/365", suffix: " Zero-Downtime" },
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F4F7FB] selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] overflow-hidden">
      {/* =========================================================================
          NAVIGATION BAR
         ========================================================================= */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#080B12]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1.5px] shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] transition-all">
              <div className="w-full h-full bg-[#080B12] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-[#F4F7FB]">
                AEGIS<span className="text-[#00E5FF]">OS</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#8794A8] uppercase -mt-1">
                Autonomous Cyber Defense
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8794A8]">
            <a href="#features" className="hover:text-[#00E5FF] transition-colors">
              Protection Modules
            </a>
            <a href="#how-it-works" className="hover:text-[#00E5FF] transition-colors">
              How It Works
            </a>
            <a href="#architecture" className="hover:text-[#00E5FF] transition-colors">
              Multi-Agent Mesh
            </a>
            <a href="#stats" className="hover:text-[#00E5FF] transition-colors">
              Metrics
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#8794A8] hover:text-[#F4F7FB] transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          SECTION 1: HERO SECTION
         ========================================================================= */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 bg-grid-cyber">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-radial-glow pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-[450px] h-[450px] bg-[#7C4DFF]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left z-10"
          >
            {/* Version Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-medium shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Next-Gen Autonomous Multi-Agent Threat Defense</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Your Digital World. <br />
              <span className="gradient-text-cyber">One Intelligent Shield.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#8794A8] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              AI-powered protection that detects, investigates and helps prevent digital
              threats before they compromise your security.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-6 shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-6 border-[#00E5FF]/30 hover:border-[#00E5FF]"
                  leftIcon={<Activity className="w-5 h-5" />}
                >
                  View Live Dashboard
                </Button>
              </Link>
            </div>

            {/* Security Assurance stats */}
            <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#8794A8] font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D68F]" />
                <span>Zero Trust Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                <span>MITRE ATT&CK Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C4DFF]" />
                <span>Zero Latency Interception</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Column: Animated Cyber Shield Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center items-center relative z-10"
          >
            <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] flex items-center justify-center">
              {/* Outer Orbit Ring 1 */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00E5FF]/20 animate-orbit" />

              {/* Inner Orbit Ring 2 */}
              <div className="absolute inset-6 rounded-full border border-dotted border-[#7C4DFF]/30 animate-orbit-reverse" />

              {/* Glowing Pulse Radar Ring 3 */}
              <div className="absolute inset-16 rounded-full border border-[#00E5FF]/40 animate-pulse-glow" />

              {/* Vertical Laser Scanner Beam Effect */}
              <div className="absolute inset-12 overflow-hidden rounded-full pointer-events-none">
                <div className="animate-scan-line" />
              </div>

              {/* Center Cyber Shield SVG */}
              <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
                {/* SVG Shield with cyber circuitry */}
                <svg
                  viewBox="0 0 200 240"
                  className="w-full h-full drop-shadow-[0_0_35px_rgba(0,229,255,0.6)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="shieldGrad" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00E5FF" />
                      <stop offset="0.5" stopColor="#3F51B5" />
                      <stop offset="1" stopColor="#7C4DFF" />
                    </linearGradient>
                    <linearGradient id="shieldFill" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#101725" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#080B12" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  {/* Outer Shield Frame */}
                  <path
                    d="M100 8L185 45V115C185 175 145 220 100 234C55 220 15 175 15 115V45L100 8Z"
                    fill="url(#shieldFill)"
                    stroke="url(#shieldGrad)"
                    strokeWidth="3.5"
                  />

                  {/* Inner Circuit Mesh */}
                  <path
                    d="M100 30L165 60V115C165 160 135 195 100 208C65 195 35 160 35 115V60L100 30Z"
                    stroke="#00E5FF"
                    strokeWidth="1.2"
                    strokeOpacity="0.35"
                    strokeDasharray="4 4"
                  />

                  {/* Center Node Core */}
                  <circle cx="100" cy="115" r="28" fill="#00E5FF" fillOpacity="0.1" stroke="#00E5FF" strokeWidth="2" />
                  <circle cx="100" cy="115" r="14" fill="#00E5FF" fillOpacity="0.4" />
                  <circle cx="100" cy="115" r="6" fill="#FFFFFF" />

                  {/* Radiating Circuit Traces */}
                  <line x1="100" y1="30" x2="100" y2="87" stroke="#00E5FF" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="100" y1="143" x2="100" y2="208" stroke="#7C4DFF" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="45" y1="115" x2="72" y2="115" stroke="#00E5FF" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="128" y1="115" x2="155" y2="115" stroke="#7C4DFF" strokeWidth="2" strokeOpacity="0.8" />

                  <circle cx="100" cy="30" r="3" fill="#00E5FF" />
                  <circle cx="100" cy="208" r="3" fill="#7C4DFF" />
                  <circle cx="45" cy="115" r="3" fill="#00E5FF" />
                  <circle cx="155" cy="115" r="3" fill="#7C4DFF" />
                </svg>
              </div>

              {/* Floating Live Telemetry Cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 left-0 sm:-left-4 p-2.5 rounded-xl bg-[#151E2D]/90 border border-[#00E5FF]/40 shadow-xl backdrop-blur-md text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-ping" />
                  <span className="text-[#00E5FF] font-bold">0-DAY PHISH INTERCEPTED</span>
                </div>
                <p className="text-[10px] text-[#8794A8] mt-0.5">AitM Reverse Proxy Blocked</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 right-0 sm:-right-4 p-2.5 rounded-xl bg-[#151E2D]/90 border border-[#7C4DFF]/40 shadow-xl backdrop-blur-md text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00D68F]" />
                  <span className="text-white font-bold">CONSENSUS VERIFIED</span>
                </div>
                <p className="text-[10px] text-[#8794A8] mt-0.5">8 Neural Agents Aligned</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES SECTION (6 FEATURE CARDS)
         ========================================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#080B12]">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="low" dot={false} className="border-[#00E5FF]/40 text-[#00E5FF]">
              Comprehensive Coverage
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Six Defense Modules. <br />
              <span className="gradient-text-cyber">Zero Unprotected Attack Vectors.</span>
            </h2>
            <p className="text-[#8794A8] text-base sm:text-lg">
              AEGISOS delivers continuous defense across your entire digital surface,
              synthesizing intelligence from browser to binary.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                >
                  <Card
                    variant="interactive"
                    className="h-full p-6 sm:p-7 flex flex-col justify-between group hover:border-[#00E5FF]/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]"
                  >
                    <div className="space-y-4">
                      {/* Top icon and tag */}
                      <div className="flex items-center justify-between">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: `${feature.color}15`,
                            border: `1px solid ${feature.color}40`,
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: feature.color }} />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8794A8] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                          {feature.tagline}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-bold text-[#F4F7FB] group-hover:text-[#00E5FF] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#8794A8] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Metric footer */}
                    <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8794A8]">{feature.metrics}</span>
                      <ChevronRight className="w-4 h-4 text-[#8794A8] group-hover:text-[#00E5FF] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS SECTION (4 CONNECTED STEPS)
         ========================================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#101725]/50 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="medium" dot={false} className="border-[#FFB020]/40 text-[#FFB020]">
              Operational Workflow
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Autonomous Threat Interception in Action
            </h2>
            <p className="text-[#8794A8] text-base sm:text-lg">
              From initial anomaly submission to global vaccine deployment in milliseconds.
            </p>
          </div>

          {/* 4 Connected Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Animated Connecting Flow Line behind desktop cards */}
            <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#7C4DFF] to-[#00D68F] opacity-30 -translate-y-6" />

            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="relative z-10"
                >
                  <div className="h-full p-6 rounded-2xl bg-[#151E2D] border border-white/10 hover:border-[#00E5FF]/40 shadow-xl backdrop-blur-md transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                      {/* Step Number & Icon */}
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black font-mono text-[#00E5FF]/60 group-hover:text-[#00E5FF] transition-colors">
                          {step.number}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                          <StepIcon className="w-5 h-5" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-[#F4F7FB]">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#8794A8] leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-[#00E5FF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                      <span>Zero Human Delay</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ARCHITECTURE SECTION (MULTI-AGENT AI SYSTEM)
         ========================================================================= */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#080B12] relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="safe" dot={false} className="border-[#00D68F]/40 text-[#00D68F]">
              Multi-Agent Architecture
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Eight Specialized AI Agents. <br />
              <span className="gradient-text-cyber">Uncompromising Consensus.</span>
            </h2>
            <p className="text-[#8794A8] text-base sm:text-lg">
              Instead of relying on a single fallible model, AEGISOS deploys an adversarial
              federation of specialized autonomous agents who cross-examine every threat.
            </p>
          </div>

          {/* Interactive Architecture Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Diagram Pane */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#101725] border border-[#00E5FF]/20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 font-mono text-[11px] text-[#00E5FF] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
                NEURAL ORCHESTRATOR ONLINE
              </div>

              {/* Hub Visualization */}
              <div className="relative py-8 flex flex-col items-center justify-center">
                {/* Central Brain Core */}
                <div className="relative z-20 w-32 h-32 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[2px] shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                  <div className="w-full h-full bg-[#080B12] rounded-[14px] flex flex-col items-center justify-center p-3 text-center">
                    <Cpu className="w-8 h-8 text-[#00E5FF] animate-pulse mb-1" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      CONSENSUS CORE
                    </span>
                    <span className="text-[9px] font-mono text-[#00D68F]">
                      Active Triage
                    </span>
                  </div>
                </div>

                {/* Surrounding Connected Agent Satellites */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 relative z-10">
                  {agents.slice(0, 4).map((agent, i) => (
                    <div
                      key={agent.name}
                      className="p-3 rounded-xl bg-[#151E2D] border border-white/10 text-center space-y-1 hover:border-[#00E5FF]/40 transition-colors"
                    >
                      <p className="text-xs font-bold text-[#F4F7FB] truncate">
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-[#8794A8] line-clamp-1">
                        {agent.role}
                      </p>
                      <span className="inline-block text-[9px] font-mono text-[#00D68F] bg-[#00D68F]/10 px-1.5 py-0.5 rounded">
                        99.9% SYNC
                      </span>
                    </div>
                  ))}
                </div>

                <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 relative z-10">
                  {agents.slice(4, 8).map((agent, i) => (
                    <div
                      key={agent.name}
                      className="p-3 rounded-xl bg-[#151E2D] border border-white/10 text-center space-y-1 hover:border-[#7C4DFF]/40 transition-colors"
                    >
                      <p className="text-xs font-bold text-[#F4F7FB] truncate">
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-[#8794A8] line-clamp-1">
                        {agent.role}
                      </p>
                      <span className="inline-block text-[9px] font-mono text-[#7C4DFF] bg-[#7C4DFF]/10 px-1.5 py-0.5 rounded">
                        EVALUATING
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Explanatory List */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-xl bg-[#151E2D]/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5 text-[#00E5FF]">
                  <Layers className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F4F7FB]">
                    Adversarial Red-Teaming
                  </h4>
                </div>
                <p className="text-xs text-[#8794A8] leading-relaxed">
                  While detector agents flag potential zero-days, challenger agents
                  attempt to find false-positive counter-evidence, preventing workflow
                  disruption.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#151E2D]/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5 text-[#7C4DFF]">
                  <Database className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F4F7FB]">
                    Dynamic MITRE ATT&CK Mapping
                  </h4>
                </div>
                <p className="text-xs text-[#8794A8] leading-relaxed">
                  Every detected anomaly is instantly annotated with adversary TTPs,
                  threat actor attributions, and CVE references for complete forensics.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#151E2D]/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5 text-[#00D68F]">
                  <Zap className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F4F7FB]">
                    Real-time Autonomous Policy Synthesis
                  </h4>
                </div>
                <p className="text-xs text-[#8794A8] leading-relaxed">
                  Once consensus threshold is reached (score &gt; 85), defensive rules
                  are distributed to perimeter firewalls and endpoint agents automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: STATS SECTION (ANIMATED COUNTERS)
         ========================================================================= */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#101725] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#151E2D]/60 border border-white/5 space-y-2"
              >
                <div className="text-3xl sm:text-5xl font-extrabold font-mono text-[#00E5FF] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-[#F4F7FB]">
                  {stat.label}
                </div>
                <div className="text-xs text-[#8794A8] font-mono">
                  {stat.suffix}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CTA SECTION
         ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#080B12]">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 relative overflow-hidden bg-gradient-to-br from-[#101725] via-[#151E2D] to-[#080B12] border border-[#00E5FF]/30 shadow-2xl shadow-[#00E5FF]/10 text-center space-y-8">
          {/* Subtle cyber grid backdrop */}
          <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <Badge variant="critical" dot={true}>
              Immediate Protection Available
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Deploy the Intelligent Shield Today.
            </h2>
            <p className="text-base sm:text-lg text-[#8794A8] leading-relaxed">
              Experience the unmatched security of AEGISOS multi-agent autonomous
              cyber defense. Secure your organization in under 5 minutes.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-10 py-6 text-base shadow-[0_0_30px_rgba(0,229,255,0.5)]"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Create Operator Account
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base"
              >
                Access Dashboard Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FOOTER
         ========================================================================= */}
      <footer className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#05070B] text-sm text-[#8794A8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1.5px]">
                <div className="w-full h-full bg-[#080B12] rounded-[9px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#00E5FF]" />
                </div>
              </div>
              <span className="text-lg font-black tracking-widest text-[#F4F7FB]">
                AEGIS<span className="text-[#00E5FF]">OS</span>
              </span>
            </Link>
            <p className="text-xs text-[#8794A8] leading-relaxed">
              Autonomous multi-agent cyber defense platform defending digital infrastructure
              against zero-day social engineering, phishing, and exploits.
            </p>
          </div>

          {/* Col 2: Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F4F7FB]">
              Defense Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-[#00E5FF] transition-colors">WebGuard Sentinel</a></li>
              <li><a href="#features" className="hover:text-[#00E5FF] transition-colors">MessageGuard NLP</a></li>
              <li><a href="#features" className="hover:text-[#00E5FF] transition-colors">MediaGuard Vision</a></li>
              <li><a href="#features" className="hover:text-[#00E5FF] transition-colors">AppGuard Sandbox</a></li>
              <li><a href="#features" className="hover:text-[#00E5FF] transition-colors">NetworkGuard Probe</a></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F4F7FB]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#architecture" className="hover:text-[#00E5FF] transition-colors">Multi-Agent Consensus</a></li>
              <li><Link href="/dashboard" className="hover:text-[#00E5FF] transition-colors">Security Operations Center</Link></li>
              <li><Link href="/dashboard/investigations" className="hover:text-[#00E5FF] transition-colors">Incident Timeline</Link></li>
              <li><Link href="/dashboard/analytics" className="hover:text-[#00E5FF] transition-colors">Threat Analytics</Link></li>
              <li><a href="#how-it-works" className="hover:text-[#00E5FF] transition-colors">MITRE ATT&CK Matrix</a></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F4F7FB]">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#00E5FF] cursor-pointer">SOC 2 Type II Certified</li>
              <li className="hover:text-[#00E5FF] cursor-pointer">GDPR & HIPAA Compliant</li>
              <li className="hover:text-[#00E5FF] cursor-pointer">Privacy & Telemetry Policy</li>
              <li className="hover:text-[#00E5FF] cursor-pointer">Vulnerability Disclosure</li>
              <li className="hover:text-[#00E5FF] cursor-pointer">Status & Incident Log</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8794A8]">
          <p>© {new Date().getFullYear()} AEGISOS Systems, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span className="hover:text-[#00E5FF] cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-[#00E5FF] cursor-pointer">API Reference</span>
            <span className="hover:text-[#00E5FF] cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
