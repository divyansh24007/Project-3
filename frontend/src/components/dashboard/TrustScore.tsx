'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface TrustScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export default function TrustScore({
  score = 88,
  size = 220,
  strokeWidth = 14,
  label = 'Digital Trust Score',
  sublabel = 'Autonomous System Health',
}: TrustScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const increment = score / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  // Determine color and status based on score thresholds
  let strokeColor = '#00D68F'; // Green 80+
  let statusText = 'Optimal Protection';
  let StatusIcon = ShieldCheck;
  let glowColor = 'rgba(0, 214, 143, 0.4)';

  if (score < 40) {
    strokeColor = '#FF4560'; // Red < 40
    statusText = 'Critical Vulnerability';
    StatusIcon = ShieldAlert;
    glowColor = 'rgba(255, 69, 96, 0.4)';
  } else if (score < 60) {
    strokeColor = '#FFB020'; // Yellow 40-59
    statusText = 'Elevated Risk';
    StatusIcon = ShieldAlert;
    glowColor = 'rgba(255, 176, 32, 0.4)';
  } else if (score < 80) {
    strokeColor = '#00E5FF'; // Cyan 60-79
    statusText = 'Moderate Security';
    StatusIcon = Shield;
    glowColor = 'rgba(0, 229, 255, 0.4)';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Ambient Back Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: strokeColor }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="trustScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor={strokeColor} />
              <stop offset="100%" stopColor="#7C4DFF" />
            </linearGradient>
            <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={glowColor} />
            </filter>
          </defs>

          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Animated Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#trustScoreGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            filter="url(#scoreGlow)"
          />
        </svg>

        {/* Center Contents */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-baseline"
          >
            <span className="text-5xl font-black tracking-tight text-[#F4F7FB] font-mono">
              {displayScore}
            </span>
            <span className="text-xl font-bold text-[#8794A8] ml-1">/100</span>
          </motion.div>

          <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold" style={{ color: strokeColor }}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Label Below */}
      <div className="text-center mt-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-[#F4F7FB]">{label}</h3>
        <p className="text-xs text-[#8794A8] mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}
