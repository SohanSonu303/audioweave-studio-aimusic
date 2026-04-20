"use client";

import { Icon, icons } from "@/components/ui/icon";

interface PlaybackBarProps {
  playing: boolean;
  onPlayToggle: () => void;
  playhead: number;
  onSeek: (pct: number) => void;
  currentTime: string;
  duration: string;
}

export function PlaybackBar({ playing, onPlayToggle, playhead, onSeek, currentTime, duration }: PlaybackBarProps) {
  return (
    <div className="px-7 py-[10px] border-b border-[color:var(--aw-border)] flex items-center gap-[14px] flex-shrink-0">
      <button
        onClick={onPlayToggle}
        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.09)", border: "1px solid var(--aw-border-md)" }}
      >
        <Icon
          d={playing ? icons.pause[0] : icons.play}
          size={12}
          fill={playing ? "none" : "rgba(255,255,255,0.8)"}
          color="rgba(255,255,255,0.8)"
        />
      </button>
      <span
        className="text-[11px] text-[color:var(--aw-text-3)] w-[34px]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {currentTime}
      </span>
      {/* Playhead slider */}
      <div
        className="flex-1 h-[3px] bg-[rgba(255,255,255,0.08)] rounded-[3px] relative cursor-pointer"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - r.left) / r.width) * 100);
        }}
      >
        <div
          className="h-full rounded-[3px] pointer-events-none"
          style={{ width: `${playhead}%`, background: "rgba(255,255,255,0.35)" }}
        />
        <div
          className="absolute top-1/2 rounded-full bg-white pointer-events-none"
          style={{
            left: `${playhead}%`,
            transform: "translate(-50%,-50%)",
            width: 10,
            height: 10,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.2)",
          }}
        />
      </div>
      <span
        className="text-[11px] text-[color:var(--aw-text-3)] w-[34px]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {duration}
      </span>
    </div>
  );
}
