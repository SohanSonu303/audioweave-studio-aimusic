"use client";

import { LibraryRow } from "./library-row";
import type { TrackItem } from "@/lib/api/library";

const COLUMNS = ["", "Title", "Tags", "", "Duration", "BPM", ""];

interface LibraryTableProps {
  items: TrackItem[];
}

export function LibraryTable({ items }: LibraryTableProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Column headers */}
      <div
        className="grid gap-0 px-5 py-2 border-b border-[color:var(--aw-border)] items-center"
        style={{ gridTemplateColumns: "32px 1fr 1fr 180px 60px 80px 80px" }}
      >
        {COLUMNS.map((h, i) => (
          <div
            key={i}
            className="text-[10px] font-medium text-[color:var(--aw-text-3)] tracking-[0.06em] uppercase"
            style={{ textAlign: i >= 4 ? "center" : "left" }}
          >
            {h}
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-[13px] text-[color:var(--aw-text-3)]">
          No tracks yet
        </div>
      ) : (
        items.map((item, i) => (
          <LibraryRow key={item.id} item={item} index={i} />
        ))
      )}
    </div>
  );
}
