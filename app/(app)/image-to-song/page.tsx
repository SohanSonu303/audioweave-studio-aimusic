"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Image as ImageIcon, Send, Wand2 } from "lucide-react";

import { UploadBox } from "@/components/imageToSong/UploadBox";
import { ControlsPanel } from "@/components/imageToSong/ControlsPanel";
import { StatusTracker } from "@/components/imageToSong/StatusTracker";
import { AudioPlayer } from "@/components/imageToSong/AudioPlayer";

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
    <div className="flex flex-1 min-w-0 overflow-hidden bg-[color:var(--aw-bg)]">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <div className="max-w-[840px] mx-auto w-full flex flex-col gap-12">
            
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-aw-accent/10 border border-aw-accent/20 flex items-center justify-center">
                  <ImageIcon className="text-aw-accent" size={20} />
                </div>
                <h1 className="text-[32px] font-display font-light text-aw-text tracking-tight">
                  Image to Song
                </h1>
              </div>
              <p className="text-[14px] text-aw-text-2 leading-relaxed max-w-[600px]">
                Generate unique musical compositions inspired by visual art. Our AI analyzes the mood, colors, and scene of your image to compose a perfectly matched track.
              </p>
            </div>

            {/* Upload Section */}
            <div className="w-full">
               <UploadBox
                 file={imageFile}
                 imageUrl={imageUrl}
                 onFileChange={(f) => { setImageFile(f); setValidationError(null); }}
                 onUrlChange={(u) => { setImageUrl(u); setValidationError(null); }}
                 error={validationError && (!imageFile && !imageUrl) ? validationError : null}
               />
            </div>

            {/* Result Section */}
            {hasResult && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700" ref={resultRef}>
                 <div className="flex items-center gap-2">
                    <Wand2 size={14} className="text-aw-accent" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-aw-text-3">AI GENERATED COMPOSITION</span>
                 </div>
                 <AudioPlayer tracks={completedTracks} />
              </div>
            )}
          </div>
        </div>

        {/* Floating Status Tracker */}
        {uiStatus !== "idle" && uiStatus !== "completed" && (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
              <StatusTracker
                status={uiStatus}
                error={errorMsg}
                progress={fakeProgress}
                onRetry={handleRetry}
              />
           </div>
        )}
      </main>

      {/* Right side Track Inspector (Mirroring Edit UI) */}
      <aside className="w-[340px] border-l border-aw-border bg-[#080808] flex flex-col shrink-0 overflow-hidden relative">
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-aw-border bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-aw-text">Track Inspector</h2>
            <div className="w-2 h-2 rounded-full bg-aw-accent animate-pulse shadow-[0_0_8px_rgba(232,160,85,0.6)]" />
          </div>
          <p className="text-[10px] text-aw-text-3 mt-1.5 font-medium tracking-[0.12em] uppercase">
            AI GENERATION CONFIG
          </p>
        </div>

        {/* Sidebar Controls */}
        <div className="flex-1 overflow-y-auto px-6 py-7 custom-scrollbar">
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

        {/* Sidebar Footer — Action Button */}
        <div className="p-6 border-t border-aw-border bg-[#050505]">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!!taskId && !allDone)}
            className="w-full py-4 rounded-md bg-aw-accent text-[#1a0c00] text-[14px] font-bold flex items-center justify-center gap-3 hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 0 20px rgba(232,160,85,0.2)" }}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSubmitting ? "Generating Composition..." : "Generate Song"}
          </button>
          
          {validationError && (
             <p className="text-[11px] text-aw-red mt-3 text-center font-medium animate-pulse">
               {validationError}
             </p>
          )}
        </div>
      </aside>
    </div>
  );
}
