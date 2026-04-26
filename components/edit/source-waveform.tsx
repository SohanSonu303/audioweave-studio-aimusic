"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { useWaveSurfer } from "@/hooks/use-wavesurfer";
import type { CandidateWindow } from "@/lib/api/auto-edit";
import { useEditStore } from "@/stores/edit-store";
import { WaveformTimeline } from "@/components/edit/waveform-timeline";
import { formatTimeWithDecimal } from "@/lib/utils";
import type WaveSurfer from "wavesurfer.js";

interface SourceWaveformProps {
  audioSrc: string | File | Blob;
  candidates?: CandidateWindow[];
  chosenIndex?: number;
  onRegionClick?: (index: number) => void;
  abMode?: "trimmed" | "original";
  onTimeUpdate?: (time: number) => void;
  onReady?: (ws: WaveSurfer) => void;
}

export function SourceWaveform({
  audioSrc,
  candidates = [],
  chosenIndex,
  onRegionClick,
  abMode = "original",
  onTimeUpdate,
  onReady: onReadyExternal,
}: SourceWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setSourceDuration = useEditStore((s) => s.setSourceDuration);

  const onReady = useCallback(
    (ws: WaveSurfer) => {
      setSourceDuration(ws.getDuration());
      onReadyExternal?.(ws);
    },
    [setSourceDuration, onReadyExternal]
  );

  const { wavesurfer, regionsPlugin, isPlaying, currentTime, duration, togglePlay } = useWaveSurfer({
    containerRef,
    audioSrc,
    onReady,
    onTimeUpdate,
    enableRegions: true,
    height: 180,
    barWidth: 2,
    barGap: 1,
  });

  useEffect(() => {
    if (!regionsPlugin || !wavesurfer) return;
    regionsPlugin.clearRegions();

    candidates.forEach((candidate) => {
      const isChosen = candidate.index === chosenIndex;
      let color = isChosen ? "rgba(96,192,144,0.18)" : "rgba(160,160,160,0.08)";

      if (abMode === "original") {
        if (isChosen) {
          color = "rgba(96,192,144,0.22)";
          if (candidate.start > 0) {
            regionsPlugin.addRegion({
              start: 0,
              end: candidate.start,
              color: "rgba(224,96,96,0.14)",
              drag: false,
              resize: false,
              id: `removed-before-${candidate.index}`,
            });
          }
          if (duration && candidate.end < duration) {
            regionsPlugin.addRegion({
              start: candidate.end,
              end: duration,
              color: "rgba(224,96,96,0.14)",
              drag: false,
              resize: false,
              id: `removed-after-${candidate.index}`,
            });
          }
        } else {
          return;
        }
      }

      const region = regionsPlugin.addRegion({
        start: candidate.start,
        end: candidate.end,
        color,
        drag: false,
        resize: false,
        id: `candidate-${candidate.index}`,
      });

      region.on("click", (e: unknown) => {
        (e as Event).stopPropagation();
        if (onRegionClick) onRegionClick(candidate.index);
      });
    });
  }, [regionsPlugin, wavesurfer, candidates, chosenIndex, onRegionClick, abMode, duration]);

  const chosen = candidates.find((c) => c.index === chosenIndex);

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background: "#0a0a0a",
        borderColor: "rgba(232,160,85,0.2)",
        boxShadow: "0 0 0 0.5px rgba(232,160,85,0.04) inset, 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "rgba(232,160,85,0.12)", background: "rgba(232,160,85,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={duration === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ background: "var(--aw-accent)", color: "#000" }}
          >
            {isPlaying
              ? <Pause size={14} fill="currentColor" />
              : <Play size={14} fill="currentColor" className="translate-x-[1px]" />
            }
          </button>
          <span className="font-mono text-[13px] tabular-nums" style={{ color: "var(--aw-accent)" }}>
            {formatTimeWithDecimal(currentTime)}
            <span className="text-[11px] opacity-50 ml-1">/ {formatTimeWithDecimal(duration)}</span>
          </span>
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full border"
          style={{ color: "var(--aw-accent)", borderColor: "rgba(232,160,85,0.25)", background: "rgba(232,160,85,0.08)" }}
        >
          Original
        </span>
      </div>

      <WaveformTimeline duration={duration} />

      <div className="relative w-full px-6 py-5">
        <div ref={containerRef} className="w-full" />

        {/* Chosen region label (top-left of waveform) */}
        {chosen && duration > 0 && (
          <div
            className="pointer-events-none absolute top-3 left-8 font-mono text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 px-2.5 py-1 rounded backdrop-blur-md border z-10"
            style={{
              background: "rgba(0,0,0,0.55)",
              color: abMode === "original" ? "var(--aw-green)" : "var(--aw-accent)",
              borderColor:
                abMode === "original" ? "rgba(96,192,144,0.25)" : "rgba(232,160,85,0.25)",
            }}
          >
            Region · {formatShortTime(chosen.start)} – {formatShortTime(chosen.end)}
          </div>
        )}
      </div>
    </div>
  );
}

function formatShortTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
