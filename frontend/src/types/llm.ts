export interface LLMRequest {
  prompt: string;
  temperatures: number[];
  top_ps: number[];
  single_llm: boolean;
  models: string[];
  mock_mode?: boolean;
  api_keys?: Record<string, string>;
}

export interface LLMResult {
  provider: string;
  model: string;
  temperature: number;
  top_p: number;
  response: string;
  tokens_used?: number;
  execution_time: number;
  success: boolean;
  error?: string;
}

export interface LLMResponse {
  success: boolean;
  experiment_id: string;
  results: LLMResult[];
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  execution_time: number;
  message?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface ProvidersResponse {
  models: Model[];
}
