"use client";

import { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { formatTime } from "@/lib/utils";
import type { MusicResponse } from "@/lib/api/image-to-song";

interface AudioPlayerProps {
  tracks: MusicResponse[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const active = tracks[activeIdx];

  // Reset when track changes
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [activeIdx]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying((p) => !p);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleDownload = () => {
    if (!active?.audio_url) return;
    const a = document.createElement("a");
    a.href = active.audio_url;
    a.download = `${active.title ?? "image-to-song"}.mp3`;
    a.click();
  };

  const playhead = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(150,220,130,0.9)" }} />
          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "rgba(150,220,130,0.9)" }}>
            Ready
          </span>
        </div>
        <div className="text-[16px] font-semibold text-[color:var(--aw-text)]">
          {active?.title ?? "Generated Song"}
        </div>
        {active?.music_style && (
          <div className="text-[12px] text-[color:var(--aw-text-3)] mt-0.5">{active.music_style}</div>
        )}
      </div>

      {/* Player */}
      <div className="px-5 py-4">
        {active?.audio_url && (
          <audio
            ref={audioRef}
            src={active.audio_url}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setPlaying(false)}
          />
        )}

        {/* Controls row */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={togglePlay}
            disabled={!active?.audio_url}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--aw-accent)", boxShadow: "0 2px 14px rgba(232,160,85,0.35)" }}
          >
            <Icon
              d={playing ? ["M6 4h4v16H6z", "M14 4h4v16h-4z"] : "M5 3l14 9-14 9V3z"}
              size={14}
              fill={playing ? "none" : "black"}
              color="black"
            />
          </button>

          {/* Timeline */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] w-[32px] text-right text-[color:var(--aw-text-3)]" style={{ fontFamily: "monospace" }}>
              {formatTime(Math.round(currentTime))}
            </span>
            <div
              className="flex-1 h-[4px] rounded-full cursor-pointer relative"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-[width] duration-100"
                style={{ width: `${playhead}%`, background: "var(--aw-accent)" }}
              />
            </div>
            <span className="text-[11px] w-[32px] text-[color:var(--aw-text-3)]" style={{ fontFamily: "monospace" }}>
              {duration > 0 ? formatTime(Math.round(duration)) : "--:--"}
            </span>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!active?.audio_url}
            title="Download"
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-150 disabled:opacity-40 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" size={14} color="var(--aw-text-2)" />
          </button>
        </div>

        {/* Track selector — if multiple tracks */}
        {tracks.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {tracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActiveIdx(i)}
                className="px-3 py-1.5 rounded-[7px] text-[11px] font-medium transition-all duration-150 cursor-pointer"
                style={{
                  background: i === activeIdx ? "rgba(232,160,85,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${i === activeIdx ? "rgba(232,160,85,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: i === activeIdx ? "var(--aw-accent)" : "var(--aw-text-3)",
                }}
              >
                Version {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lyrics */}
      {active?.generated_lyrics && (
        <div
          className="mx-5 mb-5 px-4 py-3 rounded-[10px] text-[12px] leading-relaxed whitespace-pre-wrap"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "var(--aw-text-2)",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {active.generated_lyrics}
        </div>
      )}
    </div>
  );
}
