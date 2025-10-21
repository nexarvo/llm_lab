import uuid
from sqlmodel import select, update
from datetime import datetime
from ..core.logger import Logger
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.experiments import Experiment
from app.consts import ExperimentStatus

logger = Logger(__name__)

async def save_experiment(session: AsyncSession, name: str, original_message: str) -> Experiment:
    """Insert a new experiment record."""
    try:
        logger.info(f"Creating a new experiment with name: {name}")
        experiment = Experiment(id=uuid.uuid4(), name=name, original_message=original_message)
        session.add(experiment)
        await session.commit()
        await session.refresh(experiment)
        logger.info(f"Experiment created with ID: {experiment.id}")
        return experiment
    except e:
        logger.error(f"Error saving experiment created with ID: {experiment.id}, error: {e}")
        raise


async def get_experiment_by_id(session: AsyncSession, experiment_id: str) -> Experiment | None:
    """Fetch an experiment by ID."""
    try:
        logger.info(f"Getting experiment with id: {experiment_id}")
        # Convert string to UUID if needed
        if isinstance(experiment_id, str):
            experiment_uuid = uuid.UUID(experiment_id)
        else:
            experiment_uuid = experiment_id
        result = await session.execute(select(Experiment).where(Experiment.id == experiment_uuid))
        logger.info(f"Successfully got experiment with id: {experiment_id}")
        return result.scalar_one_or_none()
    except Exception as e:
        logger.error(f"Error getting experiment with id: {experiment_id}, error: {e}")
        raise
        

async def get_all_experiments(session: AsyncSession) -> list[Experiment]:
    """Fetch all experiments."""
    try:
        logger.info("Getting all experiments")
        result = await session.execute(select(Experiment))
        logger.info("Successfully got all experiments")
        return result.scalars().all()
    except e:
        logger.error(f"Error getting all experiments with error: {e}")
        raise

async def update_experiment_status(
    session: AsyncSession, 
    experiment_id: str, 
    status: str, 
    error_message: str = None
) -> bool:
    """Update experiment status in database."""
    try:
        logger.info(f"Updating experiment {experiment_id} status to {status}")
        
        # Convert string to UUID if needed
        if isinstance(experiment_id, str):
            experiment_uuid = uuid.UUID(experiment_id)
        else:
            experiment_uuid = experiment_id
        
        # Update the experiment
        stmt = (
            update(Experiment)
            .where(Experiment.id == experiment_uuid)
            .values(
                status=status,
                updated_at=datetime.utcnow(),
                error_message=error_message
            )
        )
        
        result = await session.execute(stmt)
        await session.commit()
        
        if result.rowcount > 0:
            logger.info(f"Successfully updated experiment {experiment_id} status to {status}")
            return True
        else:
            logger.warning(f"Experiment {experiment_id} not found for status update")
            return False
            
    except Exception as e:
        logger.error(f"Error updating experiment {experiment_id} status: {e}")
        await session.rollback()
        raise

async def get_experiment_with_responses(session: AsyncSession, experiment_id: str) -> dict:
    """Get experiment with its responses for status checking."""
    try:
        logger.info(f"Getting experiment {experiment_id} with responses")
        
        # Convert string to UUID if needed
        if isinstance(experiment_id, str):
            experiment_uuid = uuid.UUID(experiment_id)
        else:
            experiment_uuid = experiment_id
        
        # Get the experiment
        result = await session.execute(
            select(Experiment).where(Experiment.id == experiment_uuid)
        )
        experiment = result.scalar_one_or_none()
        
        if not experiment:
            return None
        
        # Get LLM responses if experiment is completed
        responses = []
        if experiment.status == ExperimentStatus.COMPLETED:
            from app.repositories.llm_response import get_responses_by_experiment
            responses = await get_responses_by_experiment(session, experiment_id)
        
        return {
            "id": str(experiment.id),
            "name": experiment.name,
            "status": experiment.status,
            "original_message": experiment.original_message,
            "created_at": experiment.created_at.isoformat() if experiment.created_at else None,
            "updated_at": experiment.updated_at.isoformat() if experiment.updated_at else None,
            "error_message": experiment.error_message,
            "responses": [
                {
                    "id": str(response.id),
                    "provider": response.provider,
                    "model": response.model,
                    "temperature": response.temperature,
                    "top_p": response.top_p,
                    "response_text": response.response_text,
                    "tokens_used": response.tokens_used,
                    "execution_time": response.execution_time,
                    "success": response.success,
                    "error": response.error,
                    "created_at": response.created_at.isoformat() if response.created_at else None
                }
                for response in responses
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting experiment {experiment_id} with responses: {e}")
        raise