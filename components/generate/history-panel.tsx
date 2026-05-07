"use client";

import { useState } from "react";
import { Icon, icons } from "@/components/ui/icon";
import { Waveform } from "@/components/audio/waveform";
import { useLibrary } from "@/lib/api/library";
import { usePlayerStore } from "@/stores/player-store";
import { formatTime } from "@/lib/utils";

type HistoryTab = "History" | "Favorites";

export function HistoryPanel() {
  const [tab, setTab] = useState<HistoryTab>("History");
  const { data } = useLibrary();
  const { currentTrack, isPlaying, toggle } = usePlayerStore();

  const recent = (data?.tracks ?? [])
    .filter((t) => t.status === "COMPLETED")
    .slice(0, 5);

  return (
    <div className="w-[260px] flex-shrink-0 border-l border-[color:var(--aw-border)] flex flex-col overflow-hidden h-full">
      {/* Tabs */}
      <div className="flex border-b border-[color:var(--aw-border)] flex-shrink-0">
        {(["History", "Favorites"] as HistoryTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-[12px] font-medium bg-transparent cursor-pointer transition-all duration-150"
            style={{
              color: tab === t ? "var(--aw-text)" : "var(--aw-text-2)",
              borderBottom: tab === t ? "1.5px solid var(--aw-accent)" : "1.5px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {recent.length === 0 ? (
          <div className="text-[11px] text-[color:var(--aw-text-3)] text-center pt-8">
            No history yet
          </div>
        ) : (
          recent.map((track, i) => {
            const playing = currentTrack?.id === track.id && isPlaying;
            const handlePlay = () => {
              if (!track.audio_url) return;
              toggle({
                id: track.id,
                title: track.title ?? track.prompt ?? "Track",
                audioUrl: track.audio_url,
                duration: track.duration ? formatTime(Math.round(track.duration)) : undefined,
              });
            };
            return (
              <div key={track.id} className="fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="text-[10px] text-[color:var(--aw-text-3)] mb-1 truncate">
                  {track.prompt ?? track.title ?? "Generated track"}
                </div>
                <div
                  className="bg-[color:var(--aw-card)] rounded-[10px] p-[10px_12px] mb-[6px] border border-[color:var(--aw-border)] flex items-center gap-2"
                >
                  <button
                    onClick={handlePlay}
                    disabled={!track.audio_url}
                    className="w-[22px] h-[22px] rounded-full bg-[color:var(--aw-card-hi)] border border-[color:var(--aw-border)] flex items-center justify-center cursor-pointer flex-shrink-0 disabled:opacity-40"
                  >
                    <Icon
                      d={playing ? icons.pause : icons.play}
                      size={8}
                      fill={playing ? "none" : "var(--aw-text-2)"}
                      color="var(--aw-text-2)"
                    />
                  </button>
                  <div className="flex-1 h-[22px]">
                    <Waveform bars={30} playing={playing} />
                  </div>
                  <button className="flex-shrink-0 opacity-40">
                    <Icon d={icons.heart} size={12} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!track.audio_url) return;
                      const res = await fetch(track.audio_url);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${track.title ?? "track"}.mp3`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-shrink-0 opacity-40"
                  >
                    <Icon d={icons.download} size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
