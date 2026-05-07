"use client";

import { Segmented } from "@/components/ui/segmented";

type GenTab = "Song" | "Music" | "Sound FX";

interface GenerateHeaderProps {
  tab: GenTab;
  onTabChange: (t: GenTab) => void;
}

export function GenerateHeader({ tab, onTabChange }: GenerateHeaderProps) {
  return (
    <div className="flex items-center justify-end px-6 py-3 border-b border-[color:var(--aw-border)] gap-4 flex-shrink-0">
      <Segmented options={["Song", "Music", "Sound FX"]} value={tab} onChange={onTabChange} />
    </div>
  );
}
