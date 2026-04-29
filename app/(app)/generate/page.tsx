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
import { useGenerateMusic, useGenerateSound } from "@/lib/api/generations";
import { useDownloadPoll } from "@/lib/api/library";
import { useQuickIdea, useEnhancePrompt } from "@/lib/api/prompt";
import type { TrackItem } from "@/lib/api/library";
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

export default function GeneratePage() {
  const [tab, setTab] = useState<GenTab>("Music");
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [included, setIncluded] = useState(["Cinematic", "Orchestral"]);
  const [excluded, setExcluded] = useState(["Electronic"]);

  // Generation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedTracks, setCompletedTracks] = useState<TrackItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryClient = useQueryClient();
  const generateMusic = useGenerateMusic();
  const generateSound = useGenerateSound();
  const { data: pollData } = useDownloadPoll(taskId);
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

  // Check poll data for completion — backend may return results in tracks or sounds
  useEffect(() => {
    if (!pollData) return;
    const allItems = [...(pollData.tracks ?? []), ...(pollData.sounds ?? [])];
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
  }, [pollData]);

  const handleGenerate = async () => {
    const text = prompt.trim() || lyrics.trim();
    if (!text) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setCompletedTracks([]);
    setTaskId(null);
    setProgress(0);

    try {
      let tid: string | null = null;

      if (tab === "Sound FX") {
        const result = await generateSound.mutateAsync({
          project_id: crypto.randomUUID(),
          prompt: text,
        });
        tid = result.task_id ?? null;
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
