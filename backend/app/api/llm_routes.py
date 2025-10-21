from fastapi import APIRouter, HTTPException
from ..validations.llm_requests import LLMRequest, LLMResponse
from ..services.llm_service import LLMService
from ..services.background_tasks import background_task_service
from ..services.experiment_service import get_experiment_status as gets_experiment_status
from ..llm_providers.factory import LLMProviderFactory
from ..consts import SUPPORTED_MODELS, ExperimentStatus
from ..db.session import AsyncSessionLocal
from ..repositories.experiments import save_experiment
import uuid
import requests


# Create router for LLM endpoints
router = APIRouter(prefix="/llms", tags=["LLMs"])

# Initialize LLM service
llm_service = LLMService()

@router.post("/generate")
async def generate_llm_response(request: LLMRequest):
    """
    Generate LLM responses with parameter variations or multiple models (Background processing)
    
    This endpoint supports two modes:
    1. Single LLM with parameter variations (single_llm=True)
    2. Multiple LLMs with single parameters (single_llm=False)
    
    Args:
        request: LLMRequest containing prompt, parameters, and LLM configurations
        
    Returns:
        Experiment ID and status for polling
    """
    try:
        # Create experiment in database
        async with AsyncSessionLocal() as session:
            experiment = await save_experiment(
                session, 
                name=f"LLM Experiment - {request.models[0] if request.single_llm else f'{len(request.models)} models'}",
                original_message=request.prompt
            )
            experiment_id = str(experiment.id)
        
        # Start background task
        await background_task_service.start_llm_experiment(experiment_id, request)
        
        return {
            "experiment_id": experiment_id,
            "status": ExperimentStatus.PENDING,
            "message": "Experiment started in background. Use the experiment_id to check status."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/experiment/{experiment_id}/status")
async def get_experiment_status(experiment_id: str):
    """
    Get experiment status and results
    
    Args:
        experiment_id: ID of the experiment
        
    Returns:
        Experiment status, results, and metadata
    """
    try:
        status_data = await gets_experiment_status(experiment_id)
        
        if not status_data:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        return status_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/experiment/{experiment_id}/cancel")
async def cancel_experiment(experiment_id: str):
    """
    Cancel a running experiment
    
    Args:
        experiment_id: ID of the experiment to cancel
        
    Returns:
        Cancellation status
    """
    try:
        success = await background_task_service.cancel_experiment(experiment_id)
        
        if success:
            return {"message": "Experiment cancelled successfully", "cancelled": True}
        else:
            return {"message": "Experiment not found or already completed", "cancelled": False}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/providers")
async def get_supported_providers():
    """Get list of supported LLM providers"""
    try:
        ollama_response = requests.get("http://localhost:11434/api/tags")
        ollama_data = ollama_response.json()
        ollama_models = [{"id": model["name"], "name": model["name"], "provider": "ollama"} for model in ollama_data.get("models", [])]
    except Exception as e:
        print(e)
        ollama_models = []
    return {
        "models": SUPPORTED_MODELS + ollama_models[:2],
    }
