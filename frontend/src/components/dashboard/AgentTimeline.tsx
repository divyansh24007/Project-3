'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, Cpu, Sparkles, Terminal } from 'lucide-react';
import { InvestigationStep } from '@/lib/mockData';

interface AgentTimelineProps {
  steps: InvestigationStep[];
  title?: string;
}

export default function AgentTimeline({
  steps,
  title = 'AI Multi-Agent Swarm Timeline',
}: AgentTimelineProps) {
  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-[#00E5FF]" />
          <h4 className="text-sm font-semibold tracking-wider uppercase text-[#F4F7FB]">
            {title}
          </h4>
        </div>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#00E5FF] before:via-[#7C4DFF] before:to-white/10">
        {steps.map((step, idx) => {
          let nodeColor = '#00D68F'; // Complete default
          let StatusIcon = CheckCircle2;
          let badgeText = 'Completed';

          if (step.status === 'running') {
            nodeColor = '#FFB020';
            StatusIcon = Clock;
            badgeText = 'Running...';
          } else if (step.status === 'pending') {
            nodeColor = '#8794A8';
            StatusIcon = Clock;
            badgeText = 'Pending';
          } else if (step.severity === 'critical') {
            nodeColor = '#FF4560';
            StatusIcon = ShieldAlert;
          } else if (step.severity === 'warning') {
            nodeColor = '#FFB020';
            StatusIcon = AlertTriangle;
          }

          return (
            <motion.div
              key={`${step.agent}-${idx}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.12 }}
              className="relative group"
            >
              {/* Timeline Bullet Node */}
              <div
                className="absolute -left-[30px] top-1 w-5 h-5 rounded-full bg-[#101725] border-2 flex items-center justify-center transition-transform group-hover:scale-125"
                style={{
                  borderColor: nodeColor,
                  boxShadow: `0 0 10px ${nodeColor}66`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: nodeColor }}
                />
              </div>

              {/* Step Card */}
              <div className="rounded-lg bg-[#151E2D]/70 border border-white/5 p-4 hover:border-white/15 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/5 text-[#00E5FF]">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-[#F4F7FB]">
                        {step.agent}
                      </h5>
                      <span className="text-[11px] text-[#8794A8]">
                        {step.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-[#8794A8] bg-white/5 px-2 py-0.5 rounded">
                      {step.duration}
                    </span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: `${nodeColor}15`,
                        color: nodeColor,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{badgeText}</span>
                    </span>
                  </div>
                </div>

                {/* Finding Summary */}
                <p className="mt-2.5 text-xs text-[#F4F7FB]/90 leading-relaxed bg-[#080B12]/40 rounded-md p-2.5 border border-white/5 font-mono">
                  {step.finding}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
