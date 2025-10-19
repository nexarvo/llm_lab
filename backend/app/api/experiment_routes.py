from fastapi import APIRouter, Depends, HTTPException
from app.services.experiment_service import fetch_experiment

router = APIRouter(prefix="/experiments", tags=["experiments"])

@router.get("/{experiment_id}")
async def get_experiment(
    experiment_id: str,
):
    """Get experiment by experiment id"""
    try:
        result = await fetch_experiment(experiment_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
