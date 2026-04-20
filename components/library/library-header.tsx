"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";

type LibTab = "Generations" | "Saved" | "History";
type LibFilter = "All" | "Song" | "Music" | "Sound FX";

interface LibraryHeaderProps {
  tab: LibTab;
  onTabChange: (t: LibTab) => void;
  filter: LibFilter;
  onFilterChange: (f: LibFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export function LibraryHeader({ tab, onTabChange, filter, onFilterChange, search, onSearchChange }: LibraryHeaderProps) {
  return (
    <div className="px-6 pt-[14px] border-b border-[color:var(--aw-border)] flex-shrink-0">
      <div className="flex items-center gap-[10px] mb-3">
        <h1
          className="flex-1 font-light text-[28px] tracking-[-0.3px] text-[color:var(--aw-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Library
        </h1>
        {/* Search */}
        <div className="flex items-center gap-2 bg-[color:var(--aw-card)] rounded-[var(--radius-pill)] px-[14px] py-[6px] border border-[color:var(--aw-border)] w-[200px]">
          <Icon d={icons.search[0]} size={13} color="var(--aw-text-3)" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="bg-transparent border-none outline-none text-[color:var(--aw-text)] text-[12px] w-full placeholder:text-[color:var(--aw-text-3)]"
          />
        </div>
        <button className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-[var(--radius-pill)] text-[12px] font-medium bg-[rgba(255,255,255,0.05)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] cursor-pointer">
          <Icon d={icons.filter} size={12} /> Filter
        </button>
        <button className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-[var(--radius-pill)] text-[12px] font-medium bg-[rgba(255,255,255,0.05)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] cursor-pointer">
          <Icon d={icons.sort} size={12} /> Sort
        </button>
      </div>

      {/* Tabs + type filter */}
      <div className="flex items-end gap-0">
        {(["Generations", "Saved", "History"] as LibTab[]).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className="px-4 py-2 text-[13px] font-medium bg-transparent border-none cursor-pointer transition-all duration-150"
            style={{
              color: tab === t ? "var(--aw-text)" : "var(--aw-text-3)",
              borderBottom: tab === t ? "1.5px solid var(--aw-accent)" : "1.5px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex gap-[5px] items-center pb-2">
          {(["All", "Song", "Music", "Sound FX"] as LibFilter[]).map((f) => (
            <Pill key={f} active={filter === f} onClick={() => onFilterChange(f)}>
              {f}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
