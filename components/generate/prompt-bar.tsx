"use client";

import { useRef } from "react";
import { Icon, icons } from "@/components/ui/icon";

type GenTab = "Song" | "Music" | "Sound FX";

interface PromptBarProps {
  tab: GenTab;
  prompt: string;
  onPromptChange: (v: string) => void;
  generating: boolean;
  onGenerate: () => void;
}

const PLACEHOLDERS: Record<GenTab, string> = {
  Song: "Describe your song — mood, theme, vocal style…",
  Music: "Describe the music — genre, instruments, emotion, tempo…",
  "Sound FX": "Describe the sound effect — nature, environment, action…",
};

export function PromptBar({
  tab,
  prompt,
  onPromptChange,
  generating,
  onGenerate,
}: PromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className="rounded-[16px] p-[14px_18px] border border-[color:var(--aw-border)]"
      style={{ background: "var(--aw-card)", boxShadow: "var(--shadow-card)" }}
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onGenerate();
        }}
        placeholder={PLACEHOLDERS[tab]}
        rows={2}
        className="w-full bg-transparent border-none outline-none resize-none text-[color:var(--aw-text)] text-[14px] leading-[1.6] tracking-[0.01em] mb-[10px] placeholder:text-[color:var(--aw-text-3)]"
      />
      <div className="flex items-center gap-2">
        {/* Finetune (Song only) */}
        {tab === "Song" && (
          <button className="flex items-center gap-[5px] px-3 py-[5px] rounded-[20px] text-[12px] bg-[rgba(255,255,255,0.04)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)]">
            <Icon d={icons.mic} size={12} /> No Finetune
          </button>
        )}

        {/* Generate button */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[color:var(--aw-text-3)]">⌘↵</span>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-[6px] px-5 py-2 rounded-[var(--radius-pill)] text-[13px] font-semibold border-none cursor-pointer transition-all duration-200"
            style={{
              background: generating ? "rgba(232,160,85,0.2)" : "var(--aw-accent)",
              color: generating ? "var(--aw-accent)" : "#000",
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? (
              <>
                <div
                  className="w-3 h-3 rounded-full border-2 border-current border-t-transparent"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                Generating
              </>
            ) : (
              <>
                <Icon d={icons.sparkle[0]} size={13} fill="currentColor" stroke="none" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
