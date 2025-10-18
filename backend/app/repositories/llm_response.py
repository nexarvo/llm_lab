from typing import List, Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.response import LLMResponse


async def get_responses_by_experiment(session: AsyncSession, experiment_id: int) -> List[LLMResponse]:
    """Return all Response rows for a given experiment id (ordered by id)."""
    result = await session.execute(
        select(LLMResponse).where(LLMResponse.experiment_id == experiment_id).order_by(Response.id)
    )
    return result.scalars().all()


async def save_responses_transaction(
    session: AsyncSession, experiment_id: int, responses: List[Dict[str, Any]]
) -> List[LLMResponse]:
    """
    Save a list of responses in a single transaction and return the created Response objects.
    """
    created: List[LLMResponse] = []

    async with session.begin():
        for r in responses:
            resp = Response(
                experiment_id=experiment_id,
                provider=r.get("provider", ""),
                model=r.get("model", ""),
                temperature=float(r.get("temperature", 0.0)) if r.get("temperature") is not None else 0.0,
                top_p=float(r.get("top_p", 0.0)) if r.get("top_p") is not None else 0.0,
                response_text=r.get("response_text") or r.get("response") or "",
                tokens_used=r.get("tokens_used"),
                execution_time=float(r.get("execution_time", 0.0)) if r.get("execution_time") is not None else 0.0,
                success=bool(r.get("success", True)),
                error=r.get("error"),
            )
            session.add(resp)
            created.append(resp)

        # flush to push inserts and assign PKs, then refresh to populate attributes
        await session.flush()
        for resp in created:
            await session.refresh(resp)

    return created