"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon, icons } from "@/components/ui/icon";

interface PlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  playing: boolean;
  size?: number;
  accentColor?: string;
  variant?: "accent" | "ghost";
}

export function PlayButton({ playing, size = 26, accentColor, variant = "accent", className, ...props }: PlayButtonProps) {
  const iconSize = Math.round(size * 0.38);

  const accentBg = accentColor ?? "var(--aw-accent)";
  const isAccent = variant === "accent";

  return (
    <button
      className={cn(
        "rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border flex-shrink-0",
        isAccent
          ? "border-transparent"
          : "bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.1)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        ...(isAccent ? { background: accentBg } : {}),
      }}
      {...props}
    >
      <Icon
        d={playing ? icons.pause[0] : icons.play}
        size={iconSize}
        fill={playing ? "none" : isAccent ? "white" : "rgba(255,255,255,0.7)"}
        color={isAccent ? "white" : "rgba(255,255,255,0.7)"}
      />
    </button>
  );
}
