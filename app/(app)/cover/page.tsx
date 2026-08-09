"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Disc3, Send, Wand2, Zap } from "lucide-react";

import { CoverUploadBox, MAX_COVER_BYTES } from "@/components/cover/cover-upload-box";
import { CoverConfigPanel, type CoverConfigValues } from "@/components/cover/cover-config-panel";
import { CoverStatusTracker, type CoverUIStatus } from "@/components/cover/cover-status-tracker";
import { CoverResultPlayer } from "@/components/cover/cover-result-player";

import {
  useCoverOptions,
  useCreateCover,
  useCoverPoll,
  coverErrorCopy,
  type CoverCharacterLimits,
  type CoverTrack,
} from "@/lib/api/cover";
import { useMe } from "@/lib/api/auth";
import { TOKEN_COST_COVER } from "@/lib/constants";

// Used until /cover/options resolves, and for models missing from the payload
const FALLBACK_LIMITS: CoverCharacterLimits = { style: 200, title: 80, prompt: 3000 };
const FALLBACK_MAX_SECONDS = 480;
const FALLBACK_NON_CUSTOM_PROMPT_MAX = 500;

const INITIAL_CONFIG: CoverConfigValues = {
  model: "",
  customMode: false,
  instrumental: false,
  prompt: "",
  style: "",
  title: "",
  negativeTags: "",
  vocalGender: "",
  styleWeight: null,
  weirdnessConstraint: null,
  audioWeight: null,
};

// ── Validation — mirrors the backend's required-field matrix ────────────────────

interface ValidateArgs {
  file: File | null;
  fileDuration: number | null;
  config: CoverConfigValues;
  limits: CoverCharacterLimits;
  nonCustomPromptMax: number;
  maxSeconds: number;
  allowedExtensions: string[];
}

function validate({
  file,
  fileDuration,
  config,
  limits,
  nonCustomPromptMax,
  maxSeconds,
  allowedExtensions,
}: ValidateArgs): string | null {
  if (!file) return "Upload the track you want to cover.";

  const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return `Unsupported format — use ${allowedExtensions.join(", ").toUpperCase()}.`;
  }
  if (file.size > MAX_COVER_BYTES) return "File is too large — max 100 MB.";
  if (fileDuration != null && fileDuration > maxSeconds) {
    return `Track is too long — max ${Math.round(maxSeconds / 60)} minutes.`;
  }

  const prompt = config.prompt.trim();

  if (!config.customMode) {
    if (!prompt) return "Describe the cover you want.";
    if (prompt.length > nonCustomPromptMax) {
      return `Description must be ${nonCustomPromptMax} characters or fewer.`;
    }
    return null;
  }

  if (!config.style.trim()) return "Style is required in custom mode.";
  if (config.style.length > limits.style) return `Style must be ${limits.style} characters or fewer.`;
  if (!config.title.trim()) return "Title is required in custom mode.";
  if (config.title.length > limits.title) return `Title must be ${limits.title} characters or fewer.`;

  if (!config.instrumental) {
    if (!prompt) return "Lyrics are required in custom mode with vocals.";
    if (prompt.length > limits.prompt) return `Lyrics must be ${limits.prompt} characters or fewer.`;
  }

  return null;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CoverPage() {
  const queryClient = useQueryClient();
  const resultRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [config, setConfig] = useState<CoverConfigValues>(INITIAL_CONFIG);

  const [taskId, setTaskId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tickProgress, setTickProgress] = useState(0);

  // Guards the one-shot completion side effects per task
  const settledTaskRef = useRef<string | null>(null);

  const { data: options, isLoading: optionsLoading } = useCoverOptions();
  const { data: me } = useMe();
  const mutation = useCreateCover();
  const { data: pollData } = useCoverPoll(taskId);

  // ── Options-derived constraints ─────────────────────────────────────────────
  const models = options?.models ?? [];
  const model = config.model || options?.default_model || "";
  const limits = options?.character_limits?.[model] ?? FALLBACK_LIMITS;
  const nonCustomPromptMax = options?.non_custom_prompt_max ?? FALLBACK_NON_CUSTOM_PROMPT_MAX;
  const maxSeconds = options?.max_upload_seconds ?? FALLBACK_MAX_SECONDS;
  const allowedExtensions = useMemo(() => options?.allowed_extensions ?? [], [options]);

  const handleConfigChange = useCallback(
    <K extends keyof CoverConfigValues>(key: K, value: CoverConfigValues[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setValidationError(null);
    },
    [],
  );

  const handleFileChange = useCallback((f: File | null) => {
    setFile(f);
    setValidationError(null);
  }, []);

  const handleDurationChange = useCallback((d: number | null) => setFileDuration(d), []);

  // ── Derive UI status ───────────────────────────────────────────────────────
  const pollTracks = useMemo<CoverTrack[]>(() => pollData?.tracks ?? [], [pollData]);
  const allDone =
    pollTracks.length > 0 &&
    pollTracks.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
  const allFailed = pollTracks.length > 0 && pollTracks.every((t) => t.status === "FAILED");

  let uiStatus: CoverUIStatus = "idle";
  if (mutation.isPending) uiStatus = "submitting";
  else if (mutation.isError) uiStatus = "failed";
  else if (taskId && !allDone) {
    uiStatus = pollTracks[0]?.status === "IN_QUEUE" ? "processing" : "queued";
  } else if (taskId && allDone) {
    uiStatus = allFailed ? "failed" : "completed";
  }

  const errorCopy = useMemo(() => {
    if (mutation.isError) return coverErrorCopy(mutation.error);
    if (allFailed) {
      return {
        title: "Cover failed",
        detail: pollTracks[0]?.error_message ?? "The model could not finish this cover.",
        upsell: false,
      };
    }
    return null;
  }, [mutation.isError, mutation.error, allFailed, pollTracks]);

  // Results are derived, not stored — polling stops on completion but the
  // cached response stays, and clearing taskId empties this on its own.
  const completedTracks = useMemo(
    () => (allDone && !allFailed ? pollTracks.filter((t) => t.status === "COMPLETED") : []),
    [allDone, allFailed, pollTracks],
  );

  // ── Fake progress while the model works ───────────────────────────────────
  useEffect(() => {
    if (uiStatus !== "processing") return;
    const iv = setInterval(
      () => setTickProgress((p) => (p >= 90 ? p : p + Math.random() * 3)),
      800,
    );
    return () => clearInterval(iv);
  }, [uiStatus]);

  const progress = uiStatus === "completed" ? 100 : uiStatus === "processing" ? tickProgress : 0;

  // ── Refresh library + scroll to the result, once per task ─────────────────
  useEffect(() => {
    if (!taskId || !allDone || settledTaskRef.current === taskId) return;
    settledTaskRef.current = taskId;
    queryClient.invalidateQueries({ queryKey: ["library"] });
    if (allFailed) return;
    const t = setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      200,
    );
    return () => clearTimeout(t);
  }, [taskId, allDone, allFailed, queryClient]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const err = validate({
      file,
      fileDuration,
      config,
      limits,
      nonCustomPromptMax,
      maxSeconds,
      allowedExtensions,
    });
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setTaskId(null);
    setTickProgress(0);
    mutation.reset();

    try {
      const records = await mutation.mutateAsync({
        projectId: "default-project",
        file: file!,
        model,
        customMode: config.customMode,
        instrumental: config.instrumental,
        prompt: config.prompt.trim() || undefined,
        style: config.style.trim() || undefined,
        title: config.title.trim() || undefined,
        negativeTags: config.negativeTags.trim() || undefined,
        vocalGender: config.vocalGender,
        styleWeight: config.styleWeight,
        weirdnessConstraint: config.weirdnessConstraint,
        audioWeight: config.audioWeight,
      });
      const tid = records[0]?.task_id;
      if (tid) setTaskId(tid);
      else setValidationError("The job was accepted but returned no task id — check the Library.");
    } catch {
      // Surfaced via mutation.isError → errorCopy
    }
  }, [
    file,
    fileDuration,
    config,
    limits,
    nonCustomPromptMax,
    maxSeconds,
    allowedExtensions,
    model,
    mutation,
  ]);

  const handleDismiss = useCallback(() => {
    mutation.reset();
    setTaskId(null);
    setTickProgress(0);
  }, [mutation]);

  const isSubmitting = mutation.isPending;
  const isBusy = isSubmitting || (!!taskId && !allDone);
  const hasResult = completedTracks.length > 0;

  const balance = me?.token_balance?.balance;
  const shortOnCredits = balance != null && balance < TOKEN_COST_COVER;

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
                  <Disc3 className="text-aw-accent" size={20} />
                </div>
                <h1 className="text-[32px] font-display font-light text-aw-text tracking-tight">
                  Cover
                </h1>
              </div>
              <p className="text-[14px] text-aw-text-2 leading-relaxed max-w-[600px]">
                Reimagine any track in a new style. Upload a song and our AI re-records it —
                keeping the melody you know while changing the genre, instrumentation, and voice.
              </p>
            </div>

            {/* Upload Section */}
            <div className="w-full">
              <CoverUploadBox
                file={file}
                duration={fileDuration}
                maxSeconds={maxSeconds}
                allowedExtensions={allowedExtensions}
                onFileChange={handleFileChange}
                onDurationChange={handleDurationChange}
                error={validationError && !file ? validationError : null}
              />
            </div>

            {/* Result Section */}
            {hasResult && (
              <div
                className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
                ref={resultRef}
              >
                <div className="flex items-center gap-2">
                  <Wand2 size={14} className="text-aw-accent" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-aw-text-3">
                    AI GENERATED COVER
                  </span>
                </div>
                <CoverResultPlayer tracks={completedTracks} />
              </div>
            )}
          </div>
        </div>

        {/* Floating Status Tracker */}
        {uiStatus !== "idle" && uiStatus !== "completed" && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <CoverStatusTracker
              status={uiStatus}
              error={errorCopy}
              progress={progress}
              onRetry={handleDismiss}
            />
          </div>
        )}
      </main>

      {/* Right side Cover Config */}
      <aside className="w-[340px] border-l border-aw-border bg-[#080808] flex flex-col shrink-0 overflow-hidden relative">
        <div className="px-6 py-5 border-b border-aw-border bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-aw-text">Cover Config</h2>
            <div className="w-2 h-2 rounded-full bg-aw-accent animate-pulse shadow-[0_0_8px_rgba(232,160,85,0.6)]" />
          </div>
          <p className="text-[10px] text-aw-text-3 mt-1.5 font-medium tracking-[0.12em] uppercase">
            AI RE-RECORDING SETUP
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7 custom-scrollbar">
          <CoverConfigPanel
            values={{ ...config, model }}
            models={models}
            limits={limits}
            nonCustomPromptMax={nonCustomPromptMax}
            loadingOptions={optionsLoading}
            onChange={handleConfigChange}
          />
        </div>

        {/* Footer — cost + action */}
        <div className="p-6 border-t border-aw-border bg-[#050505]">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-[11px] text-aw-text-2">
              <Zap size={12} className="text-aw-accent" />
              <span className="font-mono tabular-nums text-aw-text">{TOKEN_COST_COVER}</span>
              credits
            </span>
            {balance != null && (
              <span className="text-[11px] font-mono tabular-nums" style={{ color: shortOnCredits ? "var(--aw-red)" : "var(--aw-text-3)" }}>
                {balance.toLocaleString()} left
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="w-full py-4 rounded-md bg-aw-accent text-[#1a0c00] text-[14px] font-bold flex items-center justify-center gap-3 hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 0 20px rgba(232,160,85,0.2)" }}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSubmitting ? "Uploading Track..." : isBusy ? "Recording Cover..." : "Generate Cover"}
          </button>

          {shortOnCredits && (
            <p className="text-[11px] text-aw-text-3 mt-3 text-center">
              Not enough credits.{" "}
              <Link href="/subscription" className="text-aw-accent hover:underline">
                Top up
              </Link>
            </p>
          )}

          {validationError && (
            <p className="text-[11px] text-aw-red mt-3 text-center font-medium">
              {validationError}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
