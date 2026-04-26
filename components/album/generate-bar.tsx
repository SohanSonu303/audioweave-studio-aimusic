"use client";

import { useAlbumStore } from "@/stores/album-store";
import { TOKENS_PER_ALBUM_TRACK } from "@/lib/constants";

interface GenerateBarProps {
  trackCount: number;
}

export function GenerateBar({ trackCount }: GenerateBarProps) {
  const setApproveDialogOpen = useAlbumStore((s) => s.setApproveDialogOpen);
  const totalTokens = trackCount * TOKENS_PER_ALBUM_TRACK;

  return (
    <div
      className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-3 border-t border-[color:var(--aw-border)]"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.98) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="text-[12px] text-[color:var(--aw-text-2)]">
        {trackCount} track{trackCount !== 1 ? "s" : ""} ready · ~{totalTokens.toLocaleString()} tokens
      </span>

      <button
        type="button"
        onClick={() => setApproveDialogOpen(true)}
        className="flex items-center gap-2 px-5 py-[9px] rounded-[9999px] text-[12px] font-semibold text-black tracking-[0.01em] transition-opacity duration-150 hover:opacity-85"
        style={{
          background: "var(--aw-accent)",
          boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
        }}
      >
        ✦ Generate Album
      </button>
    </div>
  );
}
