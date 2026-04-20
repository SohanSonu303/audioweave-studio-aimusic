"use client";

import { useState, useEffect } from "react";

interface WaveformProps {
  bars?: number;
  playing?: boolean;
  color?: string;
  dim?: boolean;
  className?: string;
}

export function Waveform({ bars = 60, playing = false, color = "var(--aw-accent)", dim = false, className }: WaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    const seed = Math.random() * 1000;
    setHeights(
      Array.from({ length: bars }, (_, i) => {
        const x = (i / bars) * Math.PI * 6 + seed;
        return 0.15 + Math.abs(Math.sin(x) * Math.cos(x * 0.7) * 0.7 + Math.sin(x * 2.3) * 0.3);
      }),
    );
  }, [bars]);

  return (
    <div className={`flex items-center gap-[2px] h-full w-full ${className ?? ""}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h * 100}%`,
            minHeight: 2,
            background: dim ? "rgba(255,255,255,0.15)" : color,
            borderRadius: 2,
            opacity: dim ? 0.5 : 0.85,
            animation: playing ? `waveform-pulse ${0.5 + (i % 7) * 0.08}s ease-in-out infinite` : "none",
            animationDelay: `${(i % 5) * 0.06}s`,
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
