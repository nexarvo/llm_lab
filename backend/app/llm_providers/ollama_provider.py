import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMProvider

class OllamaProvider(BaseLLMProvider):
    """Ollama local LLM provider"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.base_url = base_url or "http://localhost:11434"
    
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7, 
        top_p: float = 0.9,
        max_tokens: int = 1000,
        model: str = "llama2",
        **kwargs
    ) -> Dict[str, Any]:
        """Generate response using Ollama local API"""
        import time
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "top_p": top_p,
                        "num_predict": max_tokens,
                        **kwargs
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=60.0  # Longer timeout for local models
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "response": data["response"],
                        "tokens_used": data.get("eval_count", 0),
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
