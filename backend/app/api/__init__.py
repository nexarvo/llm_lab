# API module
from fastapi import APIRouter
from .llm_routes import router as llm_router
from .health_routes import router as health_router
from .metrics_routes import router as metrics_router
from .experiment_routes import router as experiment_router
from .api_keys_routes import router as api_keys_router

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(llm_router)
api_router.include_router(health_router)
api_router.include_router(metrics_router)
api_router.include_router(experiment_router)
api_router.include_router(api_keys_router)