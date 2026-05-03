"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";

export interface ExtractionResponse {
  id: string;
  user_id: string;
  project_id: string;
  original_filename: string;
  stems: string;
  task_id: string | null;
  conversion_id: string | null;
  status: "QUEUED" | "IN_QUEUE" | "COMPLETED" | "FAILED";
  vocals_url: string | null;
  drums_url: string | null;
  bass_url: string | null;
  piano_url: string | null;
  guitar_url: string | null;
  error_message: string | null;
  created_at: string;
}

/** Upload audio file and kick off stem extraction */
export function useSeparateStems() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/extraction/`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json() as Promise<ExtractionResponse>;
    },
  });
}

/** Poll extraction status by job id */
export function useSeparationStatus(jobId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["extraction", jobId],
    queryFn: () => api.get<ExtractionResponse>(`/extraction/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "QUEUED" || status === "IN_QUEUE" ? 10_000 : false;
    },
  });
}
