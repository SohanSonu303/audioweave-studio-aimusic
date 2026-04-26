"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MusicResponse {
  id: string;
  task_id: string | null;
  status: "pending" | "processing" | "COMPLETED" | "FAILED" | string;
  audio_url: string | null;
  title: string | null;
  duration: number | null;
  generated_lyrics: string | null;
  prompt: string | null;
  music_style: string | null;
  type: string;
  created_at?: string;
}

export interface DownloadPollResponse {
  user_id: string;
  summary: {
    total_tracks: number;
    total_sounds: number;
    total_separations: number;
  };
  tracks: MusicResponse[];
  sounds: MusicResponse[];
  separations: unknown[];
}

export interface ImageToSongFormData {
  projectId: string;
  imageFile?: File | null;
  imageUrl?: string;
  prompt?: string;
  lyrics?: string;
  negativeTags?: string;
  makeInstrumental?: boolean;
  vocalOnly?: boolean;
  key?: string;
  bpm?: number | null;
  voiceId?: string;
}

// ── Mutation: Submit Image-to-Song job ────────────────────────────────────────

export function useImageToSong() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: ImageToSongFormData): Promise<MusicResponse[]> => {
      const token = await getToken();

      const form = new FormData();
      form.append("project_id", data.projectId);

      if (data.imageFile) {
        form.append("image_file", data.imageFile);
      } else if (data.imageUrl) {
        form.append("image_url", data.imageUrl);
      }

      if (data.prompt) form.append("prompt", data.prompt);
      if (data.lyrics && !data.makeInstrumental) form.append("lyrics", data.lyrics);
      if (data.negativeTags) form.append("negative_tags", data.negativeTags);
      form.append("make_instrumental", String(data.makeInstrumental ?? false));
      form.append("vocal_only", String(data.vocalOnly ?? false));
      if (data.key) form.append("key", data.key);
      if (data.bpm != null) form.append("bpm", String(data.bpm));
      if (data.voiceId && !data.vocalOnly) form.append("voice_id", data.voiceId);

      const res = await fetch(`${API_BASE}/image-to-song/generate`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: res.statusText }));
        const msg =
          typeof errBody.detail === "string"
            ? errBody.detail
            : Array.isArray(errBody.detail)
            ? errBody.detail.map((e: { msg: string }) => e.msg).join(", ")
            : `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      return res.json() as Promise<MusicResponse[]>;
    },
  });
}

// ── Query: Poll download status ────────────────────────────────────────────────

export function useImageToSongPoll(taskId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: ["image-to-song-poll", taskId],
    queryFn: () => api.get<DownloadPollResponse>(`/download/?task_id=${taskId}`),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const tracks = query.state.data?.tracks ?? [];
      const allDone =
        tracks.length > 0 &&
        tracks.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
      return allDone ? false : 3000;
    },
    staleTime: 0,
  });
}
