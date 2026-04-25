"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useWaveSurfer } from "@/hooks/use-wavesurfer";

export interface StemDef {
  id: string;
  label: string;
  icon: string | string[];
  color: string;
}

interface StemRowProps {
  stem: StemDef;
  playing: boolean;
  playhead: number;
  volume: number;
  muted: boolean;
  soloed: boolean;
  audible: boolean;
  audioUrl?: string | null;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onDurationLoad?: (d: number) => void;
  onTimeUpdate?: (t: number) => void;
  syncTime?: number | null;
}

export function StemRow({
  stem,
  playing,
  playhead,
  volume,
  muted,
  soloed,
  audible,
  audioUrl,
  onVolumeChange,
  onToggleMute,
  onToggleSolo,
  onDurationLoad,
  onTimeUpdate,
  syncTime,
}: StemRowProps) {
  const [stemRowHovered, setStemRowHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, duration, currentTime } = useWaveSurfer({
    containerRef,
    audioSrc: audioUrl || undefined,
    height: 48,
    barWidth: 2,
    barGap: 1,
    progressColor: stem.color,
  });

  // Report duration and time updates
  useEffect(() => {
    if (duration > 0 && onDurationLoad) onDurationLoad(duration);
  }, [duration, onDurationLoad]);

  useEffect(() => {
    if (onTimeUpdate) onTimeUpdate(currentTime);
  }, [currentTime, onTimeUpdate]);

  // Sync playing state
  useEffect(() => {
    if (!wavesurfer) return;
    if (playing) {
      wavesurfer.play().catch(() => {});
    } else {
      wavesurfer.pause();
    }
  }, [playing, wavesurfer]);

  // Sync volume and audible state
  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setVolume((volume / 100) * (audible ? 1 : 0));
  }, [volume, audible, wavesurfer]);

  // Sync seek (external seek from master)
  useEffect(() => {
    if (syncTime !== null && syncTime !== undefined && wavesurfer) {
      wavesurfer.setTime(syncTime);
    }
  }, [syncTime, wavesurfer]);

  return (
    <div
      onMouseEnter={() => setStemRowHovered(true)}
      onMouseLeave={() => setStemRowHovered(false)}
      className={`grid gap-0 px-7 py-[10px] border-b border-[rgba(255,255,255,0.04)] items-center transition-all duration-150 ${stemRowHovered ? "bg-[rgba(255,255,255,0.02)]" : ""}`}
      style={{
        gridTemplateColumns: "160px 1fr 130px 90px",
        opacity: audible ? 1 : 0.3,
      }}
    >
      {/* Stem label */}
      <div className="flex items-center gap-[10px]">
        <div
          className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Icon d={stem.icon} size={13} color="rgba(255,255,255,0.5)" />
        </div>
        <div>
          <div
            className="text-[13px] font-medium"
            style={{ color: audible ? "var(--aw-text)" : "var(--aw-text-3)" }}
          >
            {stem.label}
          </div>
          <div className="text-[10px] text-[color:var(--aw-text-3)] mt-[1px]">{volume}%</div>
        </div>
      </div>

      {/* Waveform with playhead */}
      <div className="h-12 pr-5 relative flex items-center">
        <div ref={containerRef} className="w-full h-full" style={{ opacity: audible ? 1 : 0.5 }} />
      </div>

      {/* Volume slider */}
      <div className="flex items-center justify-center">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(+e.target.value)}
          className="w-[90px] cursor-pointer"
          style={{ accentColor: "rgba(232,160,85,0.8)" }}
        />
      </div>

      {/* S / M / DL */}
      <div className="flex gap-[5px] justify-center">
        <button
          onClick={onToggleSolo}
          title="Solo"
          className="w-[26px] h-[26px] rounded-[6px] text-[11px] font-bold cursor-pointer transition-all duration-150"
          style={{
            background: soloed ? "rgba(232,160,85,0.2)" : "rgba(255,255,255,0.05)",
            color: soloed ? "var(--aw-accent)" : "var(--aw-text-3)",
            border: `1px solid ${soloed ? "rgba(232,160,85,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          S
        </button>
        <button
          onClick={onToggleMute}
          title="Mute"
          className="w-[26px] h-[26px] rounded-[6px] text-[11px] font-bold cursor-pointer transition-all duration-150"
          style={{
            background: muted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
            color: muted ? "var(--aw-text)" : "var(--aw-text-3)",
            border: `1px solid ${muted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          M
        </button>
        {audioUrl ? (
          <a
            href={audioUrl}
            download={`${stem.label}.wav`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download"
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Icon
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              size={11}
              color="var(--aw-text-3)"
            />
          </a>
        ) : (
          <button
            disabled
            title="Download (Processing...)"
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center cursor-not-allowed opacity-30"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Icon
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              size={11}
              color="var(--aw-text-3)"
            />
          </button>
        )}
      </div>
    </div>
  );
}
