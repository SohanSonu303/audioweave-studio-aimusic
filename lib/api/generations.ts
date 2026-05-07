"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type MusicCreate = components["schemas"]["MusicCreate"];
export type MusicResponse = components["schemas"]["MusicResponse"];
export type SoundCreate = components["schemas"]["SoundCreate"];
export type SoundResponse = components["schemas"]["SoundResponse"];
export type PromptEnhanceCreate = components["schemas"]["PromptEnhanceCreate"];
export type PromptResponse = components["schemas"]["PromptResponse"];
export type RemixCreate = components["schemas"]["RemixCreate"];

/** Generate music / song — backend returns an array (one entry per variation) */
export function useGenerateMusic() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MusicCreate) =>
      api.post<MusicResponse[]>("/music/generateMusic", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });
}

/** Poll a single generation by id until status is done */
export function useGeneration(id: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["generation", id],
    queryFn: () => api.get<MusicResponse>(`/music/generateMusic/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 10_000 : false;
    },
  });
}

/** Generate sound FX */
export function useGenerateSound() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SoundCreate) =>
      api.post<SoundResponse>("/sound_generator/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });
}

/** Poll a single SFX generation by task_id until COMPLETED or FAILED */
export function useSoundPoll(taskId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["sound", taskId],
    queryFn: () => api.get<SoundResponse>(`/sound_generator/?task_id=${taskId}`),
    enabled: !!taskId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 10_000;
    },
  });
}

/** Remix an existing track */
export function useRemix() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RemixCreate) =>
      api.post<MusicResponse>("/music/remix", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });
}

/** Enhance a prompt via AI */
export function useEnhancePrompt() {
  const api = useApi();
  return useMutation({
    mutationFn: (body: PromptEnhanceCreate) =>
      api.post<PromptResponse>("/prompt/enhance", body),
  });
}
