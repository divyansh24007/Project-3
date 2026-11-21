"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "safe" | "low" | "medium" | "high" | "critical";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  dot?: boolean;
}

export function Badge({
  variant = "safe",
  pulse,
  dot = true,
  className,
  children,
  ...props
}: BadgeProps) {
  const isCritical = variant === "critical";
  const shouldPulse = pulse !== undefined ? pulse : isCritical;

  const variantStyles: Record<
    BadgeVariant,
    { bg: string; text: string; border: string; dot: string; glow: string }
  > = {
    safe: {
      bg: "bg-[#00D68F]/15",
      text: "text-[#00D68F]",
      border: "border-[#00D68F]/40",
      dot: "bg-[#00D68F]",
      glow: "shadow-[0_0_10px_rgba(0,214,143,0.3)]",
    },
    low: {
      bg: "bg-[#00B0FF]/15",
      text: "text-[#00B0FF]",
      border: "border-[#00B0FF]/40",
      dot: "bg-[#00B0FF]",
      glow: "shadow-[0_0_10px_rgba(0,176,255,0.3)]",
    },
    medium: {
      bg: "bg-[#FFB020]/15",
      text: "text-[#FFB020]",
      border: "border-[#FFB020]/40",
      dot: "bg-[#FFB020]",
      glow: "shadow-[0_0_10px_rgba(255,176,32,0.3)]",
    },
    high: {
      bg: "bg-[#FF6D00]/15",
      text: "text-[#FF6D00]",
      border: "border-[#FF6D00]/40",
      dot: "bg-[#FF6D00]",
      glow: "shadow-[0_0_10px_rgba(255,109,0,0.3)]",
    },
    critical: {
      bg: "bg-[#FF4560]/20",
      text: "text-[#FF4560]",
      border: "border-[#FF4560]/50",
      dot: "bg-[#FF4560]",
      glow: "shadow-[0_0_14px_rgba(255,69,96,0.5)]",
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border select-none transition-all",
        current.bg,
        current.text,
        current.border,
        current.glow,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {shouldPulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                current.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              current.dot
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
