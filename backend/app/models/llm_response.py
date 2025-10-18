import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class LLMResponse(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    experiment_id: uuid.UUID = Field(default=None, foreign_key="experiment.id")
    provider: str
    model: str
    temperature: float
    top_p: float
    response_text: str
    tokens_used: Optional[int] = None
    execution_time: float
    success: bool = True
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
