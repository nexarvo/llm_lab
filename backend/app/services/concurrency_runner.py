import sys
import asyncio
import time
from typing import Iterable, Callable, Any, List, Optional

from ..core.logger import Logger


logger = Logger(__name__)


class ConcurrencyRunner:
    """
    Run many async jobs with a concurrency limit, fail-fast behavior, optional retries,
    and logging.

    Usage example:
        runner = ConcurrencyRunner(concurrency=4, retries=2, backoff_factor=0.5)
        results = await runner.run(items, worker_coro_factory)

    Parameters:
    - concurrency: max parallel workers
    - retries: number of retries on worker exception (per item)
    - backoff_factor: base for exponential backoff in seconds
    - max_backoff: max sleep between retries

    Behavior:
    - Limits concurrency using an asyncio.Semaphore.
    - Retries worker coroutines on exception with exponential backoff.
    - Uses asyncio.TaskGroup (Python 3.11+) for clean fail-fast cancellation and capturing
      results by writing into a shared results list.
    - Falls back to asyncio.wait(..., FIRST_EXCEPTION) on older Pythons.
    - Returns a list of results aligned with the input ordering.
    - On first un-retriable exception, cancels remaining tasks and re-raises the exception.
    """

    def __init__(
        self,
        concurrency: int = 4,
        retries: int = 2,
        backoff_factor: float = 0.5,
        max_backoff: float = 4.0,
        logger_instance: Optional[Logger] = None,
    ):
        
        if concurrency < 1:
            raise ValueError("concurrency must be >= 1")
        if retries < 0:
            raise ValueError("retries must be >= 0")

        self.concurrency = concurrency
        self.retries = retries
        self.backoff_factor = backoff_factor
        self.max_backoff = max_backoff
        self.logger = logger_instance or logger

    async def _call_with_retries(self, idx: int, item: Any, worker_coro_factory: Callable[[Any], Any]):
        """Call worker_coro_factory(item) with retries and exponential backoff.
        Returns the worker result or raises the last exception after retries.
        """
        attempt = 0
        start_ts = time.time()
        while True:
            try:
                self.logger.debug(f"[runner] start idx={idx} attempt={attempt} item={item}")
                result = await worker_coro_factory(item)
                elapsed = time.time() - start_ts
                self.logger.info(f"[runner] succeeded idx={idx} attempts={attempt+1} elapsed={elapsed:.2f}s")
                return result
            except asyncio.CancelledError:
                # Propagate cancellations immediately so fail-fast works
                self.logger.debug(f"[runner] cancelled idx={idx}")
                raise
            except Exception as exc:
                attempt += 1
                self.logger.warning(
                    f"[runner] error idx={idx} attempt={attempt} error={str(exc)}"
                )
                if attempt > self.retries:
                    self.logger.error(f"[runner] giving up idx={idx} after {attempt} attempts")
                    raise
                # backoff before next attempt
                sleep_for = min(self.backoff_factor * (2 ** (attempt - 1)), self.max_backoff)
                self.logger.info(f"[runner] retrying idx={idx} in {sleep_for:.2f}s (attempt {attempt+1})")
                await asyncio.sleep(sleep_for)

    async def run(self, items: Iterable[Any], worker_coro_factory: Callable[[Any], Any]) -> List[Any]:
        items_list = list(items)
        n = len(items_list)
        results: List[Any] = [None] * n
        sem = asyncio.Semaphore(self.concurrency)

        async def _worker_write(idx: int, item: Any):
            # each worker acquires the semaphore so at most `concurrency` run concurrently
            async with sem:
                # call worker with retries
                res = await self._call_with_retries(idx, item, worker_coro_factory)
                results[idx] = res

        self.logger.info(
            f"[runner] starting run: items={n} concurrency={self.concurrency} retries={self.retries}"
        )

        # Schedule tasks and use FIRST_EXCEPTION to fail fast and cancel the rest.
        tasks = [asyncio.create_task(_worker_write(i, item)) for i, item in enumerate(items_list)]
        try:
            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)
            # If any completed task raised, detect and cancel pending tasks
            for d in done:
                if d.cancelled():
                    continue
                exc = d.exception()
                if exc:
                    self.logger.error("[runner] task failed, cancelling pending tasks", error=str(exc))
                    for p in pending:
                        p.cancel()
                    await asyncio.gather(*pending, return_exceptions=True)
                    # Re-raise the original exception
                    raise exc

            # No exceptions: ensure all results are available
            if pending:
                finished = await asyncio.gather(*pending, return_exceptions=True)
                for item in finished:
                    if isinstance(item, Exception):
                        # shouldn't happen, guard anyway
                        raise item
            self.logger.info("[runner] completed all tasks (fallback)")
            return results
        finally:
            # ensure no background tasks remain
            for t in tasks:
                if not t.done():
                    t.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
