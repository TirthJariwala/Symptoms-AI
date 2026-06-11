"""
app/api/routes/auth.py
───────────────────────
Authentication endpoints.
    POST /api/v1/auth/register  → create account
    POST /api/v1/auth/login     → get JWT tokens
    POST /api/v1/auth/refresh   → refresh access token
    GET  /api/v1/auth/me        → get current user info
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.logger import logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.db.crud import (
    create_audit_log,
    create_user,
    get_user_by_email,
    update_last_login,
)
from app.db.database import get_db
from app.schemas.auth_schema import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Register ──────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    request: RegisterRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Create a new user account.
    Roles: clinician | admin | data_scientist | radiologist
    """
    # Check email not already taken
    existing = await get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Validate role
    allowed_roles = {"clinician", "admin", "data_scientist", "radiologist"}
    if request.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed: {allowed_roles}",
        )

    user = await create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
    )

    await create_audit_log(
        db=db,
        action="register",
        user_id=user.id,
        details={"email": request.email, "role": request.role},
        ip_address=req.client.host if req.client else None,
    )

    logger.info(f"New user registered: {request.email} | role={request.role}")
    return UserResponse.model_validate(user)


# ── Login ─────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT access + refresh tokens",
)
async def login(
    request: LoginRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate with email + password.
    Returns an access token (1 hour) and refresh token (7 days).
    """
    user = await get_user_by_email(db, request.email)

    # Check user exists and password is correct
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact admin.",
        )

    # Generate tokens
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token  = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Update last login
    await update_last_login(db, user)

    # Audit log
    await create_audit_log(
        db=db,
        action="login",
        user_id=user.id,
        details={"email": user.email},
        ip_address=req.client.host if req.client else None,
    )

    logger.info(f"User logged in: {user.email} | role={user.role}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── Refresh Token ─────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an expired access token",
)
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Exchange a valid refresh token for a new access token.
    """
    payload = decode_token(request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user = await get_user_by_email(db, payload.get("email", ""))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    token_data    = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token  = create_access_token(token_data)
    refresh_token_new = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_new,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── Me ────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged-in user info",
)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Return the profile of the currently authenticated user.
    Requires a valid Bearer token.
    """
    user = await get_user_by_email(db, current_user.get("email", ""))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return UserResponse.model_validate(user)