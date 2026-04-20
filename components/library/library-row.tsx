"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Waveform } from "@/components/audio/waveform";
import { TrackThumbnail } from "@/components/audio/track-thumbnail";
import { usePlayerStore } from "@/stores/player-store";
import type { TrackItem } from "@/lib/api/library";
import { formatTime } from "@/lib/utils";

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

export function LibraryRow({ item, index }: LibraryRowProps) {
  const { currentTrack, isPlaying, toggle } = usePlayerStore();
  const playing = currentTrack?.id === item.id && isPlaying;
  const color = TYPE_COLORS[item.type] ?? "#e8a055";

  const handlePlay = () => {
    if (!item.audio_url) return;
    toggle({
      id: item.id,
      title: item.title ?? "Untitled",
      audioUrl: item.audio_url,
      color,
      duration: item.duration ? formatTime(Math.round(item.duration)) : undefined,
    });
  };

  const handleDownload = () => {
    if (!item.audio_url) return;
    const a = document.createElement("a");
    a.href = item.audio_url;
    a.download = `${item.title ?? "track"}.mp3`;
    a.click();
  };

  const tags = item.music_style
    ? item.music_style.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const durationStr = item.duration ? formatTime(Math.round(item.duration)) : "—";

  return (
    <div
      className="grid items-center gap-0 px-5 py-[7px] border-b border-[rgba(255,255,255,0.04)] transition-colors duration-100 cursor-default"
      style={{ gridTemplateColumns: "32px 1fr 1fr 180px 60px 80px 80px" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={!item.audio_url}
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 disabled:opacity-40"
        style={{
          background: playing ? color : "rgba(255,255,255,0.07)",
          border: `1px solid ${playing ? color : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <Icon
          d={playing ? icons.pause[0] : icons.play}
          size={10}
          fill={playing ? "#000" : "rgba(255,255,255,0.7)"}
          color={playing ? "#000" : "rgba(255,255,255,0.7)"}
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

      {/* Tags */}
      <div className="flex gap-1 overflow-hidden flex-nowrap">
        {tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[10px] px-2 py-[2px] rounded-[var(--radius-pill)] bg-[rgba(255,255,255,0.06)] text-[color:var(--aw-text-2)] border border-[rgba(255,255,255,0.09)] whitespace-nowrap"
          >
            {t}
          </span>
        ))}
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
