"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StemsHeader } from "@/components/stems/stems-header";
import { TrackInfoBar } from "@/components/stems/track-info-bar";
import { PlaybackBar } from "@/components/stems/playback-bar";
import { StemRow, type StemDef } from "@/components/stems/stem-row";
import { DropZone } from "@/components/ui/drop-zone";
import { icons } from "@/components/ui/icon";
import { formatTime, cn } from "@/lib/utils";
import { useSeparateStems, useSeparationStatus } from "@/lib/api/stems";

const STEMS_DEF: StemDef[] = [
  { id: "vocals", label: "Vocals", icon: icons.mic, color: "rgba(255,255,255,0.55)" },
  { id: "drums", label: "Drums", icon: icons.bolt, color: "rgba(255,255,255,0.45)" },
  { id: "bass", label: "Bass", icon: icons.waveform, color: "rgba(232,160,85,0.7)" },
  { id: "piano", label: "Piano", icon: icons.note, color: "rgba(180,140,255,0.7)" },
  { id: "guitar", label: "Guitar", icon: icons.music, color: "rgba(255,255,255,0.3)" },
];

const COLUMN_HEADERS = ["Stem", "Waveform", "Volume", "Controls"];

export default function StemsPage() {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [soloed, setSoloed] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [syncTime, setSyncTime] = useState<number | null>(null);

  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    Object.fromEntries(STEMS_DEF.map((s) => [s.id, 80])),
  );

  const playhead = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (pct: number) => {
    if (duration > 0) {
      const newTime = (pct / 100) * duration;
      setSyncTime(newTime);
      setCurrentTime(newTime);
      // Brief delay to allow audio elements to sync before clearing the signal
      setTimeout(() => setSyncTime(null), 100);
    } else {
      // If duration unknown, just jump visually (unlikely but safe)
    }
  };

  const separate = useSeparateStems();
  const { data: status, error: pollError } = useSeparationStatus(taskId);

  const isProcessing =
    separate.isPending || status?.status === "QUEUED" || status?.status === "IN_QUEUE";
  const isDone = status?.status === "COMPLETED";
  const isError = separate.isError || status?.status === "FAILED" || !!pollError;


  // Track processing progress
  const [internalProgress, setInternalProgress] = useState(0);
  useEffect(() => {
    let iv: any;
    if (isProcessing) {
      iv = setInterval(() => {
        setInternalProgress((p) => (p >= 95 ? p : p + Math.random() * 2));
      }, 500);
    } else if (isDone) {
      setInternalProgress(100);
    } else {
      setInternalProgress(0);
    }
    return () => clearInterval(iv);
  }, [isProcessing, isDone]);

  // Invalidate library cache when separation completes so library page refreshes
  useEffect(() => {
    if (isDone) {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    }
  }, [isDone, queryClient]);

  const handleUpload = async (file: File) => {
    setFileName(file.name);
    setTaskId(null);
    setInternalProgress(0);
    setErrorHeader(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const res = await separate.mutateAsync({
        file,
        projectId: "default-project",
      });
      setTaskId(res.id);
    } catch (err: any) {
      setErrorHeader(err.message || "Upload failed");
    }
  };

  const isAudible = (id: string) => !muted[id] && (soloed === null || soloed === id);

  const durationStr = duration > 0 ? formatTime(Math.round(duration)) : "---";
  const currentTimeStr = formatTime(Math.round(currentTime));

  const urls = useMemo(() => {
    if (!status) return {};
    return {
      vocals: status.vocals_url,
      drums: status.drums_url,
      bass: status.bass_url,
      piano: status.piano_url,
      guitar: status.guitar_url,
    };
  }, [status]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StemsHeader separated={isDone} onUpload={handleUpload} />

      {fileName && (
        <TrackInfoBar
          fileName={fileName}
          stemCount={STEMS_DEF.length}
          duration={isDone ? (duration > 0 ? durationStr : "Ready") : "Processing…"}
          separating={isProcessing}
          separated={isDone}
          progress={internalProgress}
        />
      )}

      {isError && (
        <div className="px-7 py-3 bg-[rgba(255,100,100,0.1)] border-b border-[rgba(255,100,100,0.2)] text-[12px] text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Error:</span>
            {errorHeader || status?.error_message || "Separation failed. Please try again."}
          </div>
          <button
            onClick={() => setFileName(null)}
            className="px-2 py-1 bg-[rgba(255,255,255,0.05)] rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col">
        {!fileName && !isProcessing && (
          <div className="flex-1 flex items-center justify-center p-10">
            <DropZone
              onFiles={(files) => files[0] && handleUpload(files[0])}
              accept="audio/*"
              hint="MP3, WAV, FLAC, AIFF · up to 200MB"
              className="w-full max-w-[480px]"
            />
          </div>
        )}

        {isProcessing && !isDone && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[color:var(--aw-text-2)] animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-t-[var(--aw-accent)] border-[rgba(255,255,255,0.1)] animate-spin" />
            <div className="text-[14px]">
              {status?.status === "IN_QUEUE" ? "Separating Stems..." : "Uploading & Processing..."}
            </div>
            <div className="text-[11px] opacity-60">This may take 1-2 minutes</div>
          </div>
        )}

        {isDone && (
          <div className="fade-in flex-1 flex flex-col">
            <PlaybackBar
              playing={playing}
              onPlayToggle={() => setPlaying((p) => !p)}
              playhead={playhead}
              onSeek={handleSeek}
              currentTime={currentTimeStr}
              duration={durationStr}
            />

            <div
              className="grid gap-0 px-7 py-2 border-b border-[color:var(--aw-border)] flex-shrink-0"
              style={{ gridTemplateColumns: "160px 1fr 130px 90px" }}
            >
              {COLUMN_HEADERS.map((h, i) => (
                <div
                  key={i}
                  className="text-[10px] font-medium text-[color:var(--aw-text-3)] tracking-[0.07em] uppercase"
                  style={{ textAlign: i >= 2 ? "center" : "left" }}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {STEMS_DEF.map((stem, i) => (
                <StemRow
                  key={stem.id}
                  stem={stem}
                  playing={playing}
                  playhead={playhead}
                  audioUrl={urls[stem.id as keyof typeof urls]}
                  volume={volumes[stem.id]}
                  muted={!!muted[stem.id]}
                  soloed={soloed === stem.id}
                  audible={isAudible(stem.id)}
                  syncTime={syncTime}
                  onDurationLoad={(d) => {
                    if (duration === 0) setDuration(d);
                  }}
                  onTimeUpdate={(t) => {
                    // Use the first track as the master for time reporting
                    if (i === 0) setCurrentTime(t);
                  }}
                  onVolumeChange={(v) => setVolumes((prev) => ({ ...prev, [stem.id]: v }))}
                  onToggleMute={() => setMuted((m) => ({ ...m, [stem.id]: !m[stem.id] }))}
                  onToggleSolo={() => setSoloed((s) => (s === stem.id ? null : stem.id))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
