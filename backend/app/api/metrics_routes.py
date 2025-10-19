from fastapi import APIRouter, Depends, HTTPException
from app.services.metrics import get_experiment_metrics

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/experiments/{experiment_id}/quality")
async def get_experiment_quality_metrics(
    experiment_id: str,
):
    """Get average quality metrics for all responses in an experiment."""
    try:
        result = await get_experiment_metrics(experiment_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
