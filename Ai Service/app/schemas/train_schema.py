from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TrainRequest(BaseModel):
    architecture: str = Field("resnet50", description="CNN backbone to train.")
    agent_type: str = Field("dqn", description="RL agent: dqn | ddpg")
    epochs: int = Field(30, ge=1, le=500)
    learning_rate: float = Field(1e-4, gt=0)
    run_name: Optional[str] = Field(None, description="MLflow run label.")


class TrainResponse(BaseModel):
    job_id: str
    status: str       # queued | running | completed | failed
    message: str
    started_at: datetime = Field(default_factory=datetime.utcnow)