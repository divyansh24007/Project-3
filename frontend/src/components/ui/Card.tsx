"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  glow?: boolean;
  glowColor?: "cyan" | "purple" | "critical" | "success";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      glow = false,
      glowColor = "cyan",
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        "bg-[#151E2D]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg",
      elevated:
        "bg-[#101725]/90 backdrop-blur-xl border border-[#00E5FF]/20 rounded-xl shadow-2xl shadow-black/60",
      interactive:
        "bg-[#151E2D]/80 backdrop-blur-md border border-white/10 rounded-xl transition-all duration-300 hover:border-[#00E5FF]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00E5FF]/10 cursor-pointer",
    };

    const glowClasses = {
      cyan: "shadow-[0_0_25px_rgba(0,229,255,0.18)] border-[#00E5FF]/35",
      purple: "shadow-[0_0_25px_rgba(124,77,255,0.22)] border-[#7C4DFF]/35",
      critical: "shadow-[0_0_25px_rgba(255,69,96,0.25)] border-[#FF4560]/35",
      success: "shadow-[0_0_25px_rgba(0,214,143,0.22)] border-[#00D68F]/35",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          variantClasses[variant],
          glow && glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-white/5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-bold tracking-tight text-[#F4F7FB]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#8794A8]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t border-white/5", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
