import uuid
from typing import List, Dict, Any
from sqlmodel import select
from ..core.logger import Logger
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.llm_response import LLMResponse

logger = Logger(__name__)

async def get_responses_by_experiment(session: AsyncSession, experiment_id: str) -> List[LLMResponse]:
    """Return all Response rows for a given experiment id (ordered by id)."""
    try:
        logger.info(f"Getting llm responses with experiment id: {experiment_id}")
        # Convert string to UUID if needed
        if isinstance(experiment_id, str):
            experiment_uuid = uuid.UUID(experiment_id)
        else:
            experiment_uuid = experiment_id
            
        result = await session.execute(
            select(LLMResponse).where(LLMResponse.experiment_id == experiment_uuid).order_by(LLMResponse.id)
        )
        logger.info(f"Successfully got llm responses with experiment id: {experiment_id}")
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error getting llm responses with experiment id: {experiment_id}, error: {e}")
        raise


async def save_responses_transaction(
    session: AsyncSession, experiment_id: str, responses: List[Dict[str, Any]]
) -> List[LLMResponse]:
    try:
        logger.info(f"Saving LLM responses for experiment id: {experiment_id}")
        created: List[LLMResponse] = []
        
        # Convert string to UUID if needed
        if isinstance(experiment_id, str):
            experiment_uuid = uuid.UUID(experiment_id)
        else:
            experiment_uuid = experiment_id

        for r in responses:
            resp = LLMResponse(
                id=uuid.uuid4(),
                experiment_id=experiment_uuid,
                provider=r.get("provider", ""),
                model=r.get("model", ""),
                temperature=float(r.get("temperature", 0.0)),
                top_p=float(r.get("top_p", 0.0)),
                response_text=r.get("response", ""),
                tokens_used=int(r.get("tokens_used", 0)),
                execution_time=float(r.get("execution_time", 0.0)),
                success=bool(r.get("success", True)),
                error=r.get("error"),
            )
            session.add(resp)
            created.append(resp)

        # Flush to assign IDs
        await session.flush()
        for resp in created:
            await session.refresh(resp)
            
        await session.commit()

        logger.info(f"Successfully saved {len(created)} LLM responses for experiment id: {experiment_id}")
        return created

    except Exception as e:
        logger.error(f"Error saving LLM responses for experiment id: {experiment_id}, error: {e}")
        raise