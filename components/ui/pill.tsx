import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "lg";
  variant?: "default" | "exclude";
}

export function Pill({ children, active, size = "sm", variant = "default", className, ...props }: PillProps) {
  const isExclude = variant === "exclude";

  return (
    <button
      className={cn(
        "rounded-[var(--radius-pill)] font-medium tracking-[0.01em] cursor-pointer transition-all duration-150 border",
        size === "lg" ? "px-[18px] py-[10px] text-[13px]" : "px-3 py-[5px] text-[12px]",
        isExclude
          ? active
            ? "bg-[rgba(224,96,96,0.13)] text-[rgba(224,96,96,0.9)] border-[rgba(224,96,96,0.28)]"
            : "bg-[rgba(255,255,255,0.04)] text-[color:var(--aw-text-2)] border-[color:var(--aw-border)]"
          : active
            ? "bg-[rgba(232,160,85,0.2)] text-[color:var(--aw-accent)] border-[rgba(232,160,85,0.35)] shadow-[0_0_12px_rgba(232,160,85,0.12)]"
            : "bg-[rgba(255,255,255,0.05)] text-[color:var(--aw-text-2)] border-[color:var(--aw-border)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
