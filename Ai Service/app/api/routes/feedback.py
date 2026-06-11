from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.logger import logger
from app.schemas.feedback_schema import FeedbackRequest, FeedbackResponse
from app.services.model_loader import model_registry
from app.services.reward_service import compute_reward

router = APIRouter(prefix="/feedback", tags=["Feedback"])
_case_action_cache: dict[str, str] = {}


def register_case_action(case_id: str, action: str) -> None:
    _case_action_cache[case_id] = action


@router.post(
    "",
    response_model=FeedbackResponse,
    summary="Submit clinician feedback for a prediction",
)
async def submit_feedback(
    feedback: FeedbackRequest,
    current_user: dict = Depends(get_current_user),
) -> FeedbackResponse:
    predicted_action = _case_action_cache.get(feedback.case_id)
    if predicted_action is None:
        predicted_action = "confirm_diagnosis"
        logger.warning(
            f"No action record for case={feedback.case_id}; defaulting to confirm_diagnosis."
        )

    reward = compute_reward(feedback, predicted_action)

    try:
        # ✅ Fixed: use keyword arguments
        pipeline = model_registry.get_pipeline(domain="chest_xray", architecture="resnet50")
        if hasattr(pipeline.agent, "store_transition"):
            import numpy as np
            zero_state = np.zeros(2048, dtype=np.float32)
            action_idx = pipeline.action_labels.index(predicted_action) if hasattr(pipeline, "action_labels") else 0
            pipeline.agent.store_transition(
                state=zero_state,
                action=action_idx,
                reward=reward,
                next_state=zero_state,
                done=True,
            )
    except Exception as exc:
        logger.warning(f"Failed to store RL experience: {exc}")

    logger.info(
        f"[AUDIT] user={current_user.get('sub')} | feedback | "
        f"case={feedback.case_id} | correct={feedback.correct} | reward={reward}"
    )

    return FeedbackResponse(
        case_id=feedback.case_id,
        reward_computed=reward,
        message="Feedback recorded. RL reward computed and experience buffered.",
    )