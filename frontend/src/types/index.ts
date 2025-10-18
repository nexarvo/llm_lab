export interface LLMResult {
  provider: string;
  model: string;
  temperature: number;
  top_p: number;
  response: string;
  tokens_used: number;
  execution_time: number;
  success: boolean;
  error?: string | null;
}

export interface LLMResponse {
  success: boolean;
  results: LLMResult[];
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  execution_time: number;
  message?: string;
}

export interface ChatBoxProps {
  defaultPrompt?: string;
  onComplete?: (result: LLMResponse) => void;
}

export interface ResponseCardProps {
  result: LLMResult;
}

export interface ResultsGridProps {
  results: LLMResult[];
}
