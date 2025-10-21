"""
Background task service for handling long-running LLM operations
"""
import asyncio
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from app.db.session import AsyncSessionLocal
from app.repositories.experiments import update_experiment_status, get_experiment_with_responses
from app.services.llm_service import LLMService
from app.validations.llm_requests import LLMRequest
from app.consts import ExperimentStatus
from app.core.logger import logger


class BackgroundTaskService:
    """Service for managing background LLM tasks"""
    
    def __init__(self):
        self.llm_service = LLMService()
        self.running_tasks: Dict[str, asyncio.Task] = {}
    
    async def start_llm_experiment(
        self, 
        experiment_id: str, 
        request: LLMRequest
    ) -> str:
        """
        Start a background LLM experiment
        
        Args:
            experiment_id: ID of the experiment
            request: LLM request to process
            
        Returns:
            Experiment ID
        """
        # Update experiment status to running in database
        async with AsyncSessionLocal() as session:
            await update_experiment_status(
                session, 
                experiment_id, 
                ExperimentStatus.RUNNING
            )
        
        # Create and store the background task
        task = asyncio.create_task(
            self._process_llm_experiment(experiment_id, request)
        )
        self.running_tasks[experiment_id] = task
        
        logger.info(f"Started background LLM experiment: {experiment_id}")
        return experiment_id
    
    async def _process_llm_experiment(
        self, 
        experiment_id: str, 
        request: LLMRequest
    ) -> None:
        """
        Process LLM experiment in background
        
        Args:
            experiment_id: ID of the experiment
            request: LLM request to process
        """
        try:
            logger.info(f"Processing LLM experiment: {experiment_id}")
            
            # Process the LLM request
            result = await self.llm_service.process_llm_request(experiment_id, request)
            
            # Update experiment status to completed in database
            async with AsyncSessionLocal() as session:
                await update_experiment_status(
                    session, 
                    experiment_id, 
                    ExperimentStatus.COMPLETED
                )
            
            logger.info(f"Completed LLM experiment: {experiment_id}")
            
        except Exception as e:
            logger.error(f"Failed LLM experiment {experiment_id}: {str(e)}")
            
            # Update experiment status to failed in database
            async with AsyncSessionLocal() as session:
                await update_experiment_status(
                    session, 
                    experiment_id, 
                    ExperimentStatus.FAILED,
                    error_message=str(e)
                )
            
        finally:
            # Remove task from running tasks
            if experiment_id in self.running_tasks:
                del self.running_tasks[experiment_id]
    
    async def cancel_experiment(self, experiment_id: str) -> bool:
        """
        Cancel a running experiment
        
        Args:
            experiment_id: ID of the experiment to cancel
            
        Returns:
            True if cancelled successfully, False otherwise
        """
        try:
            # Cancel the background task if it exists
            if experiment_id in self.running_tasks:
                task = self.running_tasks[experiment_id]
                task.cancel()
                del self.running_tasks[experiment_id]
                
                # Update status to cancelled in database
                async with AsyncSessionLocal() as session:
                    await update_experiment_status(
                        session, 
                        experiment_id, 
                        ExperimentStatus.CANCELLED
                    )
                
                logger.info(f"Cancelled experiment: {experiment_id}")
                return True
            else:
                logger.warning(f"Experiment {experiment_id} not found in running tasks")
                return False
                
        except Exception as e:
            logger.error(f"Failed to cancel experiment {experiment_id}: {str(e)}")
            return False
    
    async def get_experiment_status(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get experiment status and results from database
        
        Args:
            experiment_id: ID of the experiment
            
        Returns:
            Experiment status and results if available
        """
        try:
            async with AsyncSessionLocal() as session:
                return await get_experiment_with_responses(session, experiment_id)
                
        except Exception as e:
            logger.error(f"Failed to get experiment status {experiment_id}: {str(e)}")
            return None
    
    def is_experiment_running(self, experiment_id: str) -> bool:
        """
        Check if an experiment is currently running
        
        Args:
            experiment_id: ID of the experiment
            
        Returns:
            True if running, False otherwise
        """
        return experiment_id in self.running_tasks


# Global background task service instance
background_task_service = BackgroundTaskService()
