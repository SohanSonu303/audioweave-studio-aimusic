"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Analysing Script",
  "Planning Tracks",
  "Generating Prompts",
  "Writing Lyrics",
] as const;

const STAGE_CYCLE_MS = 8_000;

export function PlanningView() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, STAGE_CYCLE_MS);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-[color:var(--aw-border)]"
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--aw-accent)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div
          className="absolute inset-[6px] rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--aw-purple)",
            animation: "spin 1.2s linear infinite reverse",
          }}
        />
      </div>

      {/* Stage list */}
      <div className="flex flex-col gap-3 w-full max-w-[320px]">
        {STAGES.map((label, i) => {
          const isActive = i === activeStage;
          const isCompleted = i < activeStage;

          return (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-[10px] rounded-[10px] transition-all duration-300"
              style={{
                background: isActive
                  ? "rgba(232,160,85,0.08)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(232,160,85,0.15)"
                  : "1px solid transparent",
              }}
            >
              {/* Step indicator */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold transition-all duration-300"
                style={{
                  background: isActive
                    ? "var(--aw-accent)"
                    : isCompleted
                      ? "rgba(96,192,144,0.2)"
                      : "rgba(255,255,255,0.06)",
                  color: isActive
                    ? "#000"
                    : isCompleted
                      ? "var(--aw-green)"
                      : "var(--aw-text-3)",
                }}
              >
                {isCompleted ? "✓" : i + 1}
              </div>

              {/* Label */}
              <span
                className="text-[13px] transition-colors duration-300"
                style={{
                  color: isActive
                    ? "var(--aw-accent)"
                    : isCompleted
                      ? "var(--aw-text-2)"
                      : "var(--aw-text-3)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {label}
              </span>

              {/* Active spinner dot */}
              {isActive && (
                <div
                  className="ml-auto w-[6px] h-[6px] rounded-full"
                  style={{
                    background: "var(--aw-accent)",
                    animation: "progress-glow 1.5s ease infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-[11px] text-[color:var(--aw-text-3)] text-center max-w-[260px]">
        AI is analysing your script and composing track plans. This usually takes 30–90 seconds.
      </p>
    </div>
  );
}
