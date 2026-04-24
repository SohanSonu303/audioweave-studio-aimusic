"use client";

import { useRef } from "react";
import { Play, Pause, Download } from "lucide-react";
import { useWaveSurfer } from "@/hooks/use-wavesurfer";
import { WaveformTimeline } from "@/components/edit/waveform-timeline";
import { formatTimeWithDecimal } from "@/lib/utils";
import type WaveSurfer from "wavesurfer.js";

interface ResultWaveformProps {
  audioBlobUrl: string;
  audioFormat?: "mp3" | "wav";
  label?: string;
  onReady?: (ws: WaveSurfer) => void;
  onDownload?: () => void;
}

export function ResultWaveform({
  audioBlobUrl,
  audioFormat,
  label = "Result",
  onReady,
  onDownload,
}: ResultWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isPlaying, currentTime, duration, togglePlay } = useWaveSurfer({
    containerRef,
    audioSrc: audioBlobUrl,
    enableRegions: false,
    height: 100,
    barWidth: 2,
    barGap: 1,
    progressColor: "#60c090",
    onReady,
  });

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background: "#0a0a0a",
        borderColor: "rgba(96,192,144,0.2)",
        boxShadow: "0 0 0 0.5px rgba(96,192,144,0.06) inset, 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "rgba(96,192,144,0.12)", background: "rgba(96,192,144,0.04)" }}
      >
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={duration === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ background: "var(--aw-green)", color: "#000" }}
          >
            {isPlaying
              ? <Pause size={14} fill="currentColor" />
              : <Play size={14} fill="currentColor" className="translate-x-[1px]" />
            }
          </button>

          {/* Time */}
          <span className="font-mono text-[13px] tabular-nums" style={{ color: "var(--aw-green)" }}>
            {formatTimeWithDecimal(currentTime)}
            <span className="text-[11px] opacity-50 ml-1">/ {formatTimeWithDecimal(duration)}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Label pill */}
          <span
            className="text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full border"
            style={{ color: "var(--aw-green)", borderColor: "rgba(96,192,144,0.25)", background: "rgba(96,192,144,0.08)" }}
          >
            {label}
          </span>

          {/* Download */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all hover:opacity-80"
              style={{ color: "var(--aw-accent)", borderColor: "rgba(232,160,85,0.3)", background: "rgba(232,160,85,0.06)" }}
            >
              <Download size={11} />
              {audioFormat ? audioFormat.toUpperCase() : "Download"}
            </button>
          )}
        </div>
      </div>

      <WaveformTimeline duration={duration} />

      <div className="w-full px-6 py-4">
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}
