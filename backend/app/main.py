from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(
    title="LLM Lab API",
    description="A simple FastAPI server for LLM Lab",
    version="1.0.0"
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
