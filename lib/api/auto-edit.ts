import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { audioSourceFormData } from "@/lib/audio-source-form-data";

export interface Segment {
  start: number;
  end: number;
  energy: number;
  label: string;
}

export interface CandidateWindow {
  index: number;
  start: number;
  end: number;
  duration: number;
  duration_score: number;
  energy_score: number;
  structural_score: number;
  spectral_quality_score: number;
  total_score: number;
  segment_labels: string[];
  needs_loop: boolean;
}

export interface SuggestResponse {
  target_duration: number | null;
  energy_preference: string | null;
  strictness: number;
  crossfade_beats: number;
  explanation: string;
}

export interface AnalyzeResponse {
  bpm: number;
  duration: number;
  beat_times: number[];
  downbeat_times: number[];
  segments: Segment[];
  candidates?: CandidateWindow[];
  used_beat_fallback: boolean;
}

export interface PreviewResponse {
  bpm: number;
  source_duration: number;
  segments: Segment[];
  candidates: CandidateWindow[];
  chosen_index: number;
  window_start: number;
  window_end: number;
  window_duration: number;
  agent_reasoning: string;
  user_description: string;
  used_fallback: boolean;
  needs_loop: boolean;
}

export interface TrimResponse {
  audio_b64: string;
  audio_format: string;
  chosen_index: number;
  window_start: number;
  window_end: number;
  actual_duration: number;
  bpm: number;
  beat_deviation_ms: number;
  was_looped: boolean;
  used_fallback: boolean;
  agent_reasoning: string;
  user_description: string;
  quality_warning: string | null;
  candidates: CandidateWindow[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleApiError(res: Response) {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 422) {
    const errData = await res.json().catch(() => null);
    const detail = errData?.detail;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail) || "Validation error"
    );
  }

  if (!res.ok) {
    throw new Error("Something went wrong");
  }
}

export function useSuggest() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      description,
      source_duration,
    }: {
      description: string;
      source_duration?: number;
    }) => {
      const fd = new FormData();
      fd.append("description", description);
      if (source_duration !== undefined) fd.append("source_duration", source_duration.toString());

      const token = await getToken();
      const res = await fetch(`${API_BASE}/auto-edit/suggest`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      // /suggest never throws on LLM failure; only handle HTTP errors
      await handleApiError(res);
      return res.json() as Promise<SuggestResponse>;
    },
  });
}

export function useAnalyze() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source,
      target_duration,
      energy_preference,
      strictness,
    }: {
      source: File | string;
      target_duration?: number;
      energy_preference?: string | null;
      strictness?: number;
    }) => {
      const fd = audioSourceFormData(source);
      if (target_duration !== undefined) fd.append("target_duration", target_duration.toString());
      if (energy_preference) fd.append("energy_preference", energy_preference);
      if (strictness !== undefined) fd.append("strictness", strictness.toString());

      const token = await getToken();
      const res = await fetch(`${API_BASE}/auto-edit/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      await handleApiError(res);
      return res.json() as Promise<AnalyzeResponse>;
    },
  });
}

export function usePreview() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source,
      target_duration,
      energy_preference,
      strictness,
      user_description,
    }: {
      source: File | string;
      target_duration: number;
      energy_preference?: string | null;
      strictness?: number;
      user_description?: string;
    }) => {
      const fd = audioSourceFormData(source);
      fd.append("target_duration", target_duration.toString());
      if (energy_preference) fd.append("energy_preference", energy_preference);
      if (strictness !== undefined) fd.append("strictness", strictness.toString());
      if (user_description) fd.append("user_description", user_description);

      const token = await getToken();
      const res = await fetch(`${API_BASE}/auto-edit/preview`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      await handleApiError(res);
      return res.json() as Promise<PreviewResponse>;
    },
  });
}

export function useTrim() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source,
      target_duration,
      energy_preference,
      output_format = "mp3",
      chosen_window_index,
      strictness,
      crossfade_beats,
      user_description,
    }: {
      source: File | string;
      target_duration: number;
      energy_preference?: string | null;
      output_format?: "mp3" | "wav";
      chosen_window_index?: number;
      strictness?: number;
      crossfade_beats?: number;
      user_description?: string;
    }) => {
      const fd = audioSourceFormData(source);
      fd.append("target_duration", target_duration.toString());
      if (energy_preference) fd.append("energy_preference", energy_preference);
      fd.append("output_format", output_format);
      if (chosen_window_index !== undefined)
        fd.append("chosen_window_index", chosen_window_index.toString());
      if (strictness !== undefined) fd.append("strictness", strictness.toString());
      if (crossfade_beats !== undefined) fd.append("crossfade_beats", crossfade_beats.toString());
      if (user_description) fd.append("user_description", user_description);

      const token = await getToken();
      const res = await fetch(`${API_BASE}/auto-edit/trim`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      await handleApiError(res);
      return res.json() as Promise<TrimResponse>;
    },
  });
}
