import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMProvider

class GoogleProvider(BaseLLMProvider):
    """Google Gemini API provider"""

    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.base_url = base_url or "https://gemini.googleapis.com/v1"

    async def generate_response(
        self,
        prompt: str,
        temperature: float = 0.7,
        top_p: float = 0.9,
        max_tokens: int = 1000,
        model: str = "gemini-2.5-pro",
        **kwargs
    ) -> Dict[str, Any]:
        import time
        start_time = time.time()

        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }

                payload = {
                    "model": model,
                    "prompt": prompt,
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_output_tokens": max_tokens,
                    **kwargs
                }

                response = await client.post(
                    f"{self.base_url}/responses:generate",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )

                if response.status_code == 200:
                    data = response.json()
                    text_output = data.get("candidates", [{}])[0].get("output", "")
                    tokens_used = (
                        data.get("usage", {}).get("input_tokens", 0) +
                        data.get("usage", {}).get("output_tokens", 0)
                    )

                    return {
                        "response": text_output,
                        "tokens_used": tokens_used,
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