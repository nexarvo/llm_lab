from fastapi import APIRouter, Depends, HTTPException
from app.services.experiment_service import fetch_experiment, get_all_experiments
from app.db.session import AsyncSessionLocal

router = APIRouter(prefix="/experiments", tags=["experiments"])

@router.get("/")
async def get_all_experiments_list():
    """Get all experiments"""
    try:
        async with AsyncSessionLocal() as session:
            result = await get_all_experiments(session)
            return {"experiments": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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
