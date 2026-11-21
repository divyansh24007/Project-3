'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  showNeedle?: boolean;
}

export default function RiskGauge({
  score,
  size = 200,
  label = 'Threat Severity Assessment',
  showNeedle = true,
}: RiskGaugeProps) {
  // Clamped score
  const safeScore = Math.max(0, Math.min(100, score));

  // Determine severity tier
  let severityLabel = 'Safe / Clean';
  let severityColor = '#00D68F'; // Green
  let badgeBg = 'rgba(0, 214, 143, 0.15)';

  if (safeScore >= 80) {
    severityLabel = 'Critical Risk';
    severityColor = '#FF4560';
    badgeBg = 'rgba(255, 69, 96, 0.15)';
  } else if (safeScore >= 60) {
    severityLabel = 'High Risk';
    severityColor = '#FFB020';
    badgeBg = 'rgba(255, 176, 32, 0.15)';
  } else if (safeScore >= 35) {
    severityLabel = 'Medium Risk';
    severityColor = '#00E5FF';
    badgeBg = 'rgba(0, 229, 255, 0.15)';
  } else if (safeScore >= 15) {
    severityLabel = 'Low Risk';
    severityColor = '#7C4DFF';
    badgeBg = 'rgba(124, 77, 255, 0.15)';
  }

  // Semi-circle math
  // Arc angle spans 180 degrees (-180 to 0 or 180 to 360)
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Needle angle (-90deg at 0 score, +90deg at 100 score)
  const needleAngle = -90 + (safeScore / 100) * 180;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size * 0.62 }}
      >
        <svg
          width={size}
          height={size}
          className="absolute top-0"
          style={{ transform: 'rotate(180deg)' }}
        >
          <defs>
            {/* Color segments gradient */}
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D68F" />
              <stop offset="25%" stopColor="#7C4DFF" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="75%" stopColor="#FFB020" />
              <stop offset="100%" stopColor="#FF4560" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={severityColor} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Active Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Needle */}
        {showNeedle && (
          <motion.div
            className="absolute bottom-2 origin-bottom w-1 h-20 flex flex-col items-center pointer-events-none"
            initial={{ rotate: -90 }}
            animate={{ rotate: needleAngle }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor }} />
            <div
              className="w-1 h-14 rounded-full"
              style={{
                background: `linear-gradient(to top, ${severityColor}, transparent)`,
              }}
            />
          </motion.div>
        )}

        {/* Center Pivot Point */}
        <div className="absolute bottom-1 w-5 h-5 rounded-full bg-[#151E2D] border-2 border-white/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor }} />
        </div>
      </div>

      {/* Numerical score & Severity Badge */}
      <div className="flex flex-col items-center mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black font-mono tracking-tight" style={{ color: severityColor }}>
            {safeScore}
          </span>
          <span className="text-sm font-semibold text-[#8794A8]">/100</span>
        </div>

        <div
          className="mt-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border"
          style={{
            backgroundColor: badgeBg,
            borderColor: `${severityColor}40`,
            color: severityColor,
          }}
        >
          {severityLabel}
        </div>

        {label && <p className="text-xs text-[#8794A8] mt-2 text-center">{label}</p>}
      </div>
    </div>
  );
}
