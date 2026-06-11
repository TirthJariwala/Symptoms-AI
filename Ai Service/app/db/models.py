import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Float,
    ForeignKey, Integer, String, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Users ─────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name       = Column(String(255), nullable=True)
    role            = Column(String(50), nullable=False, default="clinician")
    # Roles: admin | clinician | data_scientist | radiologist
    is_active       = Column(Boolean, default=True, nullable=False)
    is_verified     = Column(Boolean, default=False, nullable=False)
    created_at      = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at      = Column(DateTime(timezone=True), default=_now, onupdate=_now)
    last_login      = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    predictions = relationship("Prediction", back_populates="user", lazy="selectin")
    feedback    = relationship("Feedback",   back_populates="user", lazy="selectin")
    audit_logs  = relationship("AuditLog",   back_populates="user", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User {self.email} role={self.role}>"


# ── Predictions ───────────────────────────────────────────────────

class Prediction(Base):
    __tablename__ = "predictions"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id             = Column(String(100), unique=True, nullable=False, index=True)
    user_id             = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # CNN output
    cnn_architecture    = Column(String(50), nullable=False, default="resnet50")
    primary_diagnosis   = Column(String(100), nullable=False)
    confidence          = Column(Float, nullable=False)
    predictions_json    = Column(JSON, nullable=False)   # full class→prob dict
    severity            = Column(String(20), nullable=False, default="normal")
    low_confidence_flag = Column(Boolean, default=False)

    # RL output
    action              = Column(String(100), nullable=False)
    action_rationale    = Column(Text, nullable=True)

    # Explainability
    gradcam_url         = Column(String(500), nullable=True)

    # Patient metadata (optional, HIPAA-safe)
    patient_age         = Column(Integer, nullable=True)
    patient_sex         = Column(String(1), nullable=True)
    clinical_notes      = Column(Text, nullable=True)

    # File info
    image_path          = Column(String(500), nullable=True)
    model_version       = Column(String(20), default="1.0.0")

    created_at          = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relationships
    user     = relationship("User",     back_populates="predictions")
    feedback = relationship("Feedback", back_populates="prediction", uselist=False)

    def __repr__(self) -> str:
        return f"<Prediction {self.case_id} diagnosis={self.primary_diagnosis}>"


# ── Feedback ──────────────────────────────────────────────────────

class Feedback(Base):
    __tablename__ = "feedback"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id          = Column(String(100), ForeignKey("predictions.case_id"), nullable=False, index=True)
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    clinician_id     = Column(String(100), nullable=False)

    correct          = Column(Boolean, nullable=False)
    quality_rating   = Column(Integer, nullable=False)   # 1–5
    comment          = Column(Text, nullable=True)
    escalate         = Column(Boolean, default=False)

    # RL reward computed from this feedback
    reward_computed  = Column(Float, nullable=True)

    created_at       = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relationships
    user       = relationship("User",       back_populates="feedback")
    prediction = relationship("Prediction", back_populates="feedback")

    def __repr__(self) -> str:
        return f"<Feedback case={self.case_id} correct={self.correct}>"


# ── Audit Logs ────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action     = Column(String(100), nullable=False)   # login | predict | feedback | train
    details    = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relationship
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog action={self.action} user={self.user_id}>"