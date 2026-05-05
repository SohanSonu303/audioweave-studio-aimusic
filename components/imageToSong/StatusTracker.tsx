"use client";

import { Icon } from "@/components/ui/icon";

type Status = "idle" | "submitting" | "queued" | "processing" | "completed" | "failed";

interface StatusTrackerProps {
  status: Status;
  error?: string | null;
  progress?: number;
  onRetry: () => void;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon?: string }> = {
  idle: { label: "", color: "" },
  submitting: { label: "Sending to server…", color: "var(--aw-accent)" },
  queued: { label: "In queue — waiting for worker…", color: "rgba(120,180,255,0.9)" },
  processing: { label: "Generating your song from the image…", color: "rgba(150,220,130,0.9)" },
  completed: { label: "Song ready!", color: "rgba(150,220,130,0.9)" },
  failed: { label: "Generation failed", color: "rgba(255,100,100,0.9)" },
};

export function StatusTracker({ status, error, progress = 0, onRetry }: StatusTrackerProps) {
  if (status === "idle") return null;

  const cfg = STATUS_CONFIG[status];
  const isWorking = status === "submitting" || status === "queued" || status === "processing";

  return (
    <div
      className="rounded-[14px] px-5 py-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-3">
        {isWorking && (
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
            style={{ borderColor: `${cfg.color} transparent transparent transparent` }}
          />
        )}
        {status === "completed" && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(150,220,130,0.15)" }}
          >
            <Icon d="M20 6L9 17l-5-5" size={11} color="rgba(150,220,130,0.9)" />
          </div>
        )}
        {status === "failed" && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,100,100,0.15)" }}
          >
            <Icon d="M18 6L6 18M6 6l12 12" size={11} color="rgba(255,100,100,0.9)" />
          </div>
        )}
        <span className="text-[13px] font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {/* Progress bar for processing */}
      {status === "processing" && (
        <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.07)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[2s]"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgba(150,220,130,0.8), rgba(100,180,255,0.8))",
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-[12px]" style={{ color: "rgba(255,130,130,0.9)" }}>
          {error}
        </p>
      )}

      {status === "failed" && (
        <button
          onClick={onRetry}
          className="self-start px-4 py-2 rounded-[8px] text-[12px] font-medium transition-all duration-150 cursor-pointer"
          style={{
            background: "rgba(255,100,100,0.1)",
            border: "1px solid rgba(255,100,100,0.25)",
            color: "rgba(255,130,130,0.9)",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
