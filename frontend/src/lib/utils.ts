import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export function formatRiskLevel(scoreOrLevel: number | string | undefined | null): RiskLevel {
  if (scoreOrLevel === undefined || scoreOrLevel === null) return "safe";

  if (typeof scoreOrLevel === "number") {
    if (scoreOrLevel < 20) return "safe";
    if (scoreOrLevel < 45) return "low";
    if (scoreOrLevel < 70) return "medium";
    if (scoreOrLevel < 90) return "high";
    return "critical";
  }

  const normalized = scoreOrLevel.toString().toLowerCase().trim();
  if (normalized.includes("crit")) return "critical";
  if (normalized.includes("high")) return "high";
  if (normalized.includes("med")) return "medium";
  if (normalized.includes("low")) return "low";
  return "safe";
}

export function getRiskColor(level: string | undefined | null): {
  text: string;
  bg: string;
  border: string;
  glow: string;
  hex: string;
} {
  const normalized = formatRiskLevel(level);

  switch (normalized) {
    case "safe":
      return {
        text: "text-[#00D68F]",
        bg: "bg-[#00D68F]/10",
        border: "border-[#00D68F]/30",
        glow: "shadow-[0_0_15px_rgba(0,214,143,0.3)]",
        hex: "#00D68F",
      };
    case "low":
      return {
        text: "text-[#00B0FF]",
        bg: "bg-[#00B0FF]/10",
        border: "border-[#00B0FF]/30",
        glow: "shadow-[0_0_15px_rgba(0,176,255,0.3)]",
        hex: "#00B0FF",
      };
    case "medium":
      return {
        text: "text-[#FFB020]",
        bg: "bg-[#FFB020]/10",
        border: "border-[#FFB020]/30",
        glow: "shadow-[0_0_15px_rgba(255,176,32,0.3)]",
        hex: "#FFB020",
      };
    case "high":
      return {
        text: "text-[#FF6D00]",
        bg: "bg-[#FF6D00]/10",
        border: "border-[#FF6D00]/30",
        glow: "shadow-[0_0_15px_rgba(255,109,0,0.3)]",
        hex: "#FF6D00",
      };
    case "critical":
    default:
      return {
        text: "text-[#FF4560]",
        bg: "bg-[#FF4560]/10",
        border: "border-[#FF4560]/30",
        glow: "shadow-[0_0_18px_rgba(255,69,96,0.4)]",
        hex: "#FF4560",
      };
  }
}

export function getRiskIcon(level: string | undefined | null): LucideIcon {
  const normalized = formatRiskLevel(level);

  switch (normalized) {
    case "safe":
      return ShieldCheck;
    case "low":
      return Info;
    case "medium":
      return AlertTriangle;
    case "high":
      return ShieldAlert;
    case "critical":
    default:
      return ShieldX;
  }
}

export function formatDate(
  dateInput: string | number | Date | null | undefined,
  includeTime: boolean = true
): string {
  if (!dateInput) return "N/A";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }
        : {}),
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatRelativeTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "Just now";
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${Math.max(1, diffSeconds)}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(date, false);
  } catch {
    return "Recently";
  }
}

export function truncateString(str: string, maxLen: number = 40): string {
  if (!str) return "";
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 3)}...`;
}
