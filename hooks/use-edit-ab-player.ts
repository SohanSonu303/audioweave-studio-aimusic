"use client";

import { useEffect, useRef, useState } from "react";
import { useEditStore } from "@/stores/edit-store";
import type WaveSurfer from "wavesurfer.js";

export function useEditAbPlayer() {
  const { abMode, result, primarySource } = useEditStore();
  const [sourceWs, setSourceWs] = useState<WaveSurfer | null>(null);
  const [resultWs, setResultWs] = useState<WaveSurfer | null>(null);
  const prevAbModeRef = useRef(abMode);

  // Refs so the cleanup effect always sees the latest instances without needing them as deps
  const sourceWsRef = useRef<WaveSurfer | null>(null);
  const resultWsRef = useRef<WaveSurfer | null>(null);
  sourceWsRef.current = sourceWs;
  resultWsRef.current = resultWs;

  // Clear when source is cleared — explicitly destroy before dropping references
  useEffect(() => {
    if (!primarySource) {
      try { sourceWsRef.current?.destroy(); } catch {}
      try { resultWsRef.current?.destroy(); } catch {}
      setSourceWs(null);
      setResultWs(null);
    }
  }, [primarySource]);

  // A/B sync — position follows when toggling
  useEffect(() => {
    if (abMode === prevAbModeRef.current) return;
    const windowStart = result?.windowStart ?? 0;

    if (sourceWs && resultWs) {
      try {
        if (abMode === "original" && prevAbModeRef.current === "processed") {
          const currentTime = resultWs.getCurrentTime();
          const isPlaying = resultWs.isPlaying();
          if (isPlaying) resultWs.pause();
          const targetTime = currentTime + windowStart;
          const duration = sourceWs.getDuration();
          if (sourceWs.setTime) sourceWs.setTime(targetTime);
          else sourceWs.seekTo(duration > 0 ? targetTime / duration : 0);
          if (isPlaying) sourceWs.play();
        } else if (abMode === "processed" && prevAbModeRef.current === "original") {
          const currentTime = sourceWs.getCurrentTime();
          const isPlaying = sourceWs.isPlaying();
          if (isPlaying) sourceWs.pause();
          const targetTime = Math.max(0, currentTime - windowStart);
          const duration = resultWs.getDuration();
          if (resultWs.setTime) resultWs.setTime(targetTime);
          else resultWs.seekTo(duration > 0 ? targetTime / duration : 0);
          if (isPlaying) resultWs.play();
        }
      } catch {
        // Instance was destroyed between the state read and now — safe to ignore
      }
    }

    prevAbModeRef.current = abMode;
  }, [abMode, result?.windowStart, sourceWs, resultWs]);

  return { sourceWs, resultWs, setSourceWs, setResultWs };
}
