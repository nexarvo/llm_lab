import asyncio
import time
from typing import List, Dict, Any, Tuple
from ..validations.llm_requests import LLMRequest, LLMResponse, LLMResult
from ..utils.parameter_calculator import generate_parameter_combinations
from ..llm_providers.factory import LLMProviderFactory
from ..config import Config
from ..core.logger import Logger
from ..services.concurrency_runner import ConcurrencyRunner
from app.db.session import AsyncSessionLocal
from app.repositories.experiments import save_experiment
from app.repositories.llm_response import save_responses_transaction


logger = Logger(__name__)

class LLMProviderError(Exception):
    """Raised when an LLM provider returns a semantic/validation failure or a hard timeout."""
    pass

class LLMService:
    """Service class for handling LLM requests"""
    
    def __init__(self):
        self.provider_factory = LLMProviderFactory()
    
    async def process_llm_request(self, request: LLMRequest) -> LLMResponse:
        """
        Process LLM request based on single_llm flag
        
        Args:
            request: Validated LLM request
            
        Returns:
            LLMResponse with results
        """
        start_time = time.time()
        results = []
        experiment_id = ""
        
        try:
            logger.info(
                f"Processing LLM request: single_llm={request.single_llm}, models={request.models}",
                single_llm=request.single_llm,
                models=request.models,
                temperatures=request.temperatures,
                top_ps=request.top_ps
            )
            
            if request.single_llm:
                # Use single LLM with parameter variations
                logger.info(f"Using single LLM mode with parameter variations for model: {request.models[0]}")
                results = await self._process_single_llm_with_variations(request)
            else:
                # Use multiple LLMs with single parameters
                logger.info(f"Using multiple LLM mode with {len(request.models)} models: {request.models}")
                results = await self._process_multiple_llms(request)
                
            # Save experiment and responses to the database
            try:
                async with AsyncSessionLocal() as db_session:
                    # create an experiment record; use provided name if available otherwise timestamp
                    exp_name = getattr(request, "experiment_name", None) or f"exp_{int(time.time())}"
                    experiment = await save_experiment(db_session, name=exp_name)
                    experiment_id = experiment.id

                    # save all responses in a single transaction
                    # repository expects list[dict]; our `results` is already a list of dicts
                    created = await save_responses_transaction(db_session, experiment.id, results)
                    logger.info(
                        "Saved experiment and responses to database",
                        experiment_id=str(experiment.id),
                        created_responses=len(created),
                    )
            except Exception as db_exc:
                # Log DB errors but do not fail the entire request — metrics should not block the LLM path
                logger.error(
                    "Failed to persist experiment/responses to DB",
                    error=str(db_exc)
                )
            
            execution_time = time.time() - start_time
            successful_requests = sum(1 for result in results if result.get('success', False))
            failed_requests = len(results) - successful_requests
            
            logger.info(
                f"LLM request completed: {successful_requests} successful, {failed_requests} failed, {execution_time:.2f}s",
                successful_requests=successful_requests,
                failed_requests=failed_requests,
                execution_time=execution_time
            )
            
            return LLMResponse(
                success=True,
                experiment_id=str(experiment_id),
                results=results,
                total_requests=len(results),
                successful_requests=successful_requests,
                failed_requests=failed_requests,
                execution_time=execution_time,
                message="Request processed successfully"
            )
            
            
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                f"LLM request failed: {str(e)}",
                error=str(e),
                execution_time=execution_time,
                models=request.models
            )
            raise
    
    async def _process_single_llm_with_variations(self, request: LLMRequest) -> List[Dict[str, Any]]:
        """
        Process single LLM with parameter variations
        
        Args:
            request: LLM request
            
        Returns:
            List of results
        """
        try:
            # there will be only one model in the request
            model_id = request.models[0]
            
            # Check if mock mode is enabled by user
            if request.mock_mode:
                logger.info("Using mock LLM provider for testing (user requested)")
                provider_type = "mock"
                model_id = "mock-model"
            else:
                provider_type = Config.get_provider_for_model(model_id)
            
            # Calculate parameter variations
            parameter_combinations = generate_parameter_combinations(
                request.temperatures,
                request.top_ps
            )
            
            # Create provider
            provider = self.provider_factory.create_provider(
                provider_type=provider_type,
                api_key=Config.get_api_key(provider_type),
                base_url=Config.get_base_url(provider_type)
            )
            
            # Build runner (reads concurrency from config; fall back to 4)
            runner = ConcurrencyRunner(
                concurrency=Config.LLM_CONCURRENCY,
                retries=Config.LLM_RETRIES,
                backoff_factor=Config.LLM_BACKOFF_FACTOR,
                logger_instance=logger
            )

            # Worker factory: given a (temp, top_p) tuple, call the LLM and return the result dict
            async def _single_call_factory(params: Tuple[float, float]):
                temp, top_p = params
                try:
                    return await self._execute_llm_request(
                        provider=provider,
                        prompt=request.prompt,
                        temperature=temp,
                        top_p=top_p,
                        model=model_id,
                        provider_name=provider_type
                    )
                except Exception as e:
                    raise

            # Run all calls with limited concurrency and fail-fast semantics.
            # If any call raises after retries, runner.run will raise and cancel others.
            try:
                raw_results = await runner.run(parameter_combinations, _single_call_factory)
            except Exception as exc:
                logger.error(
                    "One or more LLM calls failed during parameter sweep",
                    error=str(exc),
                    model=model_id,
                    temperatures=request.temperatures,
                    top_ps=request.top_ps
                )
                # Bubble up so caller can perform atomic error handling
                raise

            # raw_results is a list aligned with parameter_combinations; build processed_results similarly
            processed_results: List[Dict[str, Any]] = []
            for i, (temp, top_p) in enumerate(parameter_combinations):
                result = raw_results[i]
                # result is expected to be the dict returned by _execute_llm_request
                if isinstance(result, Exception):
                    processed_results.append({
                        'provider': provider_type,
                        'model': model_id,
                        'temperature': temp,
                        'top_p': top_p,
                        'response': '',
                        'tokens_used': 0,
                        'execution_time': 0,
                        'success': False,
                        'error': str(result)
                    })
                else:
                    processed_results.append(result)

            return processed_results
        except Exception as e:
            logger.error(
                f"Error processing single LLM with parameter variations: {str(e)}",
                error=str(e),
                temperatures=request.temperatures,
                top_ps=request.top_ps
            )
            raise Exception(f"Error processing single LLM with parameter variations: {str(e)}")
        
    
    async def _process_multiple_llms(self, request: LLMRequest) -> List[Dict[str, Any]]:
        """
        Process multiple LLMs with single parameters (one temp/top_p applied to all models)

        Mirrors the concurrency, timeout, and error normalization approach used in
        _process_single_llm_with_variations.
        """
        try:
            # Select a single temperature/top_p to use for all models
            # Expect the client to provide exactly one element, but be defensive and pick the first.
            temperature = float(request.temperatures[0]) if request.temperatures else 0.7
            top_p = float(request.top_ps[0]) if request.top_ps else 0.9

            # Build runner to execute calls concurrently with retries/backoff
            runner = ConcurrencyRunner(
                concurrency=Config.LLM_CONCURRENCY,
                retries=Config.LLM_RETRIES,
                backoff_factor=Config.LLM_BACKOFF_FACTOR,
                logger_instance=logger,
            )

            # Worker: given model_id, resolve provider and execute the request
            async def _single_call_factory(model_id: str):
                provider_type = Config.get_provider_for_model(model_id)
                provider = self.provider_factory.create_provider(
                    provider_type=provider_type,
                    api_key=Config.get_api_key(provider_type),
                    base_url=Config.get_base_url(provider_type),
                )
                try:
                    return await self._execute_llm_request(
                        provider=provider,
                        prompt=request.prompt,
                        temperature=temperature,
                        top_p=top_p,
                        model=model_id,
                        provider_name=provider_type,
                    )
                except Exception as e:
                    # Bubble up; runner will handle retries/fail-fast
                    raise

            # Run all model calls concurrently
            try:
                raw_results = await runner.run(request.models, _single_call_factory)
            except Exception as exc:
                logger.error(
                    "One or more LLM calls failed in multi-LLM mode",
                    error=str(exc),
                    models=request.models,
                    temperature=temperature,
                    top_p=top_p,
                )
                # Propagate to caller so top-level can handle as needed
                raise

            # Normalize results list
            processed_results: List[Dict[str, Any]] = []
            for i, model_id in enumerate(request.models):
                result = raw_results[i]
                if isinstance(result, Exception):
                    provider_type = Config.get_provider_for_model(model_id)
                    processed_results.append({
                        'provider': provider_type,
                        'model': model_id,
                        'temperature': temperature,
                        'top_p': top_p,
                        'response': '',
                        'tokens_used': 0,
                        'execution_time': 0,
                        'success': False,
                        'error': str(result),
                    })
                else:
                    processed_results.append(result)

            return processed_results
        except Exception as e:
            logger.error(
                f"Error processing multiple LLMs: {str(e)}",
                error=str(e),
                models=request.models,
                temperatures=request.temperatures,
                top_ps=request.top_ps,
            )
            raise
    
    async def _execute_llm_request(
        self,
        provider,
        prompt: str,
        temperature: float,
        top_p: float,
        model: str,
        provider_name: str
    ) -> Dict[str, Any]:
        """
        Execute a single LLM request and raise on semantic/provider failures so the
        ConcurrencyRunner can fail-fast and cancel remaining tasks.
        """
        # determine per-call timeout (allow Config to provide it, else default to 30s)
        per_call_timeout = getattr(Config, 'PER_CALL_TIMEOUT', None) or getattr(Config, 'PER_CALL_TIMEOUT_SECONDS', None) or 30

        try:
            # If the provider supports timeout natively, it may accept a timeout param.
            # We wrap with asyncio.wait_for to enforce a hard timeout regardless.
            coro = provider.generate_response(
                prompt=prompt,
                temperature=temperature,
                top_p=top_p,
                model=model
            )
            result = await asyncio.wait_for(coro, timeout=per_call_timeout)
        except asyncio.TimeoutError as exc:
            logger.error(
                "LLM call timed out",
                model=model,
                temperature=temperature,
                top_p=top_p,
                timeout_seconds=per_call_timeout
            )
            raise LLMProviderError(f"timeout after {per_call_timeout}s for model={model}") from exc
        except Exception as exc:
            # Transport / SDK errors should propagate so runner can retry / fail-fast
            logger.error(
                "LLM provider exception",
                model=model,
                error=str(exc)
            )
            raise

        # Basic validation of returned payload — treat anything unexpected as failure
        if not result:
            logger.error(
                "LLM returned empty result",
                model=model,
                temperature=temperature,
                top_p=top_p,
                raw=result
            )
            raise LLMProviderError("empty result from LLM")

        # If provider returns a dict with explicit success flag, treat false as failure
        if isinstance(result, dict) and result.get("success") is False:
            logger.error(
                "LLM returned success=False",
                model=model,
                temperature=temperature,
                top_p=top_p,
                raw=result
            )
            raise LLMProviderError(f"LLM signalled failure: {result.get('error')!r}")

        # Extract response text safely
        response_text = ""
        if isinstance(result, dict):
            response_text = (result.get("response") or "").strip()
        elif isinstance(result, str):
            response_text = result.strip()

        if not response_text:
            logger.error(
                "LLM returned empty response_text",
                model=model,
                temperature=temperature,
                top_p=top_p,
                raw=result
            )
            raise LLMProviderError("LLM returned empty response")

        # Normalize and return successful response
        return {
            'provider': provider_name,
            'model': model,
            'temperature': temperature,
            'top_p': top_p,
            'response': response_text,
            'tokens_used': result.get('tokens_used', 0) if isinstance(result, dict) else 0,
            'execution_time': result.get('execution_time', 0) if isinstance(result, dict) else 0,
            'success': True,
            'error': None
        }
