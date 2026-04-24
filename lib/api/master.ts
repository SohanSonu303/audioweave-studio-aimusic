import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { audioSourceFormData } from "@/lib/audio-source-form-data";

export interface PlatformProfile {
  id: string;
  name: string;
  target_lufs: number;
  true_peak_db: number;
  description: string;
  icon?: string;
}

export interface MasterReport {
  platform: string;
  target_lufs: number;
  true_peak_ceiling: number;
  before: { lufs: number; true_peak_db: number };
  after: { lufs: number; true_peak_db: number };
  gain_applied_db: number;
  changes: string[];
}

export interface MasterResponse {
  audio_b64: string;
  audio_format: "mp3" | "wav";
  report: MasterReport;
}

export interface MasterSaveResponse {
  id: string;
  output_url: string;
  output_duration: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleApiError(res: Response) {
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }
  if (res.status === 422) {
    const errData = await res.json().catch(() => null);
    const detail = errData?.detail;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail) || "Validation error"
    );
  }
  if (!res.ok) throw new Error("Something went wrong");
}

export function usePlatforms(enabled = true) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["master", "platforms"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/master/platforms`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await handleApiError(res);
      return res.json() as Promise<PlatformProfile[]>;
    },
    staleTime: 10 * 60 * 1000,
    enabled,
  });
}

export function useMasterProcess() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      source,
      platform,
      output_format = "mp3",
    }: {
      source: File | string;
      platform: string;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = audioSourceFormData(source);
      fd.append("platform", platform);
      fd.append("output_format", output_format);

      const token = await getToken();
      const res = await fetch(`${API_BASE}/master/process`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<MasterResponse>;
    },
  });
}

export function useMasterSave() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      audio,
      project_id,
      operation_params,
      source_url,
      output_format,
    }: {
      audio: Blob;
      project_id: string;
      operation_params: MasterReport;
      source_url: string;
      output_format: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      const mime = output_format === "wav" ? "audio/wav" : "audio/mpeg";
      fd.append("audio_file", new File([audio], `mastered.${output_format}`, { type: mime }));
      fd.append("project_id", project_id);
      fd.append("operation_params", JSON.stringify(operation_params));
      fd.append("source_url", source_url);
      fd.append("output_format", output_format);

      const token = await getToken();
      const res = await fetch(`${API_BASE}/master/save`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<MasterSaveResponse>;
    },
  });
}
