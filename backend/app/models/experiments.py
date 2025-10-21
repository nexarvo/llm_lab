import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
from ..consts import ExperimentStatus

class Experiment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    original_message: str = Field(default="")
    status: str = Field(default=ExperimentStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    error_message: Optional[str] = Field(default=None)