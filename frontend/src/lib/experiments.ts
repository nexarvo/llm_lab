import api from "./api";
import { LLMResult } from "@/types/llm";

export interface ExperimentResponse {
  id: string;
  name: string;
  orginal_message: string;
  results: unknown[];
  created_at?: number;
  llm_results: LLMResult[];
}

export interface Experiment {
  id: string;
  name: string;
  created_at: string;
}

export interface ExperimentsListResponse {
  experiments: Experiment[];
}

export const getExperimentById = async (
  experimentId: string
): Promise<ExperimentResponse> => {
  const { data } = await api.get(`/experiments/${experimentId}`);
  console.log("data: ", data);
  return {
    id: data.id,
    name: data.name,
    orginal_message: data.original_message ?? "",
    results: data.results ?? [],
    created_at: data.created_at,
    llm_results: data.results ?? [],
  };
};

export const getAllExperiments = async (): Promise<ExperimentsListResponse> => {
  const { data } = await api.get("/experiments");
  return data;
};
