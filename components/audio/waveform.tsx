"use client";

import { useMemo } from "react";

interface WaveformProps {
  bars?: number;
  playing?: boolean;
  color?: string;
  dim?: boolean;
  className?: string;
}

export function Waveform({
  bars = 60,
  playing = false,
  color = "var(--aw-accent)",
  dim = false,
  className,
}: WaveformProps) {
  const barData = useMemo(() => {
    return Array.from({ length: bars }, (_, i) => {
      const t = i / Math.max(1, bars - 1);
      const env = Math.sin(t * Math.PI) * 0.65 + 0.35;
      const seed = i * 137.5;
      const wave = Math.abs(
        Math.sin(seed) * Math.cos(seed * 0.7) * 0.7 + Math.sin(seed * 2.3) * 0.3,
      );
      const height = Math.max(0.1, Math.min(1, wave * env + 0.08));
      // Pseudo-random duration between 1.4s and 2.8s per bar — matches player bar speed
      const dur = 1.4 + ((i * 23 + 7) % 17) / 17 * 1.4;
      // Staggered delay so bars feel independent
      const delay = ((i * 11) % 19) / 19 * 1.2;
      return { height, dur, delay };
    });
  }, [bars]);

  const fill = dim
    ? "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))"
    : `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 45%, transparent))`;

  return (
    <div className={`flex items-end gap-[2px] h-full w-full ${className ?? ""}`}>
      {barData.map(({ height, dur, delay }, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 2,
            height: `${height * 100}%`,
            minHeight: 2,
            background: fill,
            borderRadius: 3,
            opacity: dim ? 0.55 : 0.88,
            transformOrigin: "bottom",
            animation: playing
              ? `eq-bar ${dur}s ease-in-out ${delay}s infinite`
              : "none",
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
