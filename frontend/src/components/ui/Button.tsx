"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00E5FF] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#00E5FF] text-[#080B12] font-semibold hover:bg-[#33EBFF] shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] border border-transparent",
        secondary:
          "bg-[#7C4DFF] text-white font-semibold hover:bg-[#966EFF] shadow-[0_0_20px_rgba(124,77,255,0.35)] hover:shadow-[0_0_25px_rgba(124,77,255,0.6)] border border-transparent",
        danger:
          "bg-[#FF4560] text-white font-semibold hover:bg-[#FF647C] shadow-[0_0_20px_rgba(255,69,96,0.35)] hover:shadow-[0_0_25px_rgba(255,69,96,0.6)] border border-transparent",
        outline:
          "border border-[#00E5FF]/40 bg-transparent text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.15)]",
        ghost:
          "bg-transparent text-[#F4F7FB] hover:bg-[#151E2D] hover:text-[#00E5FF]",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size={size === "sm" ? "sm" : size === "lg" ? "md" : "sm"}
            className={variant === "primary" ? "border-t-[#080B12]" : undefined}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
