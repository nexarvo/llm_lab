import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export type GeneratePayload = {
  prompt: string;
  models?: string[]; // when multi-model
  single_llm?: boolean;
  temperatures?: number[]; // or range object
  top_ps?: number[];
  temperature?: number;
  top_p?: number;
};

export type LLMResult = {
  provider: string;
  model: string;
  temperature: number;
  top_p: number;
  response: string;
  tokens_used: number;
  execution_time: number;
  success: boolean;
  error?: string | null;
};

export function useGenerate() {
  return useMutation<unknown, Error, GeneratePayload>({
    mutationFn: async (payload: GeneratePayload) => {
      const { data } = await api.post("/llms/generate", payload);
      // assume { success, results, ... } shape
      return data;
    },
  });
}
