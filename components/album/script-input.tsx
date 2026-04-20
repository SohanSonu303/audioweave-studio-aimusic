"use client";

import { Icon, icons } from "@/components/ui/icon";

interface ScriptInputProps {
  script: string;
  onChange: (v: string) => void;
  analyzing: boolean;
  progress: number;
  onAnalyze: () => void;
}

export function ScriptInput({ script, onChange, analyzing, progress, onAnalyze }: ScriptInputProps) {
  return (
    <div className="w-[380px] border-r border-[color:var(--aw-border)] flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-[14px] border-b border-[color:var(--aw-border)] flex-shrink-0">
        <h1
          className="font-light text-[28px] tracking-[-0.3px] mb-1 text-[color:var(--aw-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Album Composer
        </h1>
        <p className="text-[12px] text-[color:var(--aw-text-2)] leading-[1.5]">
          Paste a script or story. AI maps the emotional arc and suggests music for each scene.
        </p>
      </div>
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <textarea
          value={script}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-[12px] p-4 text-[color:var(--aw-text)] text-[12px] leading-[1.7] resize-none outline-none tracking-[0.01em] border border-[color:var(--aw-border)]"
          style={{ background: "var(--aw-card)", fontFamily: "var(--font-mono)" }}
        />
        <button
          onClick={onAnalyze}
          disabled={analyzing || !script.trim()}
          className="mt-3 py-[11px] rounded-[var(--radius-pill)] text-[13px] font-semibold flex items-center justify-center gap-2 border-none transition-all duration-200"
          style={{
            background: analyzing ? "rgba(232,160,85,0.15)" : "var(--aw-accent)",
            color: analyzing ? "var(--aw-accent)" : "#000",
            cursor: analyzing || !script.trim() ? "not-allowed" : "pointer",
          }}
        >
          {analyzing ? (
            <>
              <div
                className="w-[14px] h-[14px] rounded-full border-2 border-current border-t-transparent"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Analysing script… {progress}%
            </>
          ) : (
            <>
              <Icon d={icons.sparkle[0]} size={14} fill="currentColor" stroke="none" />
              Analyse Script
            </>
          )}
        </button>
      </div>
    </div>
  );
}
