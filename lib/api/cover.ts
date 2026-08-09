"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────

/** POST /cover/ returns the same MusicResponse rows as every other generator */
export type CoverRecord = components["schemas"]["MusicResponse"];

export interface CoverCharacterLimits {
  style: number;
  title: number;
  prompt: number;
}

/** One row of the backend's required-field matrix. `null` = "either value" */
export interface CoverRule {
  custom_mode: boolean | null;
  instrumental: boolean | null;
  required: string[];
  forbidden: string[];
  notes: string;
}

export interface CoverOptionsResponse {
  models: string[];
  default_model: string;
  character_limits: Record<string, CoverCharacterLimits>;
  non_custom_prompt_max: number;
  max_upload_seconds: number;
  allowed_extensions: string[];
  rules: CoverRule[];
}

export interface CoverTrack {
  conversion_id: string | null;
  status: "QUEUED" | "IN_QUEUE" | "COMPLETED" | "FAILED" | string;
  title: string | null;
  audio_url: string | null;
  duration: number | null;
  album_cover_path: string | null;
  generated_lyrics: string | null;
  error_message: string | null;
}

export interface CoverPollResponse {
  task_id: string;
  user_id: string;
  tracks: CoverTrack[];
}

export type VocalGender = "m" | "f";

export interface CoverFormValues {
  projectId: string;
  file: File;
  model: string;
  customMode: boolean;
  instrumental: boolean;
  /** Non-custom: description of the cover. Custom + vocals: lyrics, sung verbatim. */
  prompt?: string;
  style?: string;
  title?: string;
  /** Custom-mode only — sending any of these with custom_mode=false is a 422 */
  negativeTags?: string;
  vocalGender?: VocalGender | "";
  styleWeight?: number | null;
  weirdnessConstraint?: number | null;
  audioWeight?: number | null;
}

// ── Errors ─────────────────────────────────────────────────────────────────────

/** Carries the HTTP status so the UI can map 402 / 413 / 422 / 503 to copy. */
export class CoverError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: string[] = [],
  ) {
    super(message);
    this.name = "CoverError";
  }
}

interface ValidationItem {
  loc?: (string | number)[];
  msg?: string;
}

async function toCoverError(res: Response): Promise<CoverError> {
  const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  const detail = body?.detail;

  // FastAPI 422 — detail is an array that names the offending fields
  if (Array.isArray(detail)) {
    const items = detail as ValidationItem[];
    const fields = items
      .map((d) => (d.loc ?? []).filter((p) => p !== "body").join("."))
      .filter(Boolean);
    const msg = items
      .map((d, i) => (fields[i] ? `${fields[i]}: ${d.msg ?? "invalid"}` : d.msg ?? "invalid"))
      .join(" · ");
    return new CoverError(res.status, msg || "Invalid field combination", fields);
  }

  if (typeof detail === "string") return new CoverError(res.status, detail);
  return new CoverError(res.status, `${res.status} ${res.statusText}`);
}

export interface CoverErrorCopy {
  title: string;
  detail: string | null;
  /** True when the fix is buying credits — the UI links to /subscription */
  upsell: boolean;
}

/** Maps a failed cover request to the copy the spec calls for. */
export function coverErrorCopy(err: unknown): CoverErrorCopy {
  const status = err instanceof CoverError ? err.status : 0;
  const message = err instanceof Error ? err.message : "Something went wrong";

  switch (status) {
    case 402:
      return { title: "Not enough credits", detail: "You weren't charged. Top up to run this cover.", upsell: true };
    case 413:
      return { title: "File too large", detail: "Max 100 MB — trim or compress the track and try again.", upsell: false };
    case 422:
      return { title: "Check your settings", detail: message, upsell: false };
    case 503:
      return { title: "Queue unavailable", detail: "Try again shortly — your credits were refunded.", upsell: false };
    default:
      return { title: "Cover failed", detail: message, upsell: false };
  }
}

// ── Query: form options (model enum, char limits, required-field matrix) ───────

/**
 * GET /cover/options — drives the whole form so it cannot produce a 422.
 * Static server config, so it outlives the global 30 s staleTime.
 */
export function useCoverOptions() {
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["cover-options"],
    queryFn: () => api.get<CoverOptionsResponse>("/cover/options"),
    enabled: isLoaded && !!isSignedIn,
    staleTime: 10 * 60_000,
    gcTime: 15 * 60_000,
  });
}

// ── Mutation: submit a cover job ───────────────────────────────────────────────

/**
 * POST /cover/ (multipart). Fields are gated on the two switches so a stale
 * value from a previous mode can never reach the backend and trip a 422.
 */
export function useCreateCover() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (v: CoverFormValues): Promise<CoverRecord[]> => {
      const token = await getToken();
      if (!token) throw new CoverError(401, "Not authenticated");

      const form = new FormData();
      form.append("project_id", v.projectId);
      form.append("file", v.file);
      form.append("model", v.model);
      form.append("custom_mode", String(v.customMode));
      form.append("instrumental", String(v.instrumental));

      if (v.customMode) {
        if (v.style) form.append("style", v.style);
        if (v.title) form.append("title", v.title);
        // In custom mode `prompt` is the lyric sheet — forbidden when instrumental
        if (!v.instrumental && v.prompt) form.append("prompt", v.prompt);
        if (v.negativeTags) form.append("negative_tags", v.negativeTags);
        if (v.vocalGender) form.append("vocal_gender", v.vocalGender);
        if (v.styleWeight != null) form.append("style_weight", String(v.styleWeight));
        if (v.weirdnessConstraint != null) form.append("weirdness_constraint", String(v.weirdnessConstraint));
        if (v.audioWeight != null) form.append("audio_weight", String(v.audioWeight));
      } else {
        // Non-custom mode accepts nothing but the description
        if (v.prompt) form.append("prompt", v.prompt);
      }

      const res = await fetch(`${API_BASE}/cover/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw await toCoverError(res);
      return res.json() as Promise<CoverRecord[]>;
    },
    // Tokens were just spent — refresh the sidebar balance
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

// ── Query: poll for the finished cover ─────────────────────────────────────────

/**
 * Cover results land in `music_metadata` like every other generation, so this
 * reuses `/download/`. 10 s interval, matching every other poll in the app.
 */
export function useCoverPoll(taskId: string | null) {
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["cover-poll", taskId],
    queryFn: () => api.get<CoverPollResponse>(`/download/?task_id=${taskId}`),
    enabled: isLoaded && !!isSignedIn && !!taskId,
    refetchInterval: (query) => {
      const tracks = query.state.data?.tracks ?? [];
      const allDone =
        tracks.length > 0 &&
        tracks.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
      return allDone ? false : 10_000;
    },
    staleTime: 0,
  });
}
