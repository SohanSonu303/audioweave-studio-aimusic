"use client";

import { useEditStore } from "@/stores/edit-store";
import { formatTimeWithDecimal } from "@/lib/utils";

export function TrackHeader() {
  const { primarySource, sourceDurationSec, result, abMode } = useEditStore();
  if (!primarySource) return null;

  const showingProcessed = !!result && abMode === "processed";

  const label = showingProcessed
    ? `${result.op.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Result`
    : "Source Audio";

  const accent = showingProcessed ? "var(--aw-green)" : "var(--aw-accent)";
  const borderColor = showingProcessed ? "rgba(96,192,144,0.3)" : "rgba(232,160,85,0.3)";

  const title =
    primarySource.kind === "file"
      ? primarySource.file.name
      : primarySource.url.split("/").pop()?.split("?")[0] || "audio.mp3";

  const duration = showingProcessed && result?.actualDuration ? result.actualDuration : sourceDurationSec;

  return (
    <div className="flex flex-col items-center text-center gap-4 w-full">
      <h2
        className="font-display text-[30px] font-medium leading-none truncate max-w-[640px]"
        style={{ color: "var(--aw-text)" }}
        title={title}
      >
        {title}
      </h2>
      <div className="flex items-center gap-6">
        <span
          className="px-3 py-1 rounded-full uppercase tracking-[0.2em] text-[9px] font-light border"
          style={{ color: accent, borderColor }}
        >
          {label}
        </span>
        {duration != null && (
          <span className="font-mono text-[12px] text-aw-text-2 opacity-80 tabular-nums">
            Duration: {formatTimeWithDecimal(duration)}
          </span>
        )}
      </div>
    </div>
  );
}
