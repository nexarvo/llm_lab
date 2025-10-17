from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum

class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    META = "meta"
    HUGGINGFACE = "huggingface"
    OLLAMA = "ollama"
    LLAMA_CPP = "llama_cpp"

class LLMRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000, description="The input prompt for the LLM")
    temperatures: List[float] = Field(..., description="List of temperatures for text generation (0.0 to 2.0)")
    top_ps: List[float] = Field(..., description="List of top-p sampling parameters (0.0 to 1.0)")
    single_llm: bool = Field(..., description="Whether to use single LLM with parameter variations or multiple LLMs")
    models: List[str] = Field(..., min_items=1, max_items=10, description="List of model IDs from /llm/providers")
    
    @validator('temperatures')
    def validate_temperatures(cls, v):
        if len(v) == 0:
            raise ValueError("Temperatures list cannot be empty")
        for temperature in v:
            if temperature < 0.0 or temperature > 2.0:
                raise ValueError(f"Temperature {temperature} must be between 0.0 and 2.0")
        return v
    
    @validator('top_ps')
    def validate_top_ps(cls, v):
        if len(v) == 0:
            raise ValueError("Top-ps list cannot be empty")
        for top_p in v:
            if top_p < 0.0 or top_p > 1.0:
                raise ValueError(f"Top-p {top_p} must be between 0.0 and 1.0")
        return v

class LLMResponse(BaseModel):
    success: bool
    results: List[dict]
    total_requests: int
    successful_requests: int
    failed_requests: int
    execution_time: float
    message: Optional[str] = None

class LLMResult(BaseModel):
    provider: str
    model: str
    temperature: float
    top_p: float
    response: str
    tokens_used: Optional[int] = None
    execution_time: float
    success: bool
    error: Optional[str] = None
