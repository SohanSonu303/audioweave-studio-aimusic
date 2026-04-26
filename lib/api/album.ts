"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type AlbumCreate = components["schemas"]["AlbumCreate"];
export type AlbumResponse = components["schemas"]["AlbumResponse"];
export type AlbumTrackResponse = components["schemas"]["AlbumTrackResponse"];
export type AlbumProgressResponse = components["schemas"]["AlbumProgressResponse"];
export type AlbumProgressTrack = components["schemas"]["AlbumProgressTrack"];
export type AlbumApprove = components["schemas"]["AlbumApprove"];
export type TrackUpdate = components["schemas"]["TrackUpdate"];
export type TrackReplanRequest = components["schemas"]["TrackReplanRequest"];

/** Create a new album (triggers script analysis) */
export function useCreateAlbum() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AlbumCreate) =>
      api.post<AlbumResponse>("/album/create", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });
}

/** List all albums for the current user */
export function useAlbums() {
  const api = useApi();
  return useQuery({
    queryKey: ["albums"],
    queryFn: () => api.get<AlbumResponse[]>("/album/user"),
  });
}

/** Get a single album with tracks */
export function useAlbum(albumId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => api.get<AlbumResponse>(`/album/${albumId}`),
    enabled: !!albumId,
  });
}

/**
 * Variant of useAlbum that polls every 4s while the album is in a transient state
 * (PLANNING or GENERATING). Use this on the detail page so the UI auto-transitions
 * when planning/generation finishes. GeneratingView also polls the progress endpoint,
 * but this ensures the album-level status flips even if progress invalidation is missed.
 */
export function useAlbumPlanningPoll(albumId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => api.get<AlbumResponse>(`/album/${albumId}`),
    enabled: !!albumId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PLANNING" || status === "GENERATING" ? 10_000 : false;
    },
  });
}

/** Poll album generation progress — polls every 5s while GENERATING or PLANNING */
export function useAlbumProgress(albumId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["album-progress", albumId],
    queryFn: () => api.get<AlbumProgressResponse>(`/album/${albumId}/progress`),
    enabled: !!albumId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "GENERATING" || status === "PLANNING" ? 10_000 : false;
    },
  });
}

/** Approve an album — PUT (body is optional to support retry-with-no-body) */
export function useApproveAlbum(albumId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: AlbumApprove) =>
      api.put<AlbumResponse>(`/album/${albumId}/approve`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album", albumId] }),
  });
}

/** Replan a single track within an album — PUT */
export function useReplanTrack(albumId: string, trackId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: TrackReplanRequest) =>
      api.put<AlbumTrackResponse>(
        `/album/${albumId}/tracks/${trackId}/replan`,
        body,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album", albumId] }),
  });
}

/** Regenerate a single track — PUT /album/{id}/tracks/{tid}/regenerate */
export function useRegenerateTrack(albumId: string, trackId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.put<AlbumTrackResponse>(
        `/album/${albumId}/tracks/${trackId}/regenerate`,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album", albumId] }),
  });
}
