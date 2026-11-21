"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  ShieldCheck,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  onMobileMenuToggle?: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "1",
      title: "Zero-Day Exploit Blocked",
      desc: "WebGuard neutralized an AitM phishing attempt targeting Okta credentials.",
      time: "4m ago",
      type: "critical",
    },
    {
      id: "2",
      title: "Investigation Updated",
      desc: "INV-8490 Quishing analysis completed with 98% confidence score.",
      time: "28m ago",
      type: "info",
    },
    {
      id: "3",
      title: "Agent Verification Synchronized",
      desc: "MediaGuard and AppGuard updated heuristic weights.",
      time: "1h ago",
      type: "success",
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#080B12]/80 backdrop-blur-xl border-b border-white/5">
      {/* Left: Mobile hamburger & Search input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-[#8794A8] hover:text-[#00E5FF] hover:bg-white/5 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8794A8]" />
          <input
            type="text"
            placeholder="Search targets, IP addresses, domains, hash, CVEs..."
            className="w-full h-9 pl-10 pr-4 bg-[#101725] border border-white/10 rounded-lg text-xs text-[#F4F7FB] placeholder:text-[#8794A8]/60 focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 outline-none transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#8794A8]">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Shield Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-medium shadow-[0_0_12px_rgba(0,229,255,0.2)]">
          <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
          <span>AEGIS-SHIELD: LIVE</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#8794A8] hover:text-[#00E5FF] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4560] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4560]" />
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#151E2D] border border-white/10 shadow-2xl shadow-black/80 p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Security Alerts
                </span>
                <span className="text-[10px] text-[#00E5FF] hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#101725]/60 hover:bg-[#101725] border border-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#F4F7FB]">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#8794A8] whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#8794A8] mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/investigations"
                onClick={() => setShowNotifications(false)}
                className="mt-2 block text-center py-2 text-xs font-medium text-[#00E5FF] hover:bg-white/5 rounded-lg border border-[#00E5FF]/20 transition-colors"
              >
                View All Security Incidents →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[1.5px] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full bg-[#101725] rounded-[6px] flex items-center justify-center text-xs font-bold text-[#00E5FF]">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#151E2D] border border-white/10 shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-semibold text-[#F4F7FB] truncate">
                  {user?.user_metadata?.full_name || "Defense Operator"}
                </p>
                <p className="text-[11px] text-[#8794A8] truncate">
                  {user?.email || "operator@aegisos.internal"}
                </p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8794A8] hover:text-[#00E5FF] hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Security Settings
              </Link>
              <Link
                href="/"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8794A8] hover:text-[#00E5FF] hover:bg-white/5 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Public Landing Page
              </Link>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#FF4560] hover:bg-[#FF4560]/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
