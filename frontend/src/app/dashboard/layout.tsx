'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Radar,
  History,
  Database,
  Smartphone,
  BarChart3,
  Sliders,
  PlayCircle,
  Menu,
  X,
  Radio,
  Search,
  Bell,
  Cpu,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const navigationLinks = [
  { name: 'Security Overview', href: '/dashboard', icon: ShieldCheck },
  { name: 'Threat Scanner', href: '/dashboard/scanner', icon: Radar },
  { name: 'Investigations', href: '/dashboard/investigations', icon: History },
  { name: 'Threat Intelligence', href: '/dashboard/intelligence', icon: Database },
  { name: 'Device Security', href: '/dashboard/devices', icon: Smartphone },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Demo Mode', href: '/dashboard/demo', icon: PlayCircle, badge: 'Interactive' },
  { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F4F7FB] flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#101725]/80 backdrop-blur-xl shrink-0 z-40">
        {/* Logo / Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1px] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <div className="w-full h-full rounded-[7px] bg-[#080B12] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-black tracking-wider text-[#F4F7FB]">
                AEGIS<span className="text-[#00E5FF]">OS</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#8794A8] -mt-1 font-mono">
                Autonomous Defense
              </span>
            </div>
          </Link>
        </div>

        {/* System Online Status Indicator */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg bg-[#151E2D]/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D68F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D68F]" />
            </span>
            <span className="text-[11px] font-mono text-[#F4F7FB]">SENTINEL ACTIVE</span>
          </div>
          <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navigationLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'text-[#00E5FF] bg-[#151E2D] border border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.08)]'
                    : 'text-[#8794A8] hover:text-[#F4F7FB] hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#00E5FF]"
                  />
                )}
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#00E5FF]' : 'text-[#8794A8] group-hover:text-[#F4F7FB]'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#7C4DFF]/20 text-[#7C4DFF] border border-[#7C4DFF]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Agent Engine Status Card */}
        <div className="p-4 border-t border-white/5">
          <div className="rounded-xl bg-[#151E2D]/90 p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-[#7C4DFF]" />
              <span className="text-xs font-semibold text-[#F4F7FB]">Swarm Health</span>
            </div>
            <div className="w-full bg-[#080B12] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] h-full w-[96%]" />
            </div>
            <div className="flex justify-between text-[10px] text-[#8794A8] mt-1 font-mono">
              <span>Consensus: 99.4%</span>
              <span>18ms avg</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-white/5 bg-[#101725]/90 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1px]">
            <div className="w-full h-full rounded-[7px] bg-[#080B12] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
            </div>
          </div>
          <span className="font-mono text-base font-black tracking-wider text-[#F4F7FB]">
            AEGIS<span className="text-[#00E5FF]">OS</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 text-[#8794A8] hover:text-[#F4F7FB]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/5 bg-[#101725] px-4 py-3 space-y-1 z-40 overflow-hidden"
          >
            {navigationLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'text-[#00E5FF] bg-[#151E2D]'
                      : 'text-[#8794A8] hover:text-[#F4F7FB]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex h-16 border-b border-white/5 px-8 items-center justify-between bg-[#080B12]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-[#8794A8]">
            <span className="font-mono text-[#00E5FF]">DEFENSE-TERMINAL</span>
            <span>/</span>
            <span className="text-[#F4F7FB] capitalize">
              {pathname === '/dashboard'
                ? 'Overview'
                : pathname.replace('/dashboard/', '').replace('/', ' / ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Threat Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8794A8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search IOC, domain, hash..."
                className="w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[#151E2D]/60 border border-white/10 text-xs text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
              />
            </div>

            {/* Notifications Button */}
            <button className="relative p-2 rounded-lg bg-white/5 text-[#8794A8] hover:text-[#F4F7FB] border border-white/5">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00E5FF]" />
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#151E2D] flex items-center justify-center text-xs font-bold font-mono text-[#00E5FF]">
                  SO
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#F4F7FB]">SecOps Admin</span>
                <span className="text-[10px] text-[#8794A8]">SOC L3 Lead</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
