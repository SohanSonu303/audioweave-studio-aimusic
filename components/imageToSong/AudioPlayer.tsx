"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useWaveSurfer } from "@/hooks/use-wavesurfer";
import { formatTimeWithDecimal } from "@/lib/utils";
import type { MusicResponse } from "@/lib/api/image-to-song";
import { WaveformTimeline } from "@/components/edit/waveform-timeline";

interface AudioPlayerProps {
  tracks: MusicResponse[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const active = tracks[activeIdx];

  const { isPlaying, currentTime, duration, togglePlay } = useWaveSurfer({
    containerRef,
    audioSrc: active?.audio_url ?? "",
    enableRegions: false,
    height: 120,
    barWidth: 2,
    barGap: 2,
    progressColor: "var(--aw-accent)",
    waveColor: "rgba(255,255,255,0.08)",
  });

  const handleDownload = () => {
    if (!active?.audio_url) return;
    const a = document.createElement("a");
    a.href = active.audio_url;
    a.download = `${active.title ?? "image-to-song"}.mp3`;
    a.click();
  };

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background: "#0a0a0a",
        borderColor: "rgba(232,160,85,0.2)",
        boxShadow: "0 0 0 0.5px rgba(232,160,85,0.06) inset, 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(232,160,85,0.12)", background: "rgba(232,160,85,0.04)" }}
      >
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={!active?.audio_url || duration === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ background: "var(--aw-accent)", color: "#1a0c00" }}
          >
            {isPlaying
              ? <Pause size={18} fill="currentColor" />
              : <Play size={18} fill="currentColor" className="translate-x-[1px]" />
            }
          </button>

          <div className="flex flex-col">
             <span className="text-[14px] font-semibold text-aw-text">
                {active?.title ?? "Generated Composition"}
             </span>
             <span className="font-mono text-[11px] tabular-nums text-aw-accent mt-0.5">
                {formatTimeWithDecimal(currentTime)}
                <span className="text-aw-text-3 ml-1">/ {formatTimeWithDecimal(duration)}</span>
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Version Selector */}
          {tracks.length > 1 && (
             <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                <button 
                  onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeIdx === 0}
                  className="p-1 hover:text-aw-accent disabled:opacity-20 text-aw-text-2"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 text-aw-text-2">
                  v{activeIdx + 1}
                </span>
                <button 
                  onClick={() => setActiveIdx(prev => Math.min(tracks.length - 1, prev + 1))}
                  disabled={activeIdx === tracks.length - 1}
                  className="p-1 hover:text-aw-accent disabled:opacity-20 text-aw-text-2"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all hover:bg-white/5 border border-white/10"
            style={{ color: "var(--aw-text)" }}
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      <WaveformTimeline duration={duration} />

      <div className="w-full px-8 py-10">
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Lyrics if available */}
      {active?.generated_lyrics && (
        <div className="px-8 pb-8">
           <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[12px] leading-relaxed text-aw-text-2 italic whitespace-pre-wrap max-h-[120px] overflow-y-auto">
             {active.generated_lyrics}
           </div>
        </div>
      )}
    </div>
  );
}
