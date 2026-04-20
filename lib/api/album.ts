"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type AlbumCreate = components["schemas"]["AlbumCreate"];
export type AlbumResponse = components["schemas"]["AlbumResponse"];
export type AlbumTrackResponse = components["schemas"]["AlbumTrackResponse"];
export type AlbumProgressResponse = components["schemas"]["AlbumProgressResponse"];
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

/** Poll album analysis/generation progress */
export function useAlbumProgress(albumId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["album-progress", albumId],
    queryFn: () => api.get<AlbumProgressResponse>(`/album/${albumId}/progress`),
    enabled: !!albumId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}

/** Approve an album (lock in the track plan) */
export function useApproveAlbum(albumId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: components["schemas"]["AlbumApprove"]) =>
      api.post<AlbumResponse>(`/album/${albumId}/approve`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album", albumId] }),
  });
}

/** Replan a single track within an album */
export function useReplanTrack(albumId: string, trackId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TrackReplanRequest) =>
      api.post<AlbumTrackResponse>(
        `/album/${albumId}/tracks/${trackId}/replan`,
        body,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album", albumId] }),
  });
}
