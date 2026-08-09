"use client";

import Link from "next/link";
import { Loader2, Check, AlertCircle } from "lucide-react";
import type { CoverErrorCopy } from "@/lib/api/cover";

export type CoverUIStatus =
  | "idle"
  | "submitting"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

interface CoverStatusTrackerProps {
  status: CoverUIStatus;
  error?: CoverErrorCopy | null;
  progress?: number;
  onRetry: () => void;
}

const STATUS_CONFIG: Record<CoverUIStatus, { label: string; color: string }> = {
  idle: { label: "", color: "" },
  submitting: { label: "Uploading track...", color: "var(--aw-accent)" },
  queued: { label: "In Queue", color: "rgba(120,180,255,0.9)" },
  processing: { label: "Recording Cover...", color: "rgba(150,220,130,0.9)" },
  completed: { label: "Cover Ready", color: "rgba(150,220,130,0.9)" },
  failed: { label: "Cover Failed", color: "rgba(255,100,100,0.9)" },
};

export function CoverStatusTracker({ status, error, progress = 0, onRetry }: CoverStatusTrackerProps) {
  if (status === "idle") return null;

  const cfg = STATUS_CONFIG[status];
  const isWorking = status === "submitting" || status === "queued" || status === "processing";

  return (
    <div
      className="rounded-full px-5 py-3 flex items-center gap-4 border shadow-2xl backdrop-blur-md"
      style={{
        background: "rgba(10,10,10,0.85)",
        borderColor: isWorking
          ? "rgba(232,160,85,0.3)"
          : error
          ? "rgba(255,100,100,0.3)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        {isWorking ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: cfg.color }} />
        ) : status === "completed" ? (
          <Check className="w-4 h-4" style={{ color: cfg.color }} />
        ) : (
          <AlertCircle className="w-4 h-4" style={{ color: cfg.color }} />
        )}
        <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: cfg.color }}>
          {error?.title ?? cfg.label}
        </span>
      </div>

      {status === "processing" && (
        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[2s]"
            style={{ width: `${progress}%`, background: "var(--aw-accent)" }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          {error.detail && (
            <span className="text-[11px] text-aw-text-2 max-w-[280px] truncate" title={error.detail}>
              {error.detail}
            </span>
          )}
          {error.upsell ? (
            <Link
              href="/subscription"
              className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-black whitespace-nowrap"
              style={{ background: "var(--aw-accent)" }}
            >
              Get credits
            </Link>
          ) : (
            <button
              onClick={onRetry}
              className="px-3 py-1 rounded-md bg-aw-red/10 border border-aw-red/20 text-aw-red text-[10px] font-bold uppercase tracking-wider hover:bg-aw-red/20 whitespace-nowrap"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
