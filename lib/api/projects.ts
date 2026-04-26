"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { components } from "@/lib/types";

export type ProjectCreate = components["schemas"]["projectCreate"];

/** Backend returns the created project with an id field not in the OpenAPI schema */
export interface ProjectResponse extends ProjectCreate {
  id?: string;
  project_id?: string;
}

/** List all projects for the current user */
export function useProjects() {
  const api = useApi();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<ProjectResponse[]>("/projects/"),
  });
}

/** Create a new project */
export function useCreateProject() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectCreate) =>
      api.post<ProjectResponse>("/projects/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
