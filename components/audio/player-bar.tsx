"use client";

import { useRef } from "react";
import { Icon, icons } from "@/components/ui/icon";
import { usePlayerStore } from "@/stores/player-store";
import { formatTime } from "@/lib/utils";

// Slower, more natural-feeling equalizer — durations 1.4s–2.8s
const EQ_BARS = Array.from({ length: 28 }, (_, i) => ({
  dur:    1.4 + ((i * 23 + 5) % 17) / 17 * 1.4,
  delay:  ((i * 13) % 19) / 19 * 1.2,
  baseH:  20 + ((i * 31 + 7) % 60),
}));

function EqualizerBars({ color = "var(--aw-accent)" }: { color?: string }) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 26 }}>
      {EQ_BARS.map(({ dur, delay, baseH }, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            height: `${baseH}%`,
            transformOrigin: "bottom",
            animation: `eq-bar ${dur}s ease-in-out ${delay}s infinite`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function SeekButton({
  direction,
  onClick,
}: {
  direction: "back" | "forward";
  onClick: () => void;
}) {
  const isBack = direction === "back";
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center opacity-65 hover:opacity-100 transition-opacity active:scale-90"
      style={{ width: 38, height: 38 }}
    >
      <Icon
        d={isBack ? icons.rotateCcw : icons.rotateCw}
        size={30}
        color="var(--aw-text-2)"
        stroke={1.4}
      />
      {/* "15" centred inside the arc */}
      <span
        className="absolute font-bold tabular-nums pointer-events-none"
        style={{
          fontSize: 9,
          color: "var(--aw-text)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -44%)",
          lineHeight: 1,
        }}
      >
        15
      </span>
    </button>
  );
}

export function PlayerBar() {
  const { currentTrack, isPlaying, pause, play, stop, seek, currentTime, audioDuration } =
    usePlayerStore();
  const scrubRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const pct = audioDuration > 0 ? Math.min(currentTime / audioDuration, 1) : 0;
  const color = currentTrack.color ?? "var(--aw-accent)";

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else play(currentTrack);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubRef.current || audioDuration <= 0) return;
    const rect = scrubRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * audioDuration);
  };

  const currentSecs = Math.floor(currentTime);
  const totalSecs = Math.floor(audioDuration);

  return (
    <div
      className="flex-shrink-0 flex items-center gap-5 px-5 border-t border-[color:var(--aw-border)]"
      style={{
        height: 68,
        background: "rgba(16,16,16,0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Track info */}
      <div className="flex items-center gap-3 w-[200px] flex-shrink-0 min-w-0">
        <div
          className="w-[6px] h-[32px] rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
        />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[color:var(--aw-text)] truncate leading-tight">
            {currentTrack.title}
          </div>
          <div className="text-[10px] text-[color:var(--aw-text-3)] mt-[1px]">AudioWeave</div>
        </div>
      </div>

      {/* Controls + scrubber */}
      <div className="flex-1 flex flex-col items-center gap-[6px]">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <SeekButton direction="back" onClick={() => seek(currentTime - 15)} />

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 flex-shrink-0"
            style={{ background: "var(--aw-accent)", boxShadow: "0 0 14px rgba(232,160,85,0.35)" }}
          >
            <Icon d={isPlaying ? icons.pause : icons.play} size={15} fill="black" color="none" />
          </button>

          <SeekButton direction="forward" onClick={() => seek(currentTime + 15)} />
        </div>

        {/* Time + scrubber */}
        <div className="flex items-center gap-2 w-full max-w-[420px]">
          <span className="text-[10px] font-mono text-[color:var(--aw-text-3)] tabular-nums w-[28px] text-right flex-shrink-0">
            {formatTime(currentSecs)}
          </span>
          <div
            ref={scrubRef}
            className="flex-1 h-[3px] rounded-full cursor-pointer relative group"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={handleScrub}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct * 100}%`,
                background: `linear-gradient(90deg, rgba(232,160,85,0.6), var(--aw-accent))`,
                boxShadow: "0 0 6px rgba(232,160,85,0.4)",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                left: `calc(${pct * 100}% - 4.5px)`,
                background: "var(--aw-accent)",
                boxShadow: "0 0 6px rgba(232,160,85,0.6)",
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-[color:var(--aw-text-3)] tabular-nums w-[28px] flex-shrink-0">
            {totalSecs > 0 ? formatTime(totalSecs) : "—"}
          </span>
        </div>
      </div>

      {/* Right: equalizer + close */}
      <div className="flex items-center gap-4 w-[160px] justify-end flex-shrink-0">
        {isPlaying && <EqualizerBars color={color} />}
        <button
          onClick={stop}
          className="w-7 h-7 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--aw-border)" }}
        >
          <Icon d={icons.close} size={11} color="var(--aw-text)" />
        </button>
      </div>
    </div>
  );
}
