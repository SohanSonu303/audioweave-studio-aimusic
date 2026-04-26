import { create } from "zustand";
import type { Segment, CandidateWindow } from "@/lib/api/auto-edit";
import type { PlatformProfile } from "@/lib/api/master";

export type OperationType =
  | "cut" | "fade" | "loop" | "split" | "mix" | "overlay" | "eq"
  | "ai_warmth" | "style_enhance" | "auto_trim" | "master" | "reference_match" | "podcast";

export type SourceState = { kind: "file"; file: File } | { kind: "url"; url: string } | null;

export interface OpResult {
  blobUrl: string;
  audioFormat: "mp3" | "wav";
  audioB64: string;
  op: OperationType;
  report?: Record<string, unknown>;
  // auto-trim extras
  actualDuration?: number;
  bpm?: number;
  beatDeviationMs?: number;
  wasLooped?: boolean;
  windowStart?: number;
  windowEnd?: number;
  chosenIndex?: number;
  candidates?: CandidateWindow[];
  agentReasoning?: string | null;
  qualityWarning?: string | null;
}

interface EditStore {
  selectedOperation: OperationType;

  // Per-op isolated sources (reset on op change)
  primarySource: SourceState;
  secondarySource: SourceState;
  sourceDurationSec: number | null;

  // Processing overlay
  isProcessing: boolean;
  processingMsg: string;

  // Active result (any op)
  result: OpResult | null;
  abMode: "original" | "processed";

  // Auto-trim analysis/preview state (for waveform overlays + candidates)
  analysis: {
    bpm: number;
    duration: number;
    segments: Segment[];
    candidates?: CandidateWindow[];
    used_beat_fallback: boolean;
  } | null;
  preview: {
    chosenIndex: number;
    windowStart: number;
    windowEnd: number;
    reasoning: string;
  } | null;

  // Master platforms (fetched once, persist across op changes)
  masterPlatforms: PlatformProfile[] | null;
  masterSelectedPlatform: string | null;
  masterOutputFormat: "mp3" | "wav";

  projectId: string;

  // Actions
  setSelectedOperation: (op: OperationType) => void;
  setPrimarySource: (source: SourceState) => void;
  setSecondarySource: (source: SourceState) => void;
  setSourceDuration: (duration: number) => void;
  setProcessing: (loading: boolean, msg?: string) => void;
  setResult: (result: OpResult | null) => void;
  setAbMode: (mode: "original" | "processed") => void;
  toggleAbMode: () => void;
  setAnalysis: (analysis: EditStore["analysis"]) => void;
  setPreview: (preview: EditStore["preview"]) => void;
  setMasterPlatforms: (platforms: PlatformProfile[]) => void;
  setMasterSelectedPlatform: (id: string | null) => void;
  setMasterOutputFormat: (format: "mp3" | "wav") => void;
  resetAll: () => void;
}

function newProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `edit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useEditStore = create<EditStore>((set) => ({
  selectedOperation: "auto_trim",

  primarySource: null,
  secondarySource: null,
  sourceDurationSec: null,

  isProcessing: false,
  processingMsg: "Processing…",

  result: null,
  abMode: "original",

  analysis: null,
  preview: null,

  masterPlatforms: null,
  masterSelectedPlatform: null,
  masterOutputFormat: "mp3",

  projectId: newProjectId(),

  setSelectedOperation: (op) =>
    set({
      selectedOperation: op,
      primarySource: null,
      secondarySource: null,
      sourceDurationSec: null,
      result: null,
      analysis: null,
      preview: null,
      isProcessing: false,
      abMode: "original",
      projectId: newProjectId(),
    }),

  setPrimarySource: (source) =>
    set({ primarySource: source, result: null, analysis: null, preview: null, abMode: "original" }),

  setSecondarySource: (source) => set({ secondarySource: source }),

  setSourceDuration: (duration) => set({ sourceDurationSec: duration }),

  setProcessing: (loading, msg = "Processing…") =>
    set({ isProcessing: loading, processingMsg: msg }),

  setResult: (result) =>
    set({ result, abMode: result ? "processed" : "original" }),

  setAbMode: (mode) => set({ abMode: mode }),

  toggleAbMode: () =>
    set((state) => ({
      abMode: state.abMode === "processed" ? "original" : "processed",
    })),

  setAnalysis: (analysis) => set({ analysis }),
  setPreview: (preview) => set({ preview }),

  setMasterPlatforms: (platforms) => set({ masterPlatforms: platforms }),
  setMasterSelectedPlatform: (id) => set({ masterSelectedPlatform: id }),
  setMasterOutputFormat: (format) => set({ masterOutputFormat: format }),

  resetAll: () =>
    set({
      primarySource: null,
      secondarySource: null,
      sourceDurationSec: null,
      result: null,
      analysis: null,
      preview: null,
      isProcessing: false,
      abMode: "original",
      projectId: newProjectId(),
    }),
}));
