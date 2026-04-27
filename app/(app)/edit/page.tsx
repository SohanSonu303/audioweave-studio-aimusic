"use client";

import { useEffect } from "react";
import { useEditStore } from "@/stores/edit-store";
import { useEditAbPlayer } from "@/hooks/use-edit-ab-player";

import { ToolConsole } from "@/components/edit/tool-console";
import { InspectorPanel } from "@/components/edit/inspector-panel";
import { PlaybackDeck } from "@/components/edit/playback-deck";
import { TrackHeader } from "@/components/edit/track-header";
import { SourceWaveform } from "@/components/edit/source-waveform";
import { ResultWaveform } from "@/components/edit/result-waveform";
import { ProcessingOverlay } from "@/components/edit/trim-loading-overlay";

export default function EditPage() {
  const { primarySource, analysis, preview, setPreview, result } = useEditStore();
  const { sourceWs, resultWs, setSourceWs, setResultWs } = useEditAbPlayer();

  // Mutual-pause: playing one stops the other
  useEffect(() => {
    if (!sourceWs || !resultWs) return;
    const pauseResult = () => { try { if (resultWs.isPlaying()) resultWs.pause(); } catch {} };
    const pauseSource = () => { try { if (sourceWs.isPlaying()) sourceWs.pause(); } catch {} };
    sourceWs.on("play", pauseResult);
    resultWs.on("play", pauseSource);
    return () => {
      try { sourceWs.un("play", pauseResult); } catch {}
      try { resultWs.un("play", pauseSource); } catch {}
    };
  }, [sourceWs, resultWs]);

  const handleDownload = () => {
    if (!result) return;
    // Build a one-shot blob URL from base64 so revoking doesn't invalidate the
    // long-lived result.blobUrl that the result waveform is still using.
    const byteString = atob(result.audioB64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
    const mime = result.audioFormat === "mp3" ? "audio/mpeg" : "audio/wav";
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));

    const link = document.createElement("a");
    link.href = url;
    const baseName =
      primarySource?.kind === "file"
        ? primarySource.file.name.replace(/\.[^.]+$/, "")
        : "audio";
    link.download = `${result.op}-${baseName}.${result.audioFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleRegionClick = (index: number) => {
    if (analysis?.candidates) {
      const cand = analysis.candidates.find((c) => c.index === index);
      if (cand) {
        setPreview({ chosenIndex: index, windowStart: cand.start, windowEnd: cand.end, reasoning: "Manually selected." });
      }
    }
  };

  const candidates = result?.candidates?.length
    ? result.candidates
    : analysis?.candidates?.length
    ? analysis.candidates
    : preview
    ? [{
        index: preview.chosenIndex ?? 0,
        start: preview.windowStart ?? 0,
        end: preview.windowEnd ?? 0,
        duration: (preview.windowEnd ?? 0) - (preview.windowStart ?? 0),
        duration_score: 1, energy_score: 1, structural_score: 1,
        spectral_quality_score: 1, total_score: 1,
        segment_labels: [], needs_loop: false,
      }]
    : [];

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">
      <ProcessingOverlay />

      {/* Tool Console */}
      <ToolConsole />

      {/* Main canvas + playback deck */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1080px] mx-auto w-full flex flex-col gap-8 items-center px-10 py-10">
            {primarySource ? (
              <>
                <TrackHeader />

                {/* Source Waveform — always visible */}
                <div className="w-full">
                  <SourceWaveform
                    audioSrc={primarySource.kind === "file" ? primarySource.file : primarySource.url}
                    candidates={candidates}
                    chosenIndex={result?.chosenIndex ?? preview?.chosenIndex}
                    onRegionClick={handleRegionClick}
                    abMode="original"
                    onReady={setSourceWs}
                  />
                </div>

                {/* Result Waveform — shown below source when result exists */}
                {result && (
                  <div className="w-full">
                    <ResultWaveform
                      audioBlobUrl={result.blobUrl}
                      audioFormat={result.audioFormat}
                      label={result.op.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      onReady={setResultWs}
                      onDownload={handleDownload}
                    />
                  </div>
                )}

                {/* AI reasoning pill */}
                {preview?.reasoning && !result && (
                  <div className="w-full max-w-[640px] text-center">
                    <p className="text-[12px] leading-relaxed">
                      <span className="text-aw-accent font-medium uppercase tracking-wider text-[10px]">AI · </span>
                      <span className="text-aw-text-2 italic">{preview.reasoning}</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Empty state — no source yet */
              <div className="max-w-[480px] mx-auto text-center flex flex-col items-center gap-4 py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(232,160,85,0.08)", border: "1px solid rgba(232,160,85,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--aw-accent)" }}>
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <h2 className="font-display text-[28px] font-light text-aw-text">Select a tool to start</h2>
                <p className="text-[13px] text-aw-text-2 leading-relaxed">
                  Pick an operation from the left panel, then upload or paste a URL in the Inspector on the right.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Playback Deck */}
        <PlaybackDeck sourceWs={sourceWs} resultWs={resultWs} />
      </main>

      {/* Right Inspector */}
      <InspectorPanel />
    </div>
  );
}
