import uuid
from sqlmodel import select
from ..core.logger import Logger
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.experiments import Experiment

logger = Logger(__name__)

async def save_experiment(session: AsyncSession, name: str) -> Experiment:
    """Insert a new experiment record."""
    try:
        logger.info(f"Creating a new experiment with name: {name}")
        experiment = Experiment(id=uuid.uuid4(), name=name)
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