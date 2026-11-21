"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state resolved and no user, we allow preview with warning or redirect
    if (!loading && !user) {
      // In development or when demo user is not set, allow seamless access with guest operator profile
      const isDemoAllowed = true;
      if (!isDemoAllowed) {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center space-y-4">
        <Spinner size="xl" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] animate-pulse">
          Authenticating AEGIS Defense Mesh...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex flex-col lg:flex-row text-[#F4F7FB]">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
