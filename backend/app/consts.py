"""
Constants for LLM providers and models
"""
from typing import Dict, List, Any
from enum import Enum

# Experiment status constants
class ExperimentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Supported provider types
SUPPORTED_PROVIDERS = {
    "openai": "OpenAI",
    "anthropic": "Anthropic", 
    "ollama": "Ollama",
    "llama_cpp": "Llama.cpp",
    "openrouter": "OpenRouter",
    "mock": "Mock"
}

# Supported models configuration
SUPPORTED_MODELS = [
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
    
    # Mock Models (for testing)
    {
        "id": "mock-model",
        "name": "Mock LLM (Testing)",
        "provider": "mock",
        "description": "Mock LLM for testing parameter variations without API calls",
    },
]

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

# Provider configuration mapping
PROVIDER_CONFIG = {
    "openai": {
        "api_key_env": "OPENAI_API_KEY",
        "base_url_env": "OPENAI_BASE_URL",
        "default_base_url": "https://api.openai.com/v1"
    },
    "anthropic": {
        "api_key_env": "ANTHROPIC_API_KEY", 
        "base_url_env": "ANTHROPIC_BASE_URL",
        "default_base_url": "https://api.anthropic.com/v1"
    },
    "google": {
        "api_key_env": "GOOGLE_API_KEY",
        "base_url_env": "GOOGLE_BASE_URL", 
        "default_base_url": "https://generativelanguage.googleapis.com/v1"
    },
    "openrouter": {
        "api_key_env": "OPENROUTER_API_KEY",
        "base_url_env": "OPENROUTER_BASE_URL",
        "default_base_url": "https://openrouter.ai/api/v1"
    },
    "ollama": {
        "api_key_env": None,  # No API key needed
        "base_url_env": "OLLAMA_BASE_URL",
        "default_base_url": "http://localhost:11434"
    },
    "llama_cpp": {
        "api_key_env": None,  # No API key needed
        "base_url_env": "LLAMA_CPP_BASE_URL", 
        "default_base_url": "http://localhost:8080"
    }
}
