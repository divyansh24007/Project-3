"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-[#8794A8]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#8794A8]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-11 px-3.5 bg-[#101725]/80 border rounded-lg text-sm text-[#F4F7FB] placeholder:text-[#8794A8]/50 backdrop-blur-md transition-all duration-200 outline-none",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-[#FF4560] focus:border-[#FF4560] focus:ring-1 focus:ring-[#FF4560] shadow-[0_0_12px_rgba(255,69,96,0.2)]"
                : "border-white/10 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)]",
              disabled && "opacity-50 cursor-not-allowed bg-[#080B12]/50",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[#8794A8]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#FF4560] flex items-center gap-1 mt-1 font-medium">
            <span>●</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#8794A8]/80">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
