"use client";

import Link from "next/link";
import { useLibrary } from "@/lib/api/library";
import { formatTime } from "@/lib/utils";

export function RecentList() {
  const { data } = useLibrary();

  const recent = (data?.tracks ?? [])
    .filter((t) => t.status === "COMPLETED")
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-[14px]">
        <div className="text-[14px] font-semibold text-[color:var(--aw-text)]">Latest from the library</div>
        <Link href="/library" className="text-[11px] text-[color:var(--aw-accent)] bg-transparent border-none cursor-pointer">
          View all →
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        {recent.length === 0 ? (
          <div className="text-[11px] text-[color:var(--aw-text-3)] text-center pt-8">
            No tracks yet
          </div>
        ) : (
          recent.map((track, i) => (
            <div
              key={track.id}
              className="flex items-center justify-between px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors duration-150"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span className="text-[12px] font-medium text-[color:var(--aw-text)] truncate min-w-0 mr-3">
                {track.title ?? track.prompt ?? "Generated track"}
              </span>
              <span className="text-[11px] text-[color:var(--aw-text-3)] flex-shrink-0">
                {track.duration ? formatTime(Math.round(track.duration)) : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
