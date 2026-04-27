"use client";

import { useRef } from "react";
import { Play, Pause, Download } from "lucide-react";
import { useWaveSurfer } from "@/hooks/use-wavesurfer";
import { WaveformTimeline } from "@/components/edit/waveform-timeline";
import { formatTimeWithDecimal } from "@/lib/utils";

interface AlbumWaveformPlayerProps {
  label: string;
  title: string | null;
  audioUrl: string | null;
  duration: number | null;
}

export function AlbumWaveformPlayer({
  label,
  title,
  audioUrl,
  duration: hintDuration,
}: AlbumWaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isPlaying,
    currentTime,
    duration: wsDuration,
    togglePlay,
  } = useWaveSurfer({
    containerRef,
    audioSrc: audioUrl ?? undefined,
    height: 100,
    barWidth: 2,
    barGap: 1,
  });

  if (!audioUrl) {
    return (
      <div
        className="rounded-[10px] border overflow-hidden"
        style={{
          background: "#0a0a0a",
          borderColor: "rgba(232,160,85,0.15)",
        }}
      >
        <div className="h-[60px] flex items-center justify-center text-[11px] text-[color:var(--aw-text-3)]">
          Audio not available
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-[10px] border overflow-hidden flex flex-col"
      style={{
        background: "#0a0a0a",
        borderColor: "rgba(232,160,85,0.15)",
        boxShadow:
          "0 0 0 0.5px rgba(232,160,85,0.04) inset, 0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          borderColor: "rgba(232,160,85,0.1)",
          background: "rgba(232,160,85,0.03)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            disabled={wsDuration === 0}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ background: "var(--aw-accent)", color: "#000" }}
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play
                size={12}
                fill="currentColor"
                className="translate-x-[1px]"
              />
            )}
          </button>
          <span
            className="font-mono text-[12px] tabular-nums"
            style={{ color: "var(--aw-accent)" }}
          >
            {formatTimeWithDecimal(currentTime)}
            <span className="text-[10px] opacity-50 ml-1">
              / {formatTimeWithDecimal(wsDuration || hintDuration || 0)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {title && (
            <span className="text-[10px] text-[color:var(--aw-text-3)] truncate max-w-[120px]">
              {title}
            </span>
          )}
          <span
            className="text-[9px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full border"
            style={{
              color: "var(--aw-accent)",
              borderColor: "rgba(232,160,85,0.25)",
              background: "rgba(232,160,85,0.08)",
            }}
          >
            {label}
          </span>
          <button
            onClick={() => {
              const fileName = title 
                ? `${title.replace(/[^a-z0-9]/gi, "_")}.mp3`
                : `${label.replace(/\s+/g, "_")}.mp3`;
              import("@/lib/utils").then(u => u.downloadUrl(audioUrl, fileName));
            }}
            className="p-1.5 rounded-full hover:bg-[rgba(232,160,85,0.1)] transition-colors text-[color:var(--aw-text-3)] hover:text-[color:var(--aw-accent)]"
            title="Download this version"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      <WaveformTimeline duration={wsDuration} majorCount={3} />

      <div className="relative w-full px-4 py-3">
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}
