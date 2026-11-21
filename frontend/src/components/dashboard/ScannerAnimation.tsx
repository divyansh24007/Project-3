'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Radio, Radar } from 'lucide-react';

interface ScannerAnimationProps {
  statusText?: string;
  subText?: string;
  activeAgents?: string[];
}

export default function ScannerAnimation({
  statusText = 'Analyzing Artifact...',
  subText = 'Multi-agent neural consensus verification in progress',
  activeAgents = ['WebGuard Ingestion', 'NLP Urgency Model', 'Threat Intel Lookup', 'Swarm Consensus'],
}: ScannerAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto">
      {/* Radar Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outermost Pulsing Ring 3 */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
        />

        {/* Ring 2 */}
        <motion.div
          animate={{ scale: [1, 1.22, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute inset-6 rounded-full border border-[#00E5FF]/30"
        />

        {/* Ring 1 */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute inset-12 rounded-full border border-[#7C4DFF]/40"
        />

        {/* Crosshair Grids */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF]/20 to-transparent" />
        </div>

        {/* Rotating Radar Sweep Beam */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full origin-center"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, rgba(0, 229, 255, 0.35) 0deg, rgba(124, 77, 255, 0.1) 60deg, transparent 120deg)',
            }}
          />
        </div>

        {/* Blips / Simulated Detected Nodes */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.5, 1], delay: 0.5 }}
          className="absolute top-16 right-20 w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, times: [0, 0.5, 1], delay: 1.2 }}
          className="absolute bottom-20 left-16 w-2 h-2 rounded-full bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF]"
        />

        {/* Center Target Core */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-[#101725] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Radar className="w-8 h-8 text-[#00E5FF]" />
          </motion.div>
        </div>
      </div>

      {/* Progress & Status */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
          <h4 className="text-base font-bold text-[#F4F7FB] tracking-wide">{statusText}</h4>
        </div>
        <p className="text-xs text-[#8794A8] mt-1 max-w-xs">{subText}</p>
      </div>

      {/* Dynamic Active Agent Chips */}
      {activeAgents && activeAgents.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm">
          {activeAgents.map((agent, i) => (
            <motion.div
              key={agent}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151E2D] border border-white/10 text-[11px] font-mono text-[#00E5FF]"
            >
              <Cpu className="w-3 h-3 text-[#7C4DFF]" />
              <span>{agent}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
