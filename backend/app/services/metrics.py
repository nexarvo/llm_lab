from typing import List, Dict, Any
import os
from pathlib import Path
import nltk
import textstat
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.llm_response import LLMResponse
from app.repositories.llm_response import get_responses_by_experiment
from ..core.logger import Logger


logger = Logger(__name__)


def ensure_nltk_data_available(bundled_path: str | None = None) -> None:
    """Ensure NLTK cmudict data is available by appending a bundled path.

    This function will:
    - Prefer an explicit `bundled_path` if provided.
    - Otherwise use the repository relative path `app/data/nltk_data`.
    - Append the path to `nltk.data.path` if not already present.
    - Attempt to load `nltk.corpus.cmudict.dict()` and raise a RuntimeError if missing.
    """
    # Determine the path to bundled NLTK data
    if bundled_path:
        path = os.path.abspath(bundled_path)
    else:
        # default repo-relative path: <repo>/app/data/nltk_data
        # metrics.py is at <repo>/app/services/metrics.py, so parents[1] points to <repo>/app
        repo_root = Path(__file__).resolve().parents[1]
        path = str(repo_root / "data" / "nltk_data")

    # Append to nltk data path if not present
    if path not in nltk.data.path:
        logger.info(f"Adding bundled NLTK data path: {path}")
        nltk.data.path.insert(0, path)

    # Debug: report current nltk.data.path for troubleshooting
    logger.info(f"NLTK data search paths: {nltk.data.path}")

    # Verify existence of the expected cmudict folder before trying to load
    cmu_path = os.path.join(path, "corpora", "cmudict")
    cmu_exists = os.path.exists(cmu_path)
    logger.info(f"Checked cmudict folder exists at: {cmu_path} -> {cmu_exists}")

    # Verify availability of cmudict via nltk
    try:
        nltk.corpus.cmudict.dict()
        logger.info(f"NLTK cmudict loaded successfully from: {path}")
    except LookupError as e:
        msg = (
            "NLTK corpus 'cmudict' not found at the bundled path. "
            "Make sure app/data/nltk_data/corpora/cmudict exists and is committed to the repo."
        )
        logger.error(msg)
        raise RuntimeError(msg) from e

def generate_quality_charts(responses: List[LLMResponse]) -> List[Dict[str, Any]]:
    """
    Generate three user-friendly quality metrics for all responses, ready for bar chart plotting.
    
    Each metric includes:
        - name
        - description
        - value
        - graph type
        - plot data with x_axis, y_axis, data, and labels
    """
    if not responses:
        return []

    # ensure NLTK data (cmudict) is available from the bundled location
    ensure_nltk_data_available()

    # Labels for each bar: "ModelName (temp=0.5, top_p=0.8)"
    labels = [f"{r.model}\n(temp={r.temperature}, top_p={r.top_p})" for r in responses]

    # Compute metrics
    readability_ease = [round(textstat.flesch_reading_ease(r.response_text), 2) for r in responses]
    reading_grade = [round(textstat.flesch_kincaid_grade(r.response_text), 2) for r in responses]
    text_complexity = [round(textstat.gunning_fog(r.response_text), 2) for r in responses]

    # Prepare chart objects
    charts = [
        {
            "name": "Readability Ease",
            "description": "How easy it is to read the text (higher is easier).",
            "value": readability_ease,
            "graph": "bar",
            "plot": {
                "x_axis": "Responses",
                "y_axis": "Ease Score",
                "data": readability_ease,
                "labels": labels  # bar labels
            }
        },
        {
            "name": "Reading Grade Level",
            "description": "The US school grade level needed to understand the text.",
            "value": reading_grade,
            "graph": "bar",
            "plot": {
                "x_axis": "Responses",
                "y_axis": "Grade Level",
                "data": reading_grade,
                "labels": labels
            }
        },
        {
            "name": "Text Complexity",
            "description": "How complex the text is based on sentence length and difficult words.",
            "value": text_complexity,
            "graph": "bar",
            "plot": {
                "x_axis": "Responses",
                "y_axis": "Complexity Score",
                "data": text_complexity,
                "labels": labels
            }
        }
    ]

    return charts

async def get_experiment_metrics(experiment_id: str) -> List[Dict[str, Any]]:
    """
    Gets quality metrics for a given experiment.
    """
    try:
        logger.info(f"Starting to get metrics for experiment with id: {experiment_id}")

        from app.db.session import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            logger.info(f"Fetching responses for experiment id: {experiment_id}")
            responses = await get_responses_by_experiment(session, experiment_id)

            if not responses:
                logger.warning(f"No responses found for experiment id: {experiment_id}")
                return []

            metrics = generate_quality_charts(responses)
            logger.info(f"Successfully got metrics for experiment with id: {experiment_id}")

            return metrics

    except Exception as e:
        logger.error(f"Error getting metrics for experiment: {experiment_id}, error: {e}")
        raise