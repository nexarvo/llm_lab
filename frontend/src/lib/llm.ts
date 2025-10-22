import api from "./api";
import { LLMRequest, LLMResponse, ProvidersResponse } from "@/types/llm";

export interface ExperimentStatus {
  id: string;
  name: string;
  original_message: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at?: string;
  error_message?: string;
  responses: Array<{
    id: string;
    provider: string;
    model: string;
    temperature: number;
    top_p: number;
    response_text: string;
    tokens_used?: number;
    execution_time: number;
    success: boolean;
    error?: string;
    created_at: string;
  }>;
}

export interface ExperimentStartResponse {
  experiment_id: string;
  status: string;
  message: string;
}

export const generateLLMResponse = async (
  request: LLMRequest
): Promise<ExperimentStartResponse> => {
  try {
    const response = await api.post("/llms/generate", request);
    return response.data;
  } catch (error) {
    console.error("Error starting LLM experiment:", error);
    throw error;
  }
};

export const getExperimentStatus = async (
  experimentId: string
): Promise<ExperimentStatus> => {
  try {
    const response = await api.get(`/llms/experiment/${experimentId}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching experiment status:", error);
    throw error;
  }
};

export const cancelExperiment = async (
  experimentId: string
): Promise<{ message: string; cancelled: boolean }> => {
  try {
    const response = await api.post(`/llms/experiment/${experimentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling experiment:", error);
    throw error;
  }
};

export const getSupportedProviders = async (): Promise<ProvidersResponse> => {
  try {
    const response = await api.get("/llms/providers");
    return response.data;
  } catch (error) {
    console.error("Error fetching supported providers:", error);
    throw error;
  }
};
