# API module
from fastapi import APIRouter
from .llm_routes import router as llm_router
from .health_routes import router as health_router

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(llm_router)
api_router.include_router(health_router)