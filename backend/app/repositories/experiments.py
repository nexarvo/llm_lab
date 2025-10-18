from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.experiment import Experiment


async def save_experiment(session: AsyncSession, name: str) -> Experiment:
    """Insert a new experiment record."""
    experiment = Experiment(name=name)
    session.add(experiment)
    await session.commit()
    await session.refresh(experiment)
    return experiment


async def get_experiment_by_id(session: AsyncSession, experiment_id: int) -> Experiment | None:
    """Fetch an experiment by ID."""
    result = await session.execute(select(Experiment).where(Experiment.id == experiment_id))
    return result.scalar_one_or_none()

async def get_all_experiments(session: AsyncSession) -> list[Experiment]:
    """Fetch all experiments."""
    result = await session.execute(select(Experiment))
    return result.scalars().all()