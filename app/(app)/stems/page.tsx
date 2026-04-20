"use client";

import { useState, useEffect, useRef } from "react";
import { StemsHeader } from "@/components/stems/stems-header";
import { TrackInfoBar } from "@/components/stems/track-info-bar";
import { PlaybackBar } from "@/components/stems/playback-bar";
import { StemRow, type StemDef } from "@/components/stems/stem-row";
import { DropZone } from "@/components/ui/drop-zone";
import { icons } from "@/components/ui/icon";
import { formatTime } from "@/lib/utils";

const STEMS_DEF: StemDef[] = [
  { id: "vocals",  label: "Vocals",     icon: icons.mic,        color: "rgba(255,255,255,0.55)" },
  { id: "drums",   label: "Drums",      icon: icons.bolt,       color: "rgba(255,255,255,0.45)" },
  { id: "bass",    label: "Bass",       icon: icons.waveform,   color: "rgba(232,160,85,0.7)"   },
  { id: "melody",  label: "Melody",     icon: icons.note[0],    color: "rgba(255,255,255,0.4)"  },
  { id: "harmony", label: "Harmony",    icon: icons.layers[0],  color: "rgba(232,160,85,0.5)"   },
  { id: "fx",      label: "FX / Other", icon: icons.sparkle[0], color: "rgba(255,255,255,0.3)"  },
];

const DEMO_TRACK = { name: "Epic Battle Theme.wav", duration: "3:24", totalSeconds: 204 };

const COLUMN_HEADERS = ["Stem", "Waveform", "Volume", "Controls"];

export default function StemsPage() {
  const [fileName, setFileName] = useState(DEMO_TRACK.name);
  const [separating, setSeparating] = useState(false);
  const [separated, setSeparated] = useState(true);
  const [progress, setProgress] = useState(100);
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [soloed, setSoloed] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [volumes, setVolumes] = useState<Record<string, number>>(
    () => Object.fromEntries(STEMS_DEF.map((s) => [s.id, 80])),
  );
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(
        () => setPlayhead((p) => (p >= 100 ? 0 : p + 0.15)),
        80,
      );
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing]);

  const startSeparation = (name: string) => {
    setFileName(name);
    setSeparating(true);
    setSeparated(false);
    setProgress(0);
    setPlaying(false);
    setPlayhead(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setSeparating(false);
          setSeparated(true);
          return 100;
        }
        return p + 1.2;
      });
    }, 40);
  };

  const handleUpload = (file: File) => startSeparation(file.name);
  const handleDropFiles = (files: File[]) => { if (files[0]) startSeparation(files[0].name); };

  const isAudible = (id: string) => !muted[id] && (soloed === null || soloed === id);

  const currentTime = formatTime(Math.round((playhead / 100) * DEMO_TRACK.totalSeconds));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StemsHeader separated={separated} onUpload={handleUpload} />

      {fileName && (
        <TrackInfoBar
          fileName={fileName}
          stemCount={STEMS_DEF.length}
          duration={DEMO_TRACK.duration}
          separating={separating}
          separated={separated}
          progress={progress}
        />
      )}

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Drop zone — no file loaded */}
        {!fileName && (
          <div className="flex-1 flex items-center justify-center p-10">
            <DropZone
              onFiles={handleDropFiles}
              accept="audio/*"
              hint="MP3, WAV, FLAC, AIFF · up to 200MB"
              className="w-full max-w-[480px]"
            />
          </div>
        )}

        {/* Stems mixer */}
        {separated && (
          <div className="fade-in flex-1 flex flex-col">
            <PlaybackBar
              playing={playing}
              onPlayToggle={() => setPlaying((p) => !p)}
              playhead={playhead}
              onSeek={setPlayhead}
              currentTime={currentTime}
              duration={DEMO_TRACK.duration}
            />

            {/* Column labels */}
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

            {/* Stem rows */}
            <div className="flex-1 overflow-y-auto">
              {STEMS_DEF.map((stem) => (
                <StemRow
                  key={stem.id}
                  stem={stem}
                  playing={playing}
                  playhead={playhead}
                  volume={volumes[stem.id]}
                  muted={!!muted[stem.id]}
                  soloed={soloed === stem.id}
                  audible={isAudible(stem.id)}
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
