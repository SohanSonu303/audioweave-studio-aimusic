"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type ProjectCreate = components["schemas"]["projectCreate"];

/** List all projects for the current user */
export function useProjects() {
  const api = useApi();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<ProjectCreate[]>("/projects/"),
  });
}

/** Create a new project */
export function useCreateProject() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectCreate) =>
      api.post<ProjectCreate>("/projects/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
