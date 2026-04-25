"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlbumProgress } from "@/lib/api/album";

/** Status indicator styling */
const TRACK_STATUS: Record<string, { bg: string; color: string; label: string; animate?: boolean }> = {
  PENDING:   { bg: "rgba(255,255,255,0.06)", color: "var(--aw-text-3)", label: "Waiting…" },
  IN_QUEUE:  { bg: "rgba(232,160,85,0.12)",  color: "var(--aw-accent)", label: "Generating…", animate: true },
  COMPLETED: { bg: "rgba(96,192,144,0.12)",   color: "var(--aw-green)",  label: "Done" },
  FAILED:    { bg: "rgba(224,96,96,0.12)",    color: "var(--aw-red)",    label: "Failed" },
  ERROR:     { bg: "rgba(224,96,96,0.12)",    color: "var(--aw-red)",    label: "Error" },
};

interface GeneratingViewProps {
  albumId: string;
}

export function GeneratingView({ albumId }: GeneratingViewProps) {
  const qc = useQueryClient();
  const { data: progress } = useAlbumProgress(albumId);

  const completed = progress?.tracks_completed ?? 0;
  const total = progress?.tracks_total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const tracks = progress?.tracks ?? [];

  // When overall status exits GENERATING, invalidate album to swap views
  useEffect(() => {
    if (
      progress?.status &&
      progress.status !== "GENERATING" &&
      progress.status !== "PLANNING"
    ) {
      qc.invalidateQueries({ queryKey: ["album", albumId] });
    }
  }, [progress?.status, albumId, qc]);

  return (
    <div className="flex flex-col items-center py-10 gap-8">
      {/* Overall progress */}
      <div className="w-full max-w-[480px]">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[13px] text-[color:var(--aw-text)]">
            Generating tracks…
          </span>
          <span className="text-[12px] text-[color:var(--aw-text-2)] font-mono">
            {completed}/{total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[6px] bg-[rgba(255,255,255,0.07)] rounded-[3px] overflow-hidden">
          <div
            className="h-full rounded-[3px] transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.6))",
              animation: pct < 100 ? "progress-glow 1.5s ease infinite" : "none",
            }}
          />
        </div>
      </div>

      {/* Track list */}
      <div className="w-full max-w-[480px] flex flex-col gap-[6px]">
        {tracks.map((track, i) => {
          const status = TRACK_STATUS[track.status] ?? TRACK_STATUS.PENDING;
          return (
            <div
              key={track.track_number}
              className="flex items-center gap-3 px-4 py-[10px] rounded-[8px] transition-colors duration-200 fade-in"
              style={{
                background: "var(--aw-card)",
                border: "1px solid var(--aw-border)",
                animationDelay: `${i * 40}ms`,
              }}
            >
              {/* Track number */}
              <span className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-bold bg-[rgba(255,255,255,0.06)] text-[color:var(--aw-text-3)] flex-shrink-0">
                {track.track_number}
              </span>

              {/* Track label */}
              <span className="flex-1 text-[12px] text-[color:var(--aw-text-2)]">
                Track {track.track_number}
              </span>

              {/* Status indicator */}
              <span
                className="flex items-center gap-[6px] px-[10px] py-[3px] rounded-[9999px] text-[10px] font-medium"
                style={{
                  background: status.bg,
                  color: status.color,
                }}
              >
                {status.animate && (
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{
                      background: status.color,
                      animation: "progress-glow 1.5s ease infinite",
                    }}
                  />
                )}
                {track.status === "COMPLETED" && "✓ "}
                {(track.status === "FAILED" || track.status === "ERROR") && "✗ "}
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-[11px] text-[color:var(--aw-text-3)] text-center max-w-[280px]">
        Each track takes 1–3 minutes. The page will update automatically.
      </p>
    </div>
  );
}
