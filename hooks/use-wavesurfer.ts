import { useEffect, useState, useCallback, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

type UseWaveSurferOptions = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  audioSrc?: string | File | Blob;
  onReady?: (ws: WaveSurfer) => void;
  onTimeUpdate?: (currentTime: number) => void;
  enableRegions?: boolean;
  height?: number;
  barWidth?: number;
  barGap?: number;
  progressColor?: string;
  // When true, URL sources use placeholder peaks instead of fetching + decoding
  // the whole file. Playback still works via the <audio> element (streaming).
  // Use this for large remote files to avoid freezing the main thread.
  skipDecode?: boolean;
};

function makePlaceholderPeaks(count = 200): number[] {
  const peaks: number[] = [];
  let v = 0.4;
  for (let i = 0; i < count; i++) {
    v = Math.max(0.05, Math.min(1, v + (Math.random() - 0.5) * 0.3));
    peaks.push(v);
  }
  return peaks;
}

export function useWaveSurfer({
  containerRef,
  audioSrc,
  onReady,
  onTimeUpdate,
  enableRegions = false,
  height = 160,
  barWidth = 2,
  barGap = 1,
  progressColor,
  skipDecode = false,
}: UseWaveSurferOptions) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [regionsPlugin, setRegionsPlugin] = useState<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Use refs for callbacks to avoid re-initializing wavesurfer
  const onReadyRef = useRef(onReady);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => {
    onReadyRef.current = onReady;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onReady, onTimeUpdate]);

  useEffect(() => {
    if (!containerRef.current) return;

    const plugins = [];
    let rPlugin: RegionsPlugin | null = null;
    if (enableRegions) {
      rPlugin = RegionsPlugin.create();
      plugins.push(rPlugin);
    }

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--aw-accent")
      .trim() || "#e8a055";

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255,255,255,0.15)",
      progressColor: progressColor || accentColor,
      cursorColor: accentColor,
      barWidth,
      barGap,
      barRadius: 2,
      height,
      normalize: true,
      plugins,
    });

    setWavesurfer(ws);
    if (rPlugin) setRegionsPlugin(rPlugin);

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      if (onReadyRef.current) onReadyRef.current(ws);
    });

    ws.on("timeupdate", (time) => {
      setCurrentTime(time);
      if (onTimeUpdateRef.current) onTimeUpdateRef.current(time);
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    return () => {
      ws.destroy();
    };
  }, [containerRef, enableRegions, height, barWidth, barGap, progressColor]);

  useEffect(() => {
    if (!wavesurfer || !audioSrc) return;

    if (typeof audioSrc === "string") {
      if (skipDecode) {
        // Pass placeholder peaks so WaveSurfer skips the full file fetch/decode.
        // The <audio> element still streams the URL for playback.
        wavesurfer.load(audioSrc, [makePlaceholderPeaks()]);
      } else {
        wavesurfer.load(audioSrc);
      }
    } else {
      wavesurfer.loadBlob(audioSrc);
    }
  }, [wavesurfer, audioSrc, skipDecode]);

  const play = useCallback(() => wavesurfer?.play(), [wavesurfer]);
  const pause = useCallback(() => wavesurfer?.pause(), [wavesurfer]);
  const togglePlay = useCallback(() => wavesurfer?.playPause(), [wavesurfer]);
  const seekTo = useCallback((progress: number) => wavesurfer?.seekTo(progress), [wavesurfer]);

  return {
    wavesurfer,
    regionsPlugin,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    seekTo,
  };
}
