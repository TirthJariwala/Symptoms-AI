from app.core.constants import (
    REWARD_CORRECT_DIAGNOSIS,
    REWARD_CORRECT_REFERRAL,
    REWARD_INCORRECT_DIAGNOSIS,
    REWARD_UNNECESSARY_REFERRAL,
)
from app.core.logger import logger
from app.schemas.feedback_schema import FeedbackRequest


def compute_reward(feedback: FeedbackRequest, predicted_action: str) -> float:
    quality_scale = feedback.quality_rating / 5.0   # [0.2, 1.0]

    is_referral_action = predicted_action in (
        "refer_specialist",
        "request_further_imaging",
    )

    if feedback.correct:
        if is_referral_action:
            base_reward = REWARD_CORRECT_REFERRAL
        else:
            base_reward = REWARD_CORRECT_DIAGNOSIS
    else:
        if is_referral_action:
            base_reward = REWARD_UNNECESSARY_REFERRAL
        else:
            base_reward = REWARD_INCORRECT_DIAGNOSIS

    reward = round(base_reward * quality_scale, 4)

    logger.info(
        f"[Reward] case={feedback.case_id} | correct={feedback.correct} | "
        f"action={predicted_action} | quality={feedback.quality_rating} | "
        f"reward={reward:.4f}"
    )
    return reward