"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Waveform } from "@/components/audio/waveform";
import { usePlayerStore } from "@/stores/player-store";
import type { TrackItem } from "@/lib/api/library";
import { formatTime } from "@/lib/utils";

interface VariationCardProps {
  index: number;
  track: TrackItem;
}

export function VariationCard({ index, track }: VariationCardProps) {
  const { currentTrack, isPlaying, toggle } = usePlayerStore();

  // Stable ID scoped to variation index — prevents two cards with the same
  // backend track ID (happens when both variations share task_id) from
  // triggering play state on each other.
  const stableId = `variation-${track.id}-${index}`;
  const playing = currentTrack?.id === stableId && isPlaying;

  const handlePlay = () => {
    if (!track.audio_url) return;
    toggle({
      id: stableId,
      title: track.title ?? `Variation ${index + 1}`,
      audioUrl: track.audio_url,
      duration: track.duration ? formatTime(track.duration) : undefined,
    });
  };

  const handleDownload = () => {
    if (!track.audio_url) return;
    const a = document.createElement("a");
    a.href = track.audio_url;
    a.download = `${track.title ?? "track"}.mp3`;
    a.click();
  };

  const durationStr = track.duration ? formatTime(Math.round(track.duration)) : "—";

  return (
    <div className="flex-1 bg-[color:var(--aw-card-hi)] rounded-[10px] p-[12px_14px] border border-[color:var(--aw-border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[color:var(--aw-text-2)] font-medium">
          {track.type === "sfx" ? "Sound FX" : `Variation ${index + 1}`}
        </span>
        <div className="flex gap-[6px]">
          <button
            onClick={handlePlay}
            disabled={!track.audio_url}
            className="w-6 h-6 rounded-full bg-[color:var(--aw-accent)] flex items-center justify-center border-none cursor-pointer disabled:opacity-40 transition-transform active:scale-90"
          >
            <Icon
              d={playing ? icons.pause : icons.play}
              size={10}
              fill="white"
              color="none"
            />
          </button>
          <button
            onClick={handleDownload}
            disabled={!track.audio_url}
            className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center border border-[color:var(--aw-border)] cursor-pointer disabled:opacity-40"
          >
            <Icon d={icons.download} size={10} color="var(--aw-text-2)" />
          </button>
        </div>
      </div>
      <div className="h-9">
        <Waveform bars={40} playing={playing} color="var(--aw-accent)" />
      </div>
      <div className="flex justify-between mt-[6px] text-[10px] text-[color:var(--aw-text-3)]">
        <span>0:00</span>
        <span>{durationStr}</span>
      </div>
    </div>
  );
}
