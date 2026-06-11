import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends

from app.api.dependencies import require_role
from app.core.logger import logger
from app.schemas.train_schema import TrainRequest, TrainResponse

router = APIRouter(prefix="/train", tags=["Training"])


def _run_full_pipeline(job_id: str, request: TrainRequest) -> None:
    """Background task: lazy imports prevent API startup crash."""
    logger.info(f"[Job {job_id}] Starting CNN training ({request.architecture})")
    try:
        from app.training.train_cnn import train_cnn
        from app.training.train_rl import train_rl_agent

        train_cnn(
            architecture=request.architecture,
            epochs=request.epochs,
            lr=request.learning_rate,
            run_name=request.run_name or job_id,
        )
        logger.info(f"[Job {job_id}] CNN done. Starting RL.")
        train_rl_agent(
            agent_type=request.agent_type,
            run_name=request.run_name or job_id,
        )
        logger.info(f"[Job {job_id}] Full pipeline complete.")
    except Exception as exc:
        logger.error(f"[Job {job_id}] Training failed: {exc}", exc_info=True)


@router.post(
    "",
    response_model=TrainResponse,
    summary="Trigger CNN + RL training pipeline",
    dependencies=[Depends(require_role("admin", "data_scientist"))],
)
async def trigger_training(
    request: TrainRequest,
    background_tasks: BackgroundTasks,
) -> TrainResponse:
    job_id = str(uuid.uuid4())[:8]
    background_tasks.add_task(_run_full_pipeline, job_id, request)
    logger.info(f"Training job queued | job_id={job_id} | arch={request.architecture}")

    return TrainResponse(
        job_id=job_id,
        status="queued",
        message=f"Training job {job_id} queued. CNN: {request.architecture}, RL: {request.agent_type}.",
        started_at=datetime.now(timezone.utc),
    )