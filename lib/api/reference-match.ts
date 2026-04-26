import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export interface RefMatchAnalyzeResponse {
  reference_fingerprint: { bpm: number; key: string; mode: string };
  projected_eq_bands?: { freq: number; gain_db: number; q: number }[];
  dynamics_delta_db?: number;
  stereo_width_delta?: number;
}

export interface RefMatchReport {
  eq_bands_applied: { freq: number; gain_db: number; q: number }[];
  dynamics: { ref: number; target_before: number; target_after: number };
  stereo_width: { ref: number; target_before: number; target_after: number };
  reference_fingerprint: { bpm: number; key: string; mode: string };
  target_fingerprint: { bpm: number; key: string; mode: string };
  changes_summary: string[];
}

export interface RefMatchProcessResponse {
  audio_b64: string;
  audio_format: "mp3" | "wav";
  report: RefMatchReport;
}

export interface VibePromptResponse {
  prompt: string;
  fingerprint: { bpm: number; key: string; mode: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleApiError(res: Response) {
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }
  if (res.status === 422) {
    const errData = await res.json().catch(() => null);
    const detail = errData?.detail;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail) || "Validation error"
    );
  }
  if (!res.ok) throw new Error("Something went wrong. Please try again.");
}

function appendSource(fd: FormData, source: File | string, fileKey: string, urlKey: string) {
  if (source instanceof File) fd.append(fileKey, source);
  else fd.append(urlKey, source);
}

export function useRefMatchAnalyze() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      ref, target,
    }: {
      ref: File | string;
      target?: File | string;
    }) => {
      const fd = new FormData();
      appendSource(fd, ref, "ref_file", "ref_url");
      if (target) appendSource(fd, target, "target_file", "target_url");
      const token = await getToken();
      const res = await fetch(`${API_BASE}/reference-match/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<RefMatchAnalyzeResponse>;
    },
  });
}

export function useRefMatchProcess() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      ref, target, output_format = "mp3",
    }: {
      ref: File | string;
      target: File | string;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, ref, "ref_file", "ref_url");
      appendSource(fd, target, "target_file", "target_url");
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/reference-match/process`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<RefMatchProcessResponse>;
    },
  });
}

export function useVibePrompt() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ ref }: { ref: File | string }) => {
      const fd = new FormData();
      appendSource(fd, ref, "ref_file", "ref_url");
      const token = await getToken();
      const res = await fetch(`${API_BASE}/reference-match/vibe-prompt`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<VibePromptResponse>;
    },
  });
}
