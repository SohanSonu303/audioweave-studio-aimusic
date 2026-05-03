"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GenerateHeader } from "@/components/generate/generate-header";
import { LyricsCard } from "@/components/generate/lyrics-card";
import { GeneratingCard } from "@/components/generate/generating-card";
import { VariationCard } from "@/components/generate/variation-card";
import { PromptBar } from "@/components/generate/prompt-bar";
import { StylePicker } from "@/components/generate/style-picker";
import { HistoryPanel } from "@/components/generate/history-panel";
import { useGenerateMusic, useGenerateSound, useSoundPoll } from "@/lib/api/generations";
import { useDownloadPoll } from "@/lib/api/library";
import { useQuickIdea, useEnhancePrompt } from "@/lib/api/prompt";
import type { TrackItem } from "@/lib/api/library";
import type { SoundResponse } from "@/lib/api/generations";
import type { components } from "@/lib/types";

type GenTab = "Song" | "Music" | "Sound FX";
type MusicType = components["schemas"]["MusicType"];

const QUICK_IDEA_FALLBACK: Record<GenTab, string> = {
  Song: "a song",
  Music: "music",
  "Sound FX": "a sound effect",
};

const TAB_MUSIC_TYPE: Record<"Song" | "Music", MusicType> = {
  Song: "vocal",
  Music: "music",
};

function adaptSoundResponse(s: SoundResponse): TrackItem {
  return {
    id: s.task_id,
    project_id: s.project_id,
    type: "sfx",
    task_id: s.task_id,
    conversion_id: s.conversion_id ?? null,
    status: s.status,
    audio_url: s.audio_url ?? null,
    prompt: null,
    music_style: null,
    title: null,
    duration: null,
    album_cover_path: null,
    generated_lyrics: null,
  };
}

export default function GeneratePage() {
  const [tab, setTab] = useState<GenTab>("Music");
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [included, setIncluded] = useState(["Cinematic", "Orchestral"]);
  const [excluded, setExcluded] = useState(["Electronic"]);
  const [sfxLength, setSfxLength] = useState<number>(10);

  // Generation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isSfxMode, setIsSfxMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedTracks, setCompletedTracks] = useState<TrackItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryClient = useQueryClient();
  const generateMusic = useGenerateMusic();
  const generateSound = useGenerateSound();
  // Music poll: only active when NOT in SFX mode
  const { data: musicPollData } = useDownloadPoll(isSfxMode ? null : taskId);
  // SFX poll: only active when in SFX mode — uses dedicated endpoint
  const { data: sfxPollData } = useSoundPoll(isSfxMode ? taskId : null);
  const quickIdea = useQuickIdea();
  const enhancePrompt = useEnhancePrompt();

  // isSubmitting bridges the gap between mutateAsync resolving and setTaskId(tid) applying
  const generating = isSubmitting || (!!taskId && completedTracks.length === 0 && !errorMsg);
  const generated = completedTracks.length > 0;

  // Simulated progress: slowly ramp 10→75 during polling, snap to 100 on complete
  useEffect(() => {
    if (generating && taskId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(10);
      progressInterval.current = setInterval(() => {
        setProgress((p) => (p < 75 ? p + 0.3 : p));
      }, 400);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [generating, taskId]);

  // 500-second hard timeout — if still generating, stop polling and show error
  useEffect(() => {
    if (!taskId || completedTracks.length > 0 || errorMsg) return;
    pollTimeout.current = setTimeout(() => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
      setTaskId(null);
      setErrorMsg("Generation timed out. Please refresh the page and try again.");
    }, 500_000);
    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, [taskId, completedTracks.length, errorMsg]);

  // Music completion — backend returns results spread across tracks + sounds
  useEffect(() => {
    if (!musicPollData) return;
    const allItems = [...(musicPollData.tracks ?? []), ...(musicPollData.sounds ?? [])];
    const allDone =
      allItems.length > 0 &&
      allItems.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
    if (allDone) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(100);
      setCompletedTracks(allItems.filter((t) => t.status === "COMPLETED"));
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  // queryClient is stable from useQueryClient, safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicPollData]);

  // SFX completion — single SoundResponse from dedicated endpoint
  useEffect(() => {
    if (!sfxPollData) return;
    const done = sfxPollData.status === "COMPLETED" || sfxPollData.status === "FAILED";
    if (!done) return;
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (pollTimeout.current) clearTimeout(pollTimeout.current);
    setProgress(100);
    if (sfxPollData.status === "COMPLETED") {
      setCompletedTracks([adaptSoundResponse(sfxPollData)]);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } else {
      setTaskId(null);
      setErrorMsg("Sound FX generation failed. Please try again.");
    }
  // queryClient is stable, safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sfxPollData]);

  const handleGenerate = async () => {
    const text = prompt.trim() || lyrics.trim();
    if (!text || generating) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setCompletedTracks([]);
    setTaskId(null);
    setIsSfxMode(false);
    setProgress(0);

    try {
      let tid: string | null = null;

      if (tab === "Sound FX") {
        const result = await generateSound.mutateAsync({
          project_id: crypto.randomUUID(),
          prompt: text,
          audio_length: sfxLength,
        });
        tid = result.task_id ?? null;
        setIsSfxMode(true);
      } else {
        const result = await generateMusic.mutateAsync({
          project_id: crypto.randomUUID(),
          type: TAB_MUSIC_TYPE[tab],
          prompt: text,
          music_style: included.length > 0 ? included.join(", ") : undefined,
          lyrics: tab === "Song" && lyrics.trim() ? lyrics.trim() : undefined,
          make_instrumental: tab === "Music",
          vocal_only: false,
        });
        // /music/generateMusic returns an array (one entry per variation), all share the same task_id
        tid = result[0]?.task_id ?? null;
      }

      if (!tid) {
        throw new Error("Backend did not return a task_id");
      }
      setTaskId(tid);
    } catch (err: unknown) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
      setProgress(0);
      const status = (err as { status?: number })?.status;
      setErrorMsg(
        status === 402
          ? "Insufficient credits. Please upgrade your plan."
          : "Generation failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickIdea = async () => {
    const result = await quickIdea.mutateAsync(prompt.trim() || QUICK_IDEA_FALLBACK[tab]);
    setPrompt(result.prompt);
  };

  const handleEnhance = async () => {
    const text = prompt.trim();
    if (!text) return;
    const result = await enhancePrompt.mutateAsync({ prompt: text });
    setPrompt(result.prompt);
  };

  const toggleInclude = (tag: string) =>
    setIncluded((l) => (l.includes(tag) ? l.filter((t) => t !== tag) : [...l, tag]));

  const toggleExclude = (tag: string) =>
    setExcluded((l) => (l.includes(tag) ? l.filter((t) => t !== tag) : [...l, tag]));

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">
      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <GenerateHeader tab={tab} onTabChange={setTab} />

        <div
          className="flex-1 overflow-y-auto flex flex-col w-full"
          style={{ padding: "20px max(24px, 4%) 24px" }}
        >
          {/* Error */}
          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-[13px]">
              {errorMsg}
            </div>
          )}

          {/* Lyrics card (Song tab only) */}
          {tab === "Song" && (
            <div className="mb-4">
              <LyricsCard value={lyrics} onChange={setLyrics} />
            </div>
          )}

          {/* Generation output */}
          {(generating || generated) && (
            <div className="mb-4">
              {generating ? (
                <GeneratingCard progress={progress} tab={tab} />
              ) : (
                <div
                  className="rounded-[var(--radius-xl)] border border-[color:var(--aw-border)] overflow-hidden fade-in"
                  style={{ background: "var(--aw-card)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="p-4">
                    <div className="flex gap-[10px]">
                      {completedTracks.map((track, v) => (
                        <VariationCard key={track.id} index={v} track={track} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Prompt bar */}
          <div className="max-w-[720px] w-full mx-auto">
            <PromptBar
              tab={tab}
              prompt={prompt}
              onPromptChange={setPrompt}
              generating={generating}
              onGenerate={handleGenerate}
              onQuickIdea={handleQuickIdea}
              onEnhance={handleEnhance}
              quickIdeaLoading={quickIdea.isPending}
              enhanceLoading={enhancePrompt.isPending}
            />
            {tab === "Sound FX" && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-medium text-[color:var(--aw-text-3)] tracking-[0.07em] uppercase w-16 flex-shrink-0">
                  Length
                </span>
                <div className="flex items-center gap-[5px] flex-wrap">
                  {[5, 10, 15, 30].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSfxLength(s)}
                      className="px-3 py-[4px] rounded-[20px] text-[11px] font-medium border transition-colors duration-150 cursor-pointer"
                      style={{
                        background: sfxLength === s ? "rgba(232,160,85,0.15)" : "rgba(255,255,255,0.04)",
                        borderColor: sfxLength === s ? "var(--aw-accent)" : "var(--aw-border)",
                        color: sfxLength === s ? "var(--aw-accent)" : "var(--aw-text-2)",
                      }}
                    >
                      {s}s
                    </button>
                  ))}
                  <div
                    className="flex items-center gap-1 px-2 py-[3px] rounded-[20px] border"
                    style={{
                      background: ![5, 10, 15, 30].includes(sfxLength) ? "rgba(232,160,85,0.15)" : "rgba(255,255,255,0.04)",
                      borderColor: ![5, 10, 15, 30].includes(sfxLength) ? "var(--aw-accent)" : "var(--aw-border)",
                    }}
                  >
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={![5, 10, 15, 30].includes(sfxLength) ? sfxLength : ""}
                      placeholder="Custom"
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1 && v <= 300) setSfxLength(v);
                      }}
                      className="w-[52px] bg-transparent border-none outline-none text-[11px] text-center"
                      style={{ color: ![5, 10, 15, 30].includes(sfxLength) ? "var(--aw-accent)" : "var(--aw-text-3)" }}
                    />
                    <span className="text-[10px] text-[color:var(--aw-text-3)]">s</span>
                  </div>
                </div>
              </div>
            )}
            <StylePicker
              tab={tab}
              included={included}
              excluded={excluded}
              onToggleInclude={toggleInclude}
              onToggleExclude={toggleExclude}
            />
          </div>

          <div className="h-5" />
        </div>
      </div>

      <HistoryPanel />
    </div>
  );
}
