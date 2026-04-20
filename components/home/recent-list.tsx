"use client";

import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";

const RECENT_ITEMS = [
  { title: "Epic Battle Theme", type: "Music", time: "2 min ago", color: "#e8a055" },
  { title: "Summer Vibes", type: "Song", time: "14 min ago", color: "#60c090" },
  { title: "Late Night Study", type: "Music", time: "1 hr ago", color: "#6090e0" },
  { title: "Rain Forest Ambience", type: "Sound FX", time: "2 hr ago", color: "#60c090" },
  { title: "Neon City Nights", type: "Music", time: "Apr 17", color: "#a070e0" },
];

export function RecentList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-[14px]">
        <div className="text-[14px] font-semibold text-[color:var(--aw-text)]">Latest from the library</div>
        <Link href="/library" className="text-[11px] text-[color:var(--aw-accent)] bg-transparent border-none cursor-pointer">
          View all →
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        {RECENT_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-[10px] px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors duration-150"
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{
                background: `${item.color}20`,
                border: `1px solid ${item.color}30`,
              }}
            >
              <Icon d={icons.note[0]} size={13} color={item.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[color:var(--aw-text)] whitespace-nowrap overflow-hidden text-ellipsis">
                {item.title}
              </div>
              <div className="text-[10px] text-[color:var(--aw-text-3)] mt-[1px]">{item.type}</div>
            </div>
            <span className="text-[10px] text-[color:var(--aw-text-3)] flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
