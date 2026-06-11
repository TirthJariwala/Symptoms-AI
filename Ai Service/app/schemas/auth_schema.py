from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ── Register ──────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    role:      str = Field(default="clinician")

    model_config = {"str_strip_whitespace": True}


# ── Login ─────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    expires_in:    int  # seconds


# ── User info ─────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id:         UUID
    email:      str
    full_name:  Optional[str]
    role:       str
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Refresh token ─────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str