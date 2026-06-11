from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    case_id: str = Field(..., description="Case ID returned by /predict.")
    correct: bool = Field(..., description="True if the prediction was clinically correct.")
    quality_rating: int = Field(
        ..., ge=1, le=5, description="1–5 Likert quality score."
    )
    comment: Optional[str] = Field(None, max_length=1000)
    escalate: bool = Field(False, description="Flag for senior review.")
    clinician_id: str = Field(..., description="Authenticated clinician identifier.")


class FeedbackResponse(BaseModel):
    case_id: str
    reward_computed: float
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)