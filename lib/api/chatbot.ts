import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

export interface ChatbotMatchedSection {
  heading: string;
  category: string;
  score: number;
}

export interface ChatbotResponse {
  answer: string;
  matched_sections: ChatbotMatchedSection[];
  confidence: number;
  grounded: boolean;
}

export function useChatbotAsk() {
  const api = useApi();
  return useMutation({
    mutationFn: (question: string) =>
      api.post<ChatbotResponse>("/chatbot/ask", { question }),
  });
}
