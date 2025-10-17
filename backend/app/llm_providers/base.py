from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import time

class BaseLLMProvider(ABC):
    """Base class for all LLM providers"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url
    
    @abstractmethod
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7, 
        top_p: float = 0.9,
        max_tokens: int = 1000,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response from the LLM
        
        Args:
            prompt: Input prompt
            temperature: Sampling temperature
            top_p: Top-p sampling parameter
            max_tokens: Maximum tokens to generate
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Dictionary containing response, tokens_used, and other metadata
        """
        pass
    
    def _calculate_execution_time(self, start_time: float) -> float:
        """Calculate execution time in seconds"""
        return time.time() - start_time
