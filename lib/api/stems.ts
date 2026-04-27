"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type SeparationResponse = components["schemas"]["SeparationResponse"];

/** Upload audio file and separate into stems */
export function useSeparateStems() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/separate/`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json() as Promise<SeparationResponse>;
    },
  });
}

/** Poll separation status by user id and task id */
export function useSeparationStatus(userId: string | null, taskId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["separation", userId, taskId],
    queryFn: () =>
      api.get<SeparationResponse>(`/separate/${taskId}`),
    enabled: !!userId && !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Backend statuses: PENDING, IN_PROGRESS, COMPLETED, FAILED
      return status === "PENDING" || status === "IN_PROGRESS" ? 10_000 : false;
    },
  });
}
