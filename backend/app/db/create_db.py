import os
from sqlmodel import SQLModel
from app.db.session import sync_engine
from app.models.experiments import Experiment
from app.models.llm_response import LLMResponse

# Ensure data directory exists
os.makedirs("./data", exist_ok=True)

print("Creating database...")
SQLModel.metadata.create_all(bind=sync_engine)
print("Database created at ./data/dev.db")
