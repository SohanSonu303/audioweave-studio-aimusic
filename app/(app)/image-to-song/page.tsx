"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { UploadBox } from "@/components/imageToSong/UploadBox";
import { ControlsPanel } from "@/components/imageToSong/ControlsPanel";
import { StatusTracker } from "@/components/imageToSong/StatusTracker";
import { AudioPlayer } from "@/components/imageToSong/AudioPlayer";
import { Icon } from "@/components/ui/icon";

import { useImageToSong, useImageToSongPoll } from "@/lib/api/image-to-song";
import type { MusicResponse } from "@/lib/api/image-to-song";

// ── Validation ──────────────────────────────────────────────────────────────────

function validate(imageFile: File | null, imageUrl: string, prompt: string, lyrics: string): string | null {
  const hasFile = !!imageFile;
  const hasUrl = imageUrl.trim().length > 0;
  if (!hasFile && !hasUrl) return "Please provide an image (upload or URL).";
  if (hasFile && hasUrl) return "Provide only one image source — either upload or URL, not both.";
  if (prompt.length > 300) return "Prompt must be 300 characters or fewer.";
  if (lyrics.length > 3000) return "Lyrics must be 3000 characters or fewer.";
  return null;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ImageToSongPage() {
  const queryClient = useQueryClient();
  const resultRef = useRef<HTMLDivElement>(null);

  // Image input
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  // Controls
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [negativeTags, setNegativeTags] = useState("");
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [vocalOnly, setVocalOnly] = useState(false);
  const [bpm, setBpm] = useState("");
  const [musicKey, setMusicKey] = useState("");
  const [voiceId, setVoiceId] = useState("");

  // Async state
  const [taskId, setTaskId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completedTracks, setCompletedTracks] = useState<MusicResponse[]>([]);
  const [fakeProgress, setFakeProgress] = useState(0);

  // API hooks
  const mutation = useImageToSong();
  const { data: pollData } = useImageToSongPoll(taskId);

  // ── Derive UI status ───────────────────────────────────────────────────────
  const pollTracks = pollData?.tracks ?? [];
  const allDone = pollTracks.length > 0 && pollTracks.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
  const anyFailed = pollTracks.length > 0 && pollTracks.every((t) => t.status === "FAILED");

  type UIStatus = "idle" | "submitting" | "queued" | "processing" | "completed" | "failed";
  let uiStatus: UIStatus = "idle";
  if (mutation.isPending) uiStatus = "submitting";
  else if (mutation.isError) uiStatus = "failed";
  else if (taskId && !allDone) {
    const first = pollTracks[0];
    uiStatus = first?.status === "processing" ? "processing" : "queued";
  } else if (taskId && allDone && !anyFailed) uiStatus = "completed";
  else if (taskId && allDone && anyFailed) uiStatus = "failed";

  const errorMsg =
    mutation.isError ? (mutation.error as Error).message
    : anyFailed ? (pollTracks[0] as { error_message?: string })?.error_message ?? "Generation failed"
    : null;

  // ── Fake progress for processing state ────────────────────────────────────
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (uiStatus === "processing") {
      iv = setInterval(() => setFakeProgress((p) => (p >= 90 ? p : p + Math.random() * 3)), 800);
    } else if (uiStatus === "completed") {
      setFakeProgress(100);
    } else {
      setFakeProgress(0);
    }
    return () => clearInterval(iv);
  }, [uiStatus]);

  // ── Save completed tracks + auto-scroll + invalidate library ──────────────
  useEffect(() => {
    if (uiStatus === "completed" && completedTracks.length === 0) {
      setCompletedTracks(pollTracks.filter((t) => t.status === "COMPLETED"));
      queryClient.invalidateQueries({ queryKey: ["library"] });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [uiStatus, pollTracks, completedTracks.length, queryClient]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const err = validate(imageFile, imageUrl, prompt, lyrics);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setCompletedTracks([]);
    setTaskId(null);
    setFakeProgress(0);

    try {
      const records = await mutation.mutateAsync({
        projectId: "default-project",
        imageFile: imageFile ?? undefined,
        imageUrl: imageUrl.trim() || undefined,
        prompt: prompt.trim() || undefined,
        lyrics: lyrics.trim() || undefined,
        negativeTags: negativeTags.trim() || undefined,
        makeInstrumental,
        vocalOnly,
        bpm: bpm ? parseInt(bpm, 10) : undefined,
        key: musicKey || undefined,
        voiceId: voiceId.trim() || undefined,
      });
      const tid = records[0]?.task_id;
      if (tid) setTaskId(tid);
    } catch {
      // error handled via mutation.isError
    }
  }, [imageFile, imageUrl, prompt, lyrics, negativeTags, makeInstrumental, vocalOnly, bpm, musicKey, voiceId, mutation]);

  const handleRetry = () => {
    mutation.reset();
    setTaskId(null);
    setCompletedTracks([]);
  };

  const isSubmitting = mutation.isPending;
  const hasResult = completedTracks.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-7 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "var(--aw-border)" }}
      >
        <div>
          <h1 className="text-[18px] font-semibold text-[color:var(--aw-text)] tracking-[-0.02em]">
            Image to Song
          </h1>
          <p className="text-[12px] text-[color:var(--aw-text-3)] mt-0.5">
            Upload or link an image and let AI compose a song inspired by it.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[11px]"
          style={{ background: "rgba(232,160,85,0.08)", border: "1px solid rgba(232,160,85,0.15)", color: "var(--aw-accent)" }}
        >
          <Icon d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" size={13} color="var(--aw-accent)" />
          AI Powered
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left col: Image Upload */}
            <div className="space-y-6">
              <div
                className="rounded-[16px] p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <h2 className="text-[13px] font-semibold text-[color:var(--aw-text)] mb-4">
                  1. Choose Image
                </h2>
                <UploadBox
                  file={imageFile}
                  imageUrl={imageUrl}
                  onFileChange={(f) => { setImageFile(f); setValidationError(null); }}
                  onUrlChange={(u) => { setImageUrl(u); setValidationError(null); }}
                  error={validationError && (!imageFile && !imageUrl) ? validationError : null}
                />
              </div>

              {/* Generate button (visible on mobile inside left col) */}
              <div className="lg:hidden">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!!taskId && !allDone)}
                  className="w-full py-3.5 rounded-[12px] text-[14px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: "var(--aw-accent)",
                    color: "black",
                    boxShadow: "0 4px 20px rgba(232,160,85,0.35)",
                  }}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-black/40 border-black rounded-full animate-spin" />
                  ) : (
                    <Icon d="M5 3l14 9-14 9V3z" size={14} fill="black" color="black" />
                  )}
                  {isSubmitting ? "Generating…" : "Generate Song"}
                </button>
              </div>
            </div>

            {/* Right col: Controls */}
            <div className="space-y-5">
              <div
                className="rounded-[16px] p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <h2 className="text-[13px] font-semibold text-[color:var(--aw-text)] mb-4">
                  2. Tune the Sound
                </h2>
                <ControlsPanel
                  prompt={prompt} lyrics={lyrics} negativeTags={negativeTags}
                  makeInstrumental={makeInstrumental} vocalOnly={vocalOnly}
                  bpm={bpm} musicKey={musicKey} voiceId={voiceId}
                  onPromptChange={setPrompt} onLyricsChange={setLyrics}
                  onNegativeTagsChange={setNegativeTags}
                  onMakeInstrumentalChange={setMakeInstrumental}
                  onVocalOnlyChange={setVocalOnly}
                  onBpmChange={setBpm} onKeyChange={setMusicKey}
                  onVoiceIdChange={setVoiceId}
                />
              </div>

              {/* Generate button — desktop */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!!taskId && !allDone)}
                className="hidden lg:flex w-full py-3.5 rounded-[12px] text-[14px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer items-center justify-center gap-2"
                style={{
                  background: "var(--aw-accent)",
                  color: "black",
                  boxShadow: "0 4px 20px rgba(232,160,85,0.35)",
                }}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-t-black/40 border-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon d="M5 3l14 9-14 9V3z" size={14} fill="black" color="black" />
                    Generate Song from Image
                  </>
                )}
              </button>

              {/* Validation */}
              {validationError && (
                <p className="text-[12px] text-center" style={{ color: "rgba(255,130,130,0.9)" }}>
                  {validationError}
                </p>
              )}
            </div>
          </div>

          {/* Status tracker */}
          {uiStatus !== "idle" && (
            <div className="mt-6">
              <StatusTracker
                status={uiStatus}
                error={errorMsg}
                progress={fakeProgress}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Result */}
          {hasResult && (
            <div className="mt-6" ref={resultRef}>
              <div className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--aw-text-3)" }}>
                Your Generated Song
              </div>
              <AudioPlayer tracks={completedTracks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
