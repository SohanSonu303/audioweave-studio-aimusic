"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Waveform } from "@/components/audio/waveform";
import type { SceneSuggestion } from "./scene-timeline";

interface SceneCardProps {
  scene: SceneSuggestion;
  index: number;
  selected: boolean;
  generating: boolean;
  generated: boolean;
  onSelect: () => void;
  onGenerate: () => void;
}

// index is required by the parent but not used in render
export function SceneCard({ scene, selected, generating, generated, onSelect, onGenerate }: SceneCardProps) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border cursor-pointer transition-all duration-200 overflow-hidden"
      style={{
        background: selected ? "var(--aw-card-hi)" : "var(--aw-card)",
        borderColor: "var(--aw-border)",
        borderLeft: `3px solid ${scene.color}`,
        boxShadow: "var(--shadow-card)",
      }}
      onClick={onSelect}
    >
      <div className="p-[14px_16px]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[13px] font-semibold text-[color:var(--aw-text)] mb-[2px]">{scene.section}</div>
            <div className="flex gap-[6px] flex-wrap">
              <span
                className="text-[10px] px-2 py-[2px] rounded-[var(--radius-pill)] border"
                style={{ background: `${scene.color}22`, color: scene.color, borderColor: `${scene.color}44` }}
              >
                {scene.genre}
              </span>
              <span className="text-[10px] px-2 py-[2px] rounded-[var(--radius-pill)] bg-[rgba(255,255,255,0.05)] text-[color:var(--aw-text-3)] border border-[color:var(--aw-border)]">
                {scene.bpm}
              </span>
              <span className="text-[10px] px-2 py-[2px] rounded-[var(--radius-pill)] bg-[rgba(255,255,255,0.05)] text-[color:var(--aw-text-3)] border border-[color:var(--aw-border)]">
                {scene.mood}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            className="flex items-center gap-[5px] px-[14px] py-[6px] rounded-[var(--radius-pill)] text-[11px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap border"
            style={{
              background: generated ? `${scene.color}22` : "rgba(255,255,255,0.07)",
              color: generated ? scene.color : "var(--aw-text-2)",
              borderColor: generated ? `${scene.color}44` : "var(--aw-border)",
            }}
          >
            {generating ? (
              <>
                <div
                  className="w-[10px] h-[10px] rounded-full border-[1.5px] border-current border-t-transparent"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                Generating
              </>
            ) : generated ? (
              "✓ Generated"
            ) : (
              <>
                <Icon d={icons.sparkle[0]} size={11} fill="currentColor" stroke="none" />
                Generate
              </>
            )}
          </button>
        </div>
        <p className="text-[12px] text-[color:var(--aw-text-2)] leading-[1.55]">{scene.suggestion}</p>
        {generated && (
          <div
            className="mt-3 h-9 rounded-[8px] border border-[color:var(--aw-border)] p-[6px_10px]"
            style={{ background: "var(--aw-card-hi)" }}
          >
            <Waveform bars={50} color={scene.color} />
          </div>
        )}
      </div>
    </div>
  );
}
