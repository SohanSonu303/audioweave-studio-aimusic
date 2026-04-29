import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

export interface PromptSuggestionResponse {
  id: number;
  created_at: string;
  user_id: string;
  user_name: string;
  prompt: string;
  is_lyrics: boolean;
  feature_type: "quick_idea" | "prompt_enhanced";
}

export function useQuickIdea() {
  const api = useApi();
  return useMutation({
    mutationFn: (prompt: string) =>
      api.post<PromptSuggestionResponse>("/prompt/quick-idea", { prompt }),
  });
}

export function useEnhancePrompt() {
  const api = useApi();
  return useMutation({
    mutationFn: ({ prompt, master_prompt }: { prompt: string; master_prompt?: string }) =>
      api.post<PromptSuggestionResponse>("/prompt/enhance", { prompt, master_prompt }),
  });
}
