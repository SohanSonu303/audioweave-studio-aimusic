import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export interface EditOpResponse {
  audio_b64: string;
  audio_format: "mp3" | "wav";
  report?: Record<string, unknown>;
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

function appendSource(fd: FormData, source: File | string, key = "file") {
  if (source instanceof File) fd.append(key, source);
  else fd.append(key.replace("file", "url"), source);
}

// Some endpoints return raw binary audio instead of JSON when output_format=wav.
// Detect by Content-Type and normalise to EditOpResponse either way.
async function parseEditResponse(res: Response): Promise<EditOpResponse> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("audio/") || ct.includes("application/octet-stream")) {
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const audio_b64 = btoa(binary);
    const audio_format: "mp3" | "wav" = ct.includes("mpeg") || ct.includes("mp3") ? "mp3" : "wav";
    return { audio_b64, audio_format };
  }
  return res.json() as Promise<EditOpResponse>;
}

// ─── Cut ──────────────────────────────────────────────────────────────────────

export function useCut() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, start_ms, end_ms, output_format = "mp3",
    }: {
      source: File | string;
      start_ms: number;
      end_ms: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("start_ms", start_ms.toString());
      fd.append("end_ms", end_ms.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/cut`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Fade ─────────────────────────────────────────────────────────────────────

export function useFade() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, fade_in_ms, fade_out_ms, output_format = "mp3",
    }: {
      source: File | string;
      fade_in_ms: number;
      fade_out_ms: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("fade_in_ms", fade_in_ms.toString());
      fd.append("fade_out_ms", fade_out_ms.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/fade`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

export function useLoop() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, count, output_format = "mp3",
    }: {
      source: File | string;
      count: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("count", count.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/loop`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Split ────────────────────────────────────────────────────────────────────

export function useSplit() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, split_ms, output_format = "mp3",
    }: {
      source: File | string;
      split_ms: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("split_ms", split_ms.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/split`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Mix ──────────────────────────────────────────────────────────────────────

export function useMix() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source1, source2, track1_gain_db = 0, track2_gain_db = 0,
      crossfade_ms = 0, output_format = "mp3",
    }: {
      source1: File | string;
      source2: File | string;
      track1_gain_db?: number;
      track2_gain_db?: number;
      crossfade_ms?: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source1, "file1");
      appendSource(fd, source2, "file2");
      fd.append("track1_gain_db", track1_gain_db.toString());
      fd.append("track2_gain_db", track2_gain_db.toString());
      fd.append("crossfade_ms", crossfade_ms.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/mix`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

export function useOverlay() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      base, overlay, position_ms, overlay_gain_db = -6, output_format = "mp3",
    }: {
      base: File | string;
      overlay: File | string;
      position_ms: number;
      overlay_gain_db?: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, base, "file1");
      appendSource(fd, overlay, "file2");
      fd.append("position_ms", position_ms.toString());
      fd.append("overlay_gain_db", overlay_gain_db.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/overlay`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── EQ ───────────────────────────────────────────────────────────────────────

export function useEq() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, freq, gain, output_format = "mp3",
    }: {
      source: File | string;
      freq: number;
      gain: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("freq", freq.toString());
      fd.append("gain", gain.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/eq`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── AI Warmth ────────────────────────────────────────────────────────────────

export function useAiWarmth() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, intensity = 0.5, vocal_mode = false, output_format = "mp3",
    }: {
      source: File | string;
      intensity?: number;
      vocal_mode?: boolean;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("intensity", intensity.toString());
      fd.append("vocal_mode", vocal_mode.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/warmth`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}

// ─── Style Enhance ────────────────────────────────────────────────────────────

export function useStyleEnhance() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source, preset, intensity = 0.7, output_format = "mp3",
    }: {
      source: File | string;
      preset: string;
      intensity?: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      appendSource(fd, source);
      fd.append("preset", preset);
      fd.append("intensity", intensity.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/test-edit/enhance`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return parseEditResponse(res);
    },
  });
}
