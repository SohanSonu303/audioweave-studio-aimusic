"use client";

import { useState } from "react";
import { LibraryHeader } from "@/components/library/library-header";
import { LibraryTable } from "@/components/library/library-table";
import { PlayerBar } from "@/components/audio/player-bar";
import { useLibrary } from "@/lib/api/library";
import type { TrackItem } from "@/lib/api/library";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/stores/player-store";
import { Icon, icons } from "@/components/ui/icon";

type LibTab = "Generations" | "Saved" | "History";
type LibFilter = "All" | "Song" | "Music" | "Sound FX";

const TYPE_LABEL: Record<string, LibFilter> = {
  vocal: "Song",
  music: "Music",
  sfx: "Sound FX",
};

const PAGE_SIZE = 10;

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function LibraryPage() {
  const [tab, setTab] = useState<LibTab>("Generations");
  const [filter, setFilter] = useState<LibFilter>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLibrary();
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const allTracks: TrackItem[] = (data?.tracks ?? []).filter(
    (t) => t.status === "COMPLETED",
  );

  const filtered = allTracks.filter((t) => {
    const typeLabel = TYPE_LABEL[t.type] ?? t.type;
    const matchFilter = filter === "All" || typeLabel === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (t.title ?? "").toLowerCase().includes(q) ||
      (t.prompt ?? "").toLowerCase().includes(q) ||
      (t.music_style ?? "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // safePage below clamps to available pages when filter/search/tab changes

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <LibraryHeader
        tab={tab}
        onTabChange={setTab}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col gap-[2px] px-5 py-2">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-[54px] rounded-[8px]" />
            ))}
          </div>
        ) : (
          <LibraryTable items={paginated} />
        )}

        {/* Pagination bar */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-[10px] border-t border-[color:var(--aw-border)]">
            {/* Count label */}
            <span className="text-[11px] text-[color:var(--aw-text-3)]">
              {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>

            {/* Page buttons */}
            <div className="flex items-center gap-[3px]">
              {/* Prev */}
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] disabled:opacity-25 opacity-60 hover:opacity-100 hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <Icon d={icons.chevronR} size={13} color="var(--aw-text-2)" className="rotate-180" />
              </button>

              {pageRange(safePage, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-[color:var(--aw-text-3)]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[11px] font-medium transition-all"
                    style={
                      p === safePage
                        ? { background: "var(--aw-accent)", color: "#000" }
                        : { color: "var(--aw-text-2)", background: "transparent" }
                    }
                    onMouseEnter={(e) => {
                      if (p !== safePage) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (p !== safePage) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] disabled:opacity-25 opacity-60 hover:opacity-100 hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <Icon d={icons.chevronR} size={13} color="var(--aw-text-2)" />
              </button>
            </div>
          </div>
        )}
      </div>

      {currentTrack && <PlayerBar />}
    </div>
  );
}
