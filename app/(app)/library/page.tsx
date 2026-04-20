"use client";

import { useState } from "react";
import { LibraryHeader } from "@/components/library/library-header";
import { LibraryTable } from "@/components/library/library-table";
import { useLibrary } from "@/lib/api/library";
import type { TrackItem } from "@/lib/api/library";
import { Skeleton } from "@/components/ui/skeleton";

type LibTab = "Generations" | "Saved" | "History";
type LibFilter = "All" | "Song" | "Music" | "Sound FX";

const TYPE_LABEL: Record<string, LibFilter> = {
  vocal: "Song",
  music: "Music",
  sfx: "Sound FX",
};

export default function LibraryPage() {
  const [tab, setTab] = useState<LibTab>("Generations");
  const [filter, setFilter] = useState<LibFilter>("All");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLibrary();

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
      {isLoading ? (
        <div className="flex flex-col gap-[2px] px-5 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[54px] rounded-[8px]" />
          ))}
        </div>
      ) : (
        <LibraryTable items={filtered} />
      )}
    </div>
  );
}
