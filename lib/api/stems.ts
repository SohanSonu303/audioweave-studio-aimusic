"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type SeparationResponse = components["schemas"]["SeparationResponse"];

/** Upload audio file and separate into stems */
export function useSeparateStems() {
  const api = useApi();
  return useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      const token = await (api as { _getToken?: () => Promise<string | null> })._getToken?.();
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

/** Poll separation status by task id */
export function useSeparationStatus(taskId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["separation", taskId],
    queryFn: () =>
      api.get<SeparationResponse>(`/separate/?task_id=${taskId}`),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}
