import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateLLMResponse,
  getSupportedProviders,
  ExperimentStartResponse,
} from "@/lib/llm";
import { LLMRequest, ProvidersResponse } from "@/types/llm";

export function useLLMGeneration() {
  return useMutation<ExperimentStartResponse, Error, LLMRequest>({
    mutationFn: generateLLMResponse,
  });
}

export function useSupportedProviders() {
  return useQuery<ProvidersResponse, Error>({
    queryKey: ["providers"],
    queryFn: getSupportedProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
