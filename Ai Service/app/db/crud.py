from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models import AuditLog, Feedback, Prediction, User


# ── User operations ───────────────────────────────────────────────

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Fetch a user by email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Fetch a user by their UUID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    role: str = "clinician",
) -> User:
    """
    Create a new user with a hashed password.

    Args:
        db:        Database session.
        email:     User email (must be unique).
        password:  Plain-text password (will be hashed).
        full_name: Optional display name.
        role:      User role (clinician | admin | data_scientist | radiologist).

    Returns:
        Newly created User object.
    """
    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()   # get the generated UUID without committing
    return user


async def update_last_login(db: AsyncSession, user: User) -> None:
    """Update the user's last login timestamp."""
    user.last_login = datetime.now(timezone.utc)
    await db.flush()


async def get_all_users(db: AsyncSession) -> List[User]:
    """Return all users — admin only."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def deactivate_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Soft-delete a user by deactivating their account."""
    user = await get_user_by_id(db, user_id)
    if user:
        user.is_active = False
        await db.flush()
    return user


# ── Prediction operations ─────────────────────────────────────────

async def create_prediction(
    db: AsyncSession,
    case_id: str,
    user_id: UUID,
    cnn_architecture: str,
    primary_diagnosis: str,
    confidence: float,
    predictions_json: dict,
    severity: str,
    low_confidence_flag: bool,
    action: str,
    action_rationale: str,
    gradcam_url: Optional[str] = None,
    image_path: Optional[str] = None,
    patient_age: Optional[int] = None,
    patient_sex: Optional[str] = None,
    clinical_notes: Optional[str] = None,
) -> Prediction:
    """Save a prediction result to the database."""
    prediction = Prediction(
        case_id=case_id,
        user_id=user_id,
        cnn_architecture=cnn_architecture,
        primary_diagnosis=primary_diagnosis,
        confidence=confidence,
        predictions_json=predictions_json,
        severity=severity,
        low_confidence_flag=low_confidence_flag,
        action=action,
        action_rationale=action_rationale,
        gradcam_url=gradcam_url,
        image_path=image_path,
        patient_age=patient_age,
        patient_sex=patient_sex,
        clinical_notes=clinical_notes,
    )
    db.add(prediction)
    await db.flush()
    return prediction


async def get_prediction_by_case_id(
    db: AsyncSession, case_id: str
) -> Optional[Prediction]:
    """Fetch a prediction by case ID."""
    result = await db.execute(
        select(Prediction).where(Prediction.case_id == case_id)
    )
    return result.scalar_one_or_none()


async def get_predictions_by_user(
    db: AsyncSession, user_id: UUID, limit: int = 50
) -> List[Prediction]:
    """Fetch the most recent predictions for a user."""
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Feedback operations ───────────────────────────────────────────

async def create_feedback(
    db: AsyncSession,
    case_id: str,
    user_id: UUID,
    clinician_id: str,
    correct: bool,
    quality_rating: int,
    reward_computed: float,
    comment: Optional[str] = None,
    escalate: bool = False,
) -> Feedback:
    """Save clinician feedback to the database."""
    feedback = Feedback(
        case_id=case_id,
        user_id=user_id,
        clinician_id=clinician_id,
        correct=correct,
        quality_rating=quality_rating,
        comment=comment,
        escalate=escalate,
        reward_computed=reward_computed,
    )
    db.add(feedback)
    await db.flush()
    return feedback


# ── Audit log operations ──────────────────────────────────────────

async def create_audit_log(
    db: AsyncSession,
    action: str,
    user_id: Optional[UUID] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Write an audit log entry (HIPAA compliance)."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(log)
    await db.flush()
    return log