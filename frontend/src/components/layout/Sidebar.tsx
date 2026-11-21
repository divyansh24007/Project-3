"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Scan,
  Search,
  Cpu,
  Smartphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Radio,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scanner", href: "/dashboard/scanner", icon: Scan },
  { name: "Investigations", href: "/dashboard/investigations", icon: Search, badge: "7" },
  { name: "Intelligence", href: "/dashboard/intelligence", icon: Cpu },
  { name: "Devices", href: "/dashboard/devices", icon: Smartphone },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator Alpha";
  const userRole = "Security Analyst";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#101725] border-r border-white/5 transition-all duration-300 ease-in-out lg:static",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 bg-[#080B12]/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7C4DFF] p-[1.5px] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <div className="w-full h-full bg-[#080B12] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-white">
                  AEGIS<span className="text-[#00E5FF]">OS</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#00E5FF] uppercase -mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D68F] animate-pulse" />
                  Shield Active
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#8794A8] hover:text-[#00E5FF] hover:bg-white/5 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Live Defense Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-[#151E2D]/60 border border-[#00E5FF]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00D68F] animate-pulse" />
              <span className="text-xs font-medium text-[#F4F7FB]">
                Neural Mesh
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00D68F] bg-[#00D68F]/10 px-2 py-0.5 rounded border border-[#00D68F]/30 font-semibold">
              OPTIMAL
            </span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-[#00E5FF]/15 to-[#7C4DFF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    : "text-[#8794A8] hover:text-[#F4F7FB] hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-[#00E5FF]" : "text-[#8794A8]"
                  )}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#FF4560]/20 text-[#FF4560] border border-[#FF4560]/40">
                    {item.badge}
                  </span>
                )}

                {/* Left Active Glow Pill */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00E5FF] rounded-r-full shadow-[0_0_8px_#00E5FF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-white/5 bg-[#080B12]/30">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl bg-[#151E2D]/50 border border-white/5",
              isCollapsed && "justify-center p-1.5"
            )}
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] text-[#080B12] font-bold text-sm shadow-[0_0_10px_rgba(124,77,255,0.4)]">
              {userDisplayName.charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00D68F] ring-2 ring-[#101725]" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F4F7FB] truncate">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-[#8794A8] truncate">{userRole}</p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => signOut()}
                className="p-1.5 text-[#8794A8] hover:text-[#FF4560] hover:bg-[#FF4560]/10 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
