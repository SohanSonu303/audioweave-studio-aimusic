"use client";

import { memo, useMemo } from "react";
import { Icon, icons } from "@/components/ui/icon";
import { Waveform } from "@/components/audio/waveform";
import { TrackThumbnail } from "@/components/audio/track-thumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/stores/player-store";
import type { TrackItem } from "@/lib/api/library";
import { formatTime, downloadUrl } from "@/lib/utils";

const IN_PROGRESS_STATUSES = new Set(["QUEUED", "IN_QUEUE", "pending", "processing"]);

const GRID_STYLE = { gridTemplateColumns: "32px 1fr 1fr 180px 60px 80px 80px" } as const;

const TYPE_COLORS: Record<string, string> = {
  music: "#e8a055",
  vocal: "#60c090",
  sfx: "#a070e0",
  stem: "#6090e0",
};

const TYPE_LABEL: Record<string, string> = {
  music: "Music",
  vocal: "Song",
  sfx: "Sound FX",
  stem: "Stem",
};

interface LibraryRowProps {
  item: TrackItem;
  index: number;
}

function LibrarySkeletonRow() {
  return (
    <div
      className="grid items-center gap-0 px-5 py-[7px] border-b border-[rgba(255,255,255,0.04)]"
      style={GRID_STYLE}
    >
      <Skeleton className="w-[26px] h-[26px] rounded-full" />
      <div className="flex items-center gap-[10px] min-w-0">
        <Skeleton className="w-[38px] h-[38px] rounded-[6px] flex-shrink-0" />
        <div className="flex flex-col gap-[5px] min-w-0 flex-1">
          <Skeleton className="h-[13px] w-[140px] rounded-[4px]" />
          <Skeleton className="h-[11px] w-[80px] rounded-[4px]" />
        </div>
      </div>
      <Skeleton className="h-[11px] w-[100px] rounded-[4px]" />
      <Skeleton className="h-[26px] w-full rounded-[4px] mr-2" />
      <Skeleton className="h-[12px] w-[30px] rounded-[4px] mx-auto" />
      <Skeleton className="h-[12px] w-[24px] rounded-[4px] mx-auto" />
      <div className="flex items-center gap-[6px] justify-end">
        <Skeleton className="w-[14px] h-[14px] rounded-[3px]" />
        <Skeleton className="w-[14px] h-[14px] rounded-[3px]" />
      </div>
    </div>
  );
}

function LibraryTrackRow({ item, index }: LibraryRowProps) {
  const playing = usePlayerStore((s) => s.currentTrack?.id === item.id && s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const color = TYPE_COLORS[item.type] ?? "#e8a055";
  const playBtnStyle = useMemo(() => ({
    background: playing ? color : "rgba(255,255,255,0.07)",
    border: `1px solid ${playing ? color : "rgba(255,255,255,0.1)"}`,
  }), [playing, color]);

  const handlePlay = () => {
    if (!item.audio_url) return;
    toggle({
      id: item.id,
      title: item.title ?? item.prompt ?? "Untitled",
      audioUrl: item.audio_url,
      color,
      duration: item.duration ? formatTime(Math.round(item.duration)) : undefined,
    });
  };

  const handleDownload = () => {
    if (!item.audio_url) return;
    const fileName = `${(item.title || item.prompt || "track").slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.mp3`;
    downloadUrl(item.audio_url, fileName);
  };

  const musicStyle = item.music_style ?? "";
  const durationStr = item.duration ? formatTime(Math.round(item.duration)) : "—";

  return (
    <div
      className="grid items-center gap-0 px-5 py-[7px] border-b border-[rgba(255,255,255,0.04)] transition-colors duration-100 cursor-default"
      style={GRID_STYLE}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={!item.audio_url}
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 disabled:opacity-40"
        style={playBtnStyle}
      >
        <Icon
          d={playing ? icons.pause : icons.play}
          size={10}
          fill={playing ? "#000" : "rgba(255,255,255,0.7)"}
          color="none"
        />
      </button>

      {/* Title + thumbnail */}
      <div className="flex items-center gap-[10px] min-w-0">
        <TrackThumbnail index={index} size={38} />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[color:var(--aw-text)] whitespace-nowrap overflow-hidden text-ellipsis">
            {item.title ?? item.prompt ?? "Untitled"}
          </div>
          <div className="text-[11px] text-[color:var(--aw-text-3)] mt-[1px]">
            AudioWeave · {TYPE_LABEL[item.type] ?? item.type}
          </div>
        </div>
      </div>

      {/* Style */}
      <div className="text-[11px] text-[color:var(--aw-text-2)] truncate pr-2">
        {musicStyle || "—"}
      </div>

      {/* Waveform */}
      <div className="h-8 pr-2">
        <Waveform bars={45} playing={playing} color={color} />
      </div>

      {/* Duration */}
      <div className="text-[12px] text-[color:var(--aw-text-2)] text-center">{durationStr}</div>

      {/* BPM placeholder */}
      <div className="text-[12px] text-[color:var(--aw-text-3)] text-center">—</div>

      {/* Actions */}
      <div className="flex items-center gap-[6px] justify-end">
        <button className="opacity-35 cursor-pointer transition-opacity duration-150 hover:opacity-100">
          <Icon d={icons.heart} size={14} color="var(--aw-text)" />
        </button>
        <button
          onClick={handleDownload}
          disabled={!item.audio_url}
          className="opacity-35 cursor-pointer transition-opacity duration-150 hover:opacity-100 disabled:cursor-not-allowed"
        >
          <Icon d={icons.download} size={14} color="var(--aw-text)" />
        </button>
      </div>
    </div>
  );
}

function LibraryRowInner({ item, index }: LibraryRowProps) {
  if (IN_PROGRESS_STATUSES.has(item.status)) return <LibrarySkeletonRow />;
  return <LibraryTrackRow item={item} index={index} />;
}

export const LibraryRow = memo(LibraryRowInner);
