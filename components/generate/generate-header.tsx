"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";

type GenTab = "Song" | "Music" | "Sound FX";

interface GenerateHeaderProps {
  tab: GenTab;
  onTabChange: (t: GenTab) => void;
}

export function GenerateHeader({ tab, onTabChange }: GenerateHeaderProps) {
  return (
    <div className="flex items-center px-6 py-3 border-b border-[color:var(--aw-border)] gap-4 flex-shrink-0">
      <span className="flex-1 text-[13px] text-[color:var(--aw-text-2)]">Untitled</span>
      <Segmented options={["Song", "Music", "Sound FX"]} value={tab} onChange={onTabChange} />
      <button className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-[var(--radius-pill)] text-[12px] font-medium bg-[rgba(255,255,255,0.06)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)]">
        <Icon d={icons.bolt} size={12} /> Enhance
      </button>
    </div>
  );
}
