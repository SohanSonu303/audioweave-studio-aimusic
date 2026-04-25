"use client";

import type { CandidateWindow } from "@/lib/api/auto-edit";
import { Scissors } from "lucide-react";
import { formatTimeWithDecimal } from "@/lib/utils";

interface CandidateCardProps {
  candidate: CandidateWindow;
  isSelected: boolean;
  onUseThis?: () => void;
  disabled?: boolean;
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-aw-text-3">{label}</span>
        <span className="text-[10px] text-aw-text-2 tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-0.5 rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full bg-aw-accent"
          style={{ width: `${value * 100}%`, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

export function CandidateCard({ candidate, isSelected, onUseThis, disabled }: CandidateCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-aw-green bg-[rgba(96,192,144,0.05)] shadow-[0_0_16px_rgba(96,192,144,0.08)]"
          : "border-aw-border bg-[rgba(255,255,255,0.02)] hover:border-aw-border-md hover:bg-[rgba(255,255,255,0.03)]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-aw-text">#{candidate.index}</span>
          {candidate.needs_loop && (
            <span className="text-[9px] font-medium text-aw-accent bg-aw-accent-dim border border-aw-warm-border px-1.5 py-0.5 rounded-full">
              Loop
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-aw-text-2 tabular-nums">
          {formatTimeWithDecimal(candidate.start)} → {formatTimeWithDecimal(candidate.end)}
        </div>
      </div>

      {/* Segment labels */}
      {candidate.segment_labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.segment_labels.map((lbl, idx) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-aw-text-3 capitalize"
            >
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Score bars */}
      <div className="flex flex-col gap-1.5">
        <ScoreBar value={candidate.duration_score} label="Duration" />
        <ScoreBar value={candidate.energy_score} label="Energy" />
        <ScoreBar value={candidate.structural_score} label="Structure" />
        <ScoreBar value={candidate.spectral_quality_score} label="Quality" />
      </div>

      {/* Footer: total score + action */}
      <div className="flex items-center justify-between pt-1 border-t border-aw-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-aw-text-3">Score</span>
          <span
            className={`text-sm font-semibold tabular-nums ${isSelected ? "text-aw-green" : "text-aw-text"}`}
          >
            {Math.round(candidate.total_score * 100)}%
          </span>
        </div>

        {isSelected ? (
          <span className="text-[10px] font-medium text-aw-green px-2 py-0.5 rounded-full bg-[rgba(96,192,144,0.1)] border border-[rgba(96,192,144,0.2)]">
            Selected
          </span>
        ) : onUseThis ? (
          <button
            onClick={onUseThis}
            disabled={disabled}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-aw-text-2 hover:text-aw-text transition-all disabled:opacity-40"
          >
            <Scissors size={9} />
            Use this
          </button>
        ) : null}
      </div>
    </div>
  );
}
