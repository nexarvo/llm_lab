from typing import Dict, Any, Optional
from .base import BaseLLMProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .google_provider import GoogleProvider
from .ollama_provider import OllamaProvider
from .llama_cpp_provider import LlamaCppProvider
from .openrouter_provider import OpenRouterProvider
from .mock_provider import MockProvider
from ..consts import SUPPORTED_PROVIDERS, MODEL_PROVIDER_MAP

class LLMProviderFactory:
    """Factory class for creating LLM providers"""
    
    _providers = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "google": GoogleProvider,
        "ollama": OllamaProvider,
        "llama_cpp": LlamaCppProvider,
        "openrouter": OpenRouterProvider,
        "mock": MockProvider,
    }
    
    @classmethod
    def create_provider(
        self, 
        provider_type: str, 
        api_key: Optional[str] = None, 
        base_url: Optional[str] = None,
        **kwargs
    ) -> BaseLLMProvider:
        """
        Create an LLM provider instance
        
        Args:
            provider_type: Type of provider (openai, anthropic, ollama, llama_cpp)
            api_key: API key for the provider
            base_url: Base URL for the provider
            **kwargs: Additional provider-specific parameters
            
        Returns:
            LLM provider instance
        """
        if provider_type not in self._providers:
            raise ValueError(f"Unsupported provider type: {provider_type}")
        
        provider_class = self._providers[provider_type]
        return provider_class(api_key=api_key, base_url=base_url, **kwargs)
    
    @classmethod
    def get_supported_providers(cls) -> list:
        """Get list of supported provider types"""
        return list(cls._providers.keys())
