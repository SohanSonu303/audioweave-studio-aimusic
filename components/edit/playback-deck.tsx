"use client";

import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { formatTimeWithDecimal } from "@/lib/utils";
import { useEditStore } from "@/stores/edit-store";
import type WaveSurfer from "wavesurfer.js";

interface PlaybackDeckProps {
  sourceWs: WaveSurfer | null;
  resultWs: WaveSurfer | null;
}

export function PlaybackDeck({ sourceWs, resultWs }: PlaybackDeckProps) {
  const { primarySource, result, abMode } = useEditStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const useResult = !!result && abMode === "processed";
  const activeWs = useResult ? resultWs : sourceWs;

  // Subscribe to the active wavesurfer's events. Re-binds when `activeWs`
  // identity changes (source ↔ result swap, file reload, etc.).
  useEffect(() => {
    if (!activeWs) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const syncState = () => {
      setDuration(activeWs.getDuration() || 0);
      setCurrentTime(activeWs.getCurrentTime() || 0);
      setIsPlaying(activeWs.isPlaying());
    };
    syncState();

    const onReady = () => setDuration(activeWs.getDuration());
    const onTime = (t: number) => setCurrentTime(t);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFinish = () => setIsPlaying(false);

    activeWs.on("ready", onReady);
    activeWs.on("timeupdate", onTime);
    activeWs.on("play", onPlay);
    activeWs.on("pause", onPause);
    activeWs.on("finish", onFinish);

    return () => {
      activeWs.un("ready", onReady);
      activeWs.un("timeupdate", onTime);
      activeWs.un("play", onPlay);
      activeWs.un("pause", onPause);
      activeWs.un("finish", onFinish);
    };
  }, [activeWs]);

  useEffect(() => {
    activeWs?.setVolume(volume);
  }, [volume, activeWs]);

  const handleToggle = () => activeWs?.playPause();

  const handleSkip = (seconds: number) => {
    if (!activeWs) return;
    const dur = activeWs.getDuration();
    const target = Math.max(0, Math.min(dur, activeWs.getCurrentTime() + seconds));
    if (activeWs.setTime) activeWs.setTime(target);
    else activeWs.seekTo(dur > 0 ? target / dur : 0);
  };

  const accent = useResult ? "var(--aw-green)" : "var(--aw-accent)";
  const accentRgb = useResult ? "96,192,144" : "232,160,85";
  const hasAudio = !!primarySource;

  return (
    <div
      className="h-24 border-t border-aw-border flex items-center justify-between px-10 shrink-0"
      style={{ background: "#080808" }}
    >
      {/* Left — Playing indicator + time */}
      <div className="flex flex-col min-w-[180px]">
        <span
          className="uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 mb-2 font-light"
          style={{ color: hasAudio ? accent : "var(--aw-text-3)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: hasAudio ? accent : "var(--aw-text-3)",
              animation: isPlaying ? "pulse 1.5s ease infinite" : undefined,
            }}
          />
          {isPlaying ? "Playing" : hasAudio ? "Ready" : "No Source"}
        </span>
        <div className="font-mono text-[18px] text-aw-text leading-none tracking-tight tabular-nums">
          {formatTimeWithDecimal(currentTime)}
          <span className="text-aw-text-2/60 text-[13px] ml-1 font-light">
            / {formatTimeWithDecimal(duration)}
          </span>
        </div>
      </div>

      {/* Center — Transport */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => handleSkip(-5)}
          disabled={!hasAudio}
          className="text-aw-text-2 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Back 5s"
        >
          <SkipBack size={24} />
        </button>
        <button
          onClick={handleToggle}
          disabled={!hasAudio}
          className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-100 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: accent,
            color: "#1a0c00",
            boxShadow: `0 0 25px rgba(${accentRgb},0.35)`,
          }}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
        </button>
        <button
          onClick={() => handleSkip(5)}
          disabled={!hasAudio}
          className="text-aw-text-2 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Forward 5s"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Right — Volume */}
      <div className="flex items-center gap-4 text-aw-text-2 min-w-[180px] justify-end">
        <Volume2 size={18} />
        <div className="w-28 h-1 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full"
            style={{ width: `${volume * 100}%`, background: accent }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>
      </div>
    </div>
  );
}
