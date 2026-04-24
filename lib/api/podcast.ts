import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export interface PodcastReport {
  before_lufs?: number;
  after_lufs?: number;
  speech_duration_s?: number;
  total_duration_s?: number;
  processing_chain?: string[];
  [key: string]: unknown;
}

export interface PodcastProduceResponse {
  audio_b64: string;
  audio_format: "mp3" | "wav";
  report: PodcastReport;
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
  if (!res.ok) throw new Error("Something went wrong. Please try again.");
}

export function usePodcastProduce() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      speech, music,
      noise_reduction = true, voice_eq = true, add_music = true,
      duck_db = -18, intro_duration_s = 8, outro_duration_s = 8,
      output_format = "mp3",
    }: {
      speech: File | string;
      music?: File | string;
      noise_reduction?: boolean;
      voice_eq?: boolean;
      add_music?: boolean;
      duck_db?: number;
      intro_duration_s?: number;
      outro_duration_s?: number;
      output_format?: "mp3" | "wav";
    }) => {
      const fd = new FormData();
      if (speech instanceof File) fd.append("speech_file", speech);
      else fd.append("speech_url", speech);
      if (music) {
        if (music instanceof File) fd.append("music_file", music);
        else fd.append("music_url", music);
      }
      fd.append("noise_reduction", noise_reduction.toString());
      fd.append("voice_eq", voice_eq.toString());
      fd.append("add_music", add_music.toString());
      fd.append("duck_db", duck_db.toString());
      fd.append("intro_duration_s", intro_duration_s.toString());
      fd.append("outro_duration_s", outro_duration_s.toString());
      fd.append("output_format", output_format);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/podcast/produce`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      await handleApiError(res);
      return res.json() as Promise<PodcastProduceResponse>;
    },
  });
}
