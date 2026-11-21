"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "cyan" | "purple" | "white";
}

export function Spinner({
  size = "md",
  variant = "cyan",
  className,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
    xl: "w-16 h-16 border-4",
  };

  const variantClasses = {
    cyan: "border-[#00E5FF]/20 border-t-[#00E5FF]",
    purple: "border-[#7C4DFF]/20 border-t-[#7C4DFF]",
    white: "border-white/20 border-t-white",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={cn(
          "rounded-full animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
      {size === "xl" && (
        <div className="absolute w-6 h-6 rounded-full border border-[#00E5FF]/50 animate-ping opacity-60" />
      )}
    </div>
  );
}
