"use client";

import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";
import type { AlbumResponse } from "@/lib/api/album";
import { parseJsonSafe } from "@/lib/utils";

interface StylePalette {
  primary_genre?: string;
  bpm_range?: string;
  key_signature?: string;
  mood_arc?: string;
  secondary_genres?: string[];
}

interface AlbumHeaderProps {
  album: AlbumResponse;
}

export function AlbumHeader({ album }: AlbumHeaderProps) {
  const palette = parseJsonSafe<StylePalette>(album.style_palette, {});

  const badges: { label: string; value: string }[] = [];
  if (palette.primary_genre) badges.push({ label: "Genre", value: palette.primary_genre });
  if (palette.bpm_range) badges.push({ label: "BPM", value: palette.bpm_range });
  if (palette.key_signature) badges.push({ label: "Key", value: palette.key_signature });
  if (palette.mood_arc) badges.push({ label: "Mood", value: palette.mood_arc });

  return (
    <div className="mb-6">
      {/* Back link */}
      <Link
        href="/album"
        className="inline-flex items-center gap-1 text-[12px] text-[color:var(--aw-text-3)] mb-4 transition-colors duration-150 hover:text-[color:var(--aw-text-2)]"
      >
        <Icon d={icons.chevronR} size={12} className="rotate-180" />
        Albums
      </Link>

      {/* Title */}
      <h1
        className="font-light text-[28px] tracking-[-0.3px] text-[color:var(--aw-text)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {album.title || "Untitled Album"}
      </h1>

      {/* Style badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {badges.map(({ label, value }) => (
            <span
              key={label}
              className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[9999px] text-[11px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.04)]"
            >
              <span className="text-[color:var(--aw-text-3)] font-medium">{label}</span>
              <span className="text-[color:var(--aw-text-2)]">{value}</span>
            </span>
          ))}

          {/* Status pill */}
          <StatusPill status={album.status} />
        </div>
      )}

      {/* Fallback: if no badges, just show status */}
      {badges.length === 0 && (
        <div className="flex items-center gap-2">
          <StatusPill status={album.status} />
          <span className="text-[12px] text-[color:var(--aw-text-3)]">
            {album.num_songs} track{album.num_songs !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Inline status pill ── */
const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  PLANNING:   { bg: "rgba(96,144,224,0.15)",  color: "var(--aw-blue)",   label: "Planning" },
  PLANNED:    { bg: "rgba(96,192,144,0.15)",   color: "var(--aw-green)",  label: "Ready to Generate" },
  GENERATING: { bg: "rgba(232,160,85,0.15)",   color: "var(--aw-accent)", label: "Generating" },
  COMPLETED:  { bg: "rgba(96,192,144,0.15)",   color: "var(--aw-green)",  label: "Completed" },
  FAILED:     { bg: "rgba(224,96,96,0.15)",    color: "var(--aw-red)",    label: "Failed" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.PLANNING;
  return (
    <span
      className="inline-flex items-center px-[10px] py-[3px] rounded-[9999px] text-[10px] font-medium tracking-[0.04em] uppercase"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}22`,
      }}
    >
      {s.label}
    </span>
  );
}
