from fastapi import APIRouter
from pydantic import BaseModel

# Create router for health endpoints
router = APIRouter(prefix="/health", tags=["Health"])

# Pydantic model for responses
class HealthResponse(BaseModel):
    status: str
    message: str

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Server is running successfully"
    )
