"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

export interface TrackItem {
  id: string;
  project_id: string;
  type: "music" | "vocal" | "sfx" | "stem" | string;
  task_id: string | null;
  conversion_id: string | null;
  status: "COMPLETED" | "FAILED" | "pending" | "processing" | string;
  audio_url: string | null;
  prompt: string | null;
  music_style: string | null;
  title: string | null;
  duration: number | null;
  album_cover_path: string | null;
  generated_lyrics: string | null;
  created_at?: string;
}

export interface LibrarySummary {
  total_tracks: number;
  total_sounds: number;
  total_separations: number;
}

export interface LibraryResponse {
  user_id: string;
  summary: LibrarySummary;
  tracks: TrackItem[];
  sounds: TrackItem[];
  separations: unknown[];
}

/** Fetch the user's full library (all generated tracks) */
export function useLibrary() {
  const api = useApi();
  return useQuery({
    queryKey: ["library"],
    queryFn: () => api.get<LibraryResponse>("/library/"),
  });
}

/** Poll download status for a task until all tracks/sounds are COMPLETED/FAILED */
export function useDownloadPoll(taskId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["download", taskId],
    queryFn: () => api.get<LibraryResponse>(`/download/?task_id=${taskId}`),
    enabled: !!taskId,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      const allItems = [...(data?.tracks ?? []), ...(data?.sounds ?? [])];
      const done =
        allItems.length > 0 &&
        allItems.every((t) => t.status === "COMPLETED" || t.status === "FAILED");
      return done ? false : 10_000;
    },
  });
}
