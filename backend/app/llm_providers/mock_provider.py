import asyncio
import random
import time
from typing import Dict, Any, Optional
from .base import BaseLLMProvider

class MockProvider(BaseLLMProvider):
    """Mock LLM provider for testing and development"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.mock_responses = [
            "This is a mock response from the LLM. It demonstrates how the system works with parameter variations.",
            "Here's another mock response that shows the diversity of outputs you can expect.",
            "Mock response #3: This simulates different creative outputs based on temperature and top_p settings.",
            "Another simulated response that varies based on the input parameters you've configured.",
            "Final mock response demonstrating the parameter sweep functionality in action."
        ]
    
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7, 
        top_p: float = 0.9,
        max_tokens: int = 1000,
        model: str = "mock-model",
        **kwargs
    ) -> Dict[str, Any]:
        """Generate mock response with simulated processing time"""
        start_time = time.time()
        
        # Simulate processing time based on temperature (higher temp = longer processing)
        processing_delay = random.uniform(0.5, 2.0) * (1 + temperature)
        await asyncio.sleep(processing_delay)
        
        # Select response based on temperature and top_p for variety
        response_index = int((temperature + top_p) * 2) % len(self.mock_responses)
        base_response = self.mock_responses[response_index]
        
        # Add temperature-based variation to the response
        if temperature > 1.0:
            base_response += f" [High creativity mode - temp: {temperature:.2f}]"
        elif temperature < 0.3:
            base_response += f" [Conservative mode - temp: {temperature:.2f}]"
        
        # Add top_p-based variation
        if top_p < 0.5:
            base_response += f" [Focused sampling - top_p: {top_p:.2f}]"
        elif top_p > 0.9:
            base_response += f" [Diverse sampling - top_p: {top_p:.2f}]"
        
        # Simulate token usage based on response length and parameters
        tokens_used = len(base_response.split()) + int(temperature * 50) + int(top_p * 30)
        
        # Simulate occasional failures for testing error handling
        if random.random() < 0.05:  # 5% failure rate
            return {
                "response": "",
                "tokens_used": 0,
                "execution_time": self._calculate_execution_time(start_time),
                "success": False,
                "error": "Mock provider simulated failure for testing"
            }
        
        return {
            "response": base_response,
            "tokens_used": tokens_used,
            "execution_time": self._calculate_execution_time(start_time),
            "success": True,
            "error": None
        }
