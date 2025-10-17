from fastapi import APIRouter, HTTPException
from ..validations.llm_requests import LLMRequest, LLMResponse
from ..services.llm_service import LLMService
from ..llm_providers.factory import LLMProviderFactory
import requests


# Create router for LLM endpoints
router = APIRouter(prefix="/llms", tags=["LLMs"])

# Initialize LLM service
llm_service = LLMService()

@router.post("/generate", response_model=LLMResponse)
async def generate_llm_response(request: LLMRequest):
    """
    Generate LLM responses with parameter variations or multiple models
    
    This endpoint supports two modes:
    1. Single LLM with parameter variations (single_llm=True)
    2. Multiple LLMs with single parameters (single_llm=False)
    
    Args:
        request: LLMRequest containing prompt, parameters, and LLM configurations
        
    Returns:
        LLMResponse with results from all LLM calls
    """
    try:
        result = await llm_service.process_llm_request(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/providers")
async def get_supported_providers():
    """Get list of supported LLM providers"""
    try:
        ollama_response = requests.get("http://localhost:11434/api/tags")
        ollama_data = ollama_response.json()
        ollama_models = [{"id": model["name"], "name": model["name"], "provider": "ollama"} for model in ollama_data.get("models", [])]
    except Exception as e:
        print(e)
        ollama_models = []
    return {
        "models": [
            # OpenAI Models
            {
               "id": "gpt-5",
               "name": "GPT-5",
               "provider": "openai",
            },
            {
                "id": "gpt-4o",
                "name": "GPT-4o",
                "provider": "openai",
            },
            
            # Anthropic Models
            {"id": "claude-4", "name": "Claude 4", "provider": "anthropic"},
            {"id": "claude-3-7-sonnet-20250219", "name": "Claude 3.7 Sonnet", "provider": "anthropic"},
            
            # Google Models
            {
                "id": "gemini-2.5-flash",
                "name": "Gemini 2.5 Flash",
                "provider": "google",
            },
            {
                "id": "gemini-2.5-pro",
                "name": "Gemini 2.5 Pro",
                "provider": "google",
            },
            
            # OpenRouter Models
            {
                "id": "openai/gpt-oss-20b:free",
                "name": "GPT-OSS (via OpenRouter)",
                "provider": "openrouter",
                "description": "OpenAI GPT-OSS through OpenRouter",
            },
        ] + ollama_models[:2],
    }
