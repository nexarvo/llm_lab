from app.validations.llm_requests import ExperimentResponse
from app.repositories.experiments import get_experiment_by_id, get_all_experiments, get_experiment_with_responses
from app.repositories.llm_response import get_responses_by_experiment
from app.db.session import AsyncSessionLocal
from ..core.logger import Logger

logger = Logger(__name__)

async def fetch_experiment(experiment_id: str) -> ExperimentResponse:
    """
    Retrieve an experiment and its associated LLM results by experiment_id and
    return an `ExperimentResponse` shaped as:
      id: str
      name: str
      results: List[dict]
      created_at: float
      llm_results: list[LLMResult]

    This function is intentionally focused on fetching and shaping data for the
    response model and avoids unrelated LLM-request logic.
    """

    try:
        logger.info(f"Fetching experiment for given experiment_id: {experiment_id}")
        async with AsyncSessionLocal() as db_session:
            experiment = await get_experiment_by_id(db_session, experiment_id)
            print("hi")

            if experiment is None:
                logger.info(f"Experiment not found: {experiment_id}")
                # Return a minimal failure-shaped ExperimentResponse
                return ExperimentResponse(
                    id=str(experiment_id),
                    name="",
                    original_message="",
                    results=[],
                    llm_results=[],
                )

            # Load raw responses for the experiment (list[dict])
            responses = await get_responses_by_experiment(db_session, experiment_id)


        # Normalize created_at to a float timestamp
        created_at = getattr(experiment, "created_at", None)
        if created_at is None:
            created_at_ts = time.time()
        else:
            # If it's a datetime-like object, convert to timestamp
            created_at_ts = (
                created_at.timestamp()
                if hasattr(created_at, "timestamp")
                else float(created_at)
            )

        # Map raw responses to the LLMResult model where possible
        llm_results: list[LLMResult] = []
        for r in (responses or []):
            try:
                lr = LLMResult(
                    provider=r.get("provider") or r.get("llm_provider") or "",
                    model=r.get("model") or r.get("llm_model") or "",
                    temperature=float(r.get("temperature", 0.0) or 0.0),
                    top_p=float(r.get("top_p", 0.0) or 0.0),
                    response=r.get("response") or r.get("output") or "",
                    tokens_used=(r.get("tokens_used") if r.get("tokens_used") is not None else None),
                    execution_time=float(r.get("execution_time", 0.0) or 0.0),
                    success=bool(r.get("success", False)),
                    error=r.get("error"),
                )
                llm_results.append(lr)
            except Exception:
                # Skip malformed response entries but keep the raw results list intact
                continue

        logger.info(
            f"Fetched experiment {experiment_id} with {len(responses or [])} responses",
            experiment_id=str(experiment_id),
            total_responses=len(responses or []),
        )

        return ExperimentResponse(
            id=str(getattr(experiment, "id", experiment_id)),
            name=str(getattr(experiment, "name", "")),
            original_message=str(getattr(experiment, "original_message", "")),
            results=responses or [],
            created_at=created_at_ts,
            llm_results=llm_results,
        )

    except Exception as e:
        logger.error(
            "Failed to fetch experiment",
            error=str(e),
            experiment_id=str(experiment_id),
        )
        raise

async def get_experiment_status(experiment_id: str) -> dict:
    """
    Get experiment status and results from database
    
    Args:
        experiment_id: ID of the experiment
        
    Returns:
        Experiment status and results
    """
    try:
        async with AsyncSessionLocal() as session:
            return await get_experiment_with_responses(session, experiment_id)
    except Exception as e:
        logger.error(f"Error getting experiment status {experiment_id}: {e}")
        raise