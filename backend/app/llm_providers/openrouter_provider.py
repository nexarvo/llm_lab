import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMProvider

class OpenRouterProvider(BaseLLMProvider):
    """OpenRouter API provider for accessing multiple LLM models"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.base_url = base_url or "https://openrouter.ai/api/v1"
    
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7, 
        top_p: float = 0.9,
        max_tokens: int = 1000,
        model: str = "openai/gpt-3.5-turbo",
        **kwargs
    ) -> Dict[str, Any]:
        """Generate response using OpenRouter API"""
        import time
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://llm-lab.com",  # Optional: your app URL
                    "X-Title": "LLM Lab API"  # Optional: your app name
                }
                
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_tokens": max_tokens,
                    **kwargs
                }
                
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "response": data["choices"][0]["message"]["content"],
                        "tokens_used": data["usage"]["total_tokens"],
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
