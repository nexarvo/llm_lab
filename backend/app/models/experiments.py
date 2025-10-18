import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Experiment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)