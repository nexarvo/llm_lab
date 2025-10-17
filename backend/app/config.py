import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import requests
# Load environment variables
load_dotenv()

class Config:
    """Configuration class for API keys and base URLs"""
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    
    # Base URLs (optional overrides)
    OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com/v1")
    GOOGLE_BASE_URL = os.getenv("GOOGLE_BASE_URL", "https://generativelanguage.googleapis.com/v1")
    OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    LLAMA_CPP_BASE_URL = os.getenv("LLAMA_CPP_BASE_URL", "http://localhost:8080")
    
    # Concurrency
    LLM_CONCURRENCY = int(os.getenv("LLM_CONCURRENCY", 4))
    LLM_RETRIES = int(os.getenv("LLM_RETRIES", 2))
    LLM_BACKOFF_FACTOR = float(os.getenv("LLM_BACKOFF_FACTOR", 0.5))
    LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", 60.0))
    # Model to provider mapping
    MODEL_PROVIDER_MAP = {
        # OpenAI Models
        "gpt-5": "openai",
        "gpt-4o": "openai",
        
        # Anthropic Models
        "claude-4": "anthropic",
        "claude-3-7-sonnet-20250219": "anthropic",
        
        # Google Models
        "gemini-2.5-flash": "google",
        "gemini-2.5-pro": "google",
        
        # OpenRouter Models
        "openai/gpt-oss-20b:free": "openrouter",
        
        # Mock Models (for testing)
        "mock-model": "mock",
    }
    
    @classmethod
    def get_ollama_models(cls) -> list[dict[str, str]]:
        """Get list of Ollama models"""
        try:
            response = requests.get(cls.OLLAMA_BASE_URL + "/api/tags")
            data = response.json()
            return [{"id": model["name"], "name": model["name"], "provider": "ollama"} for model in data.get("models", [])]
        except Exception as e:
            print(e)
            return []
    
    @classmethod
    def get_api_key(cls, provider: str) -> Optional[str]:
        """Get API key for a provider"""
        key_map = {
            "openai": cls.OPENAI_API_KEY,
            "anthropic": cls.ANTHROPIC_API_KEY,
            "google": cls.GOOGLE_API_KEY,
            "openrouter": cls.OPENROUTER_API_KEY,
            "ollama": None,  # No API key needed for local Ollama
            "llama_cpp": None  # No API key needed for local llama.cpp
        }
        return key_map.get(provider)
    
    @classmethod
    def get_base_url(cls, provider: str) -> str:
        """Get base URL for a provider"""
        url_map = {
            "openai": cls.OPENAI_BASE_URL,
            "anthropic": cls.ANTHROPIC_BASE_URL,
            "google": cls.GOOGLE_BASE_URL,
            "openrouter": cls.OPENROUTER_BASE_URL,
            "ollama": cls.OLLAMA_BASE_URL,
            "llama_cpp": cls.LLAMA_CPP_BASE_URL
        }
        return url_map.get(provider, "")
    
    @classmethod
    def get_provider_for_model(cls, model_id: str) -> str:
        """Get provider for a model ID"""
        if model_id in cls.MODEL_PROVIDER_MAP:
            return cls.MODEL_PROVIDER_MAP[model_id]
        elif model_id in [model["id"] for model in cls.get_ollama_models()]:
            return "ollama"
        else:
            return "unknown"
    
    @classmethod
    def validate_api_keys(cls) -> Dict[str, bool]:
        """Validate that required API keys are present"""
        validation = {
            "openai": cls.OPENAI_API_KEY is not None,
            "anthropic": cls.ANTHROPIC_API_KEY is not None,
            "google": cls.GOOGLE_API_KEY is not None,
            "openrouter": cls.OPENROUTER_API_KEY is not None,
            "ollama": True,  # Local service, no API key needed
            "llama_cpp": True  # Local service, no API key needed
        }
        return validation
