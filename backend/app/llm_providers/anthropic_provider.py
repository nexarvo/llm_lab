import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMProvider

class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude API provider"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.base_url = base_url or "https://api.anthropic.com/v1"
    
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7, 
        top_p: float = 0.9,
        max_tokens: int = 1000,
        model: str = "claude-3-sonnet-20240229",
        **kwargs
    ) -> Dict[str, Any]:
        """Generate response using Anthropic Claude API"""
        import time
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "x-api-key": self.api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                }
                
                payload = {
                    "model": model,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "top_p": top_p,
                    "messages": [{"role": "user", "content": prompt}],
                    **kwargs
                }
                
                response = await client.post(
                    f"{self.base_url}/messages",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "response": data["content"][0]["text"],
                        "tokens_used": data["usage"]["input_tokens"] + data["usage"]["output_tokens"],
                        "execution_time": self._calculate_execution_time(start_time),
                        "success": True,
                        "error": None
                    }
                else:
                    return {
                        "response": "",
                        "tokens_used": 0,
                        "execution_time": self._calculate_execution_time(start_time),
                        "success": False,
                        "error": f"API Error: {response.status_code} - {response.text}"
                    }
        except Exception as e:
            return {
                "response": "",
                "tokens_used": 0,
                "execution_time": self._calculate_execution_time(start_time),
                "success": False,
                "error": str(e)
            }
