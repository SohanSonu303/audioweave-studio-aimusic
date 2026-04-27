"use client";

import Link from "next/link";
import type { AlbumResponse } from "@/lib/api/album";
import { THUMB_GRADIENTS } from "@/lib/constants";
import { parseJsonSafe } from "@/lib/utils";

/** Semantic colors for the status pill */
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PLANNING:   { bg: "rgba(96, 144, 224, 0.15)",  color: "var(--aw-blue)",   label: "Planning" },
  PLANNED:    { bg: "rgba(96, 192, 144, 0.15)",   color: "var(--aw-green)",  label: "Ready" },
  GENERATING: { bg: "rgba(232, 160, 85, 0.15)",   color: "var(--aw-accent)", label: "Generating" },
  COMPLETED:  { bg: "rgba(96, 192, 144, 0.15)",   color: "var(--aw-green)",  label: "Completed" },
  FAILED:     { bg: "rgba(224, 96, 96, 0.15)",    color: "var(--aw-red)",    label: "Failed" },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

interface AlbumCardProps {
  album: AlbumResponse;
  index: number;
}

export function AlbumCard({ album, index }: AlbumCardProps) {
  const status = STATUS_STYLES[album.status] ?? STATUS_STYLES.PLANNING;

  const stylePalette = parseJsonSafe<{ primary_genre?: string; mood_arc?: string }>(
    album.style_palette,
    {},
  );
  const trackComp = parseJsonSafe<{ songs?: number; background_scores?: number; instrumentals?: number }>(
    album.track_composition,
    {},
  );

  const genre = stylePalette.primary_genre ?? "—";
  const trackCount = album.num_songs || (
    (trackComp.songs ?? 0) + (trackComp.background_scores ?? 0) + (trackComp.instrumentals ?? 0)
  );

  // Album cover art is not on AlbumTrackResponse — resolved via download polling in results view.
  // For the library grid, use a gradient fallback.
  const fallbackGradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];

  return (
    <Link
      href={`/album/${album.id}`}
      className="group block rounded-[16px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)] transition-all duration-200 hover:bg-[color:var(--aw-card-hi)] hover:border-[color:var(--aw-border-md)]"
      style={{
        boxShadow: "var(--shadow-card)",
        animation: `fadeIn 0.35s ease both`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Cover art / gradient thumbnail */}
      <div
        className="relative w-full aspect-[16/9] rounded-t-[16px] overflow-hidden"
        style={{
          background: fallbackGradient,
        }}
      >
        {/* Overlay gradient for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Status pill */}
        <div
          className="absolute top-3 right-3 px-[10px] py-[3px] rounded-[9999px] text-[10px] font-medium tracking-[0.04em] uppercase"
          style={{
            background: status.bg,
            color: status.color,
            border: `1px solid ${status.color}22`,
          }}
        >
          {status.label}
        </div>

        {/* Track count badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <span
            className="text-[11px] font-medium text-white/80"
          >
            {trackCount} {trackCount === 1 ? "track" : "tracks"}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        <h3
          className="text-[14px] font-medium text-[color:var(--aw-text)] truncate mb-1 tracking-[-0.01em]"
        >
          {album.title || "Untitled Album"}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-[color:var(--aw-text-3)]">
          <span className="truncate">{genre}</span>
          <span className="opacity-40">·</span>
          <span className="flex-shrink-0">{formatDate(album.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
