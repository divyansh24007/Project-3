'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  max?: number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  max,
  change,
  trend = 'up',
  subtext,
  icon: Icon,
  color = '#00E5FF',
  delay = 0,
}: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 1000;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-5 shadow-lg group hover:border-[#00E5FF]/20 transition-colors"
    >
      {/* Top Accent Gradient Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-[#8794A8]">
            {label}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-[#F4F7FB] font-mono">
              {count.toLocaleString()}
            </span>
            {max && (
              <span className="text-lg font-semibold text-[#8794A8] font-mono">
                /{max}
              </span>
            )}
          </div>
        </div>

        {/* Icon with glow background */}
        <div
          className="p-3 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            boxShadow: `0 0 15px ${color}1A`,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Footer trend info */}
      {(change || subtext) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {change && (
            <div
              className={`flex items-center gap-1 font-semibold ${
                isPositive ? 'text-[#00D68F]' : 'text-[#FF4560]'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{change}</span>
            </div>
          )}
          {subtext && (
            <span className="text-[#8794A8] text-[11px] truncate ml-auto">
              {subtext}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
