"""
Auth API routes: signup, login, me.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional

from .base import User
from .jwt_utils import create_access_token
from .dependencies import get_auth_provider, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Request / Response models ──────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: User


# ── Routes ─────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest):
    """Create a new account and return a JWT."""
    provider = get_auth_provider()
    if provider is None:
        raise HTTPException(status_code=500, detail="Auth provider not configured")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    try:
        user = await provider.signup(body.email, body.password, body.name)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    token = create_access_token(user.id)
    return AuthResponse(token=token, user=user)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Authenticate and return a JWT."""
    provider = get_auth_provider()
    if provider is None:
        raise HTTPException(status_code=500, detail="Auth provider not configured")

    try:
        user = await provider.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    token = create_access_token(user.id)
    return AuthResponse(token=token, user=user)


@router.get("/me", response_model=User)
async def me(user: User = Depends(get_current_user)):
    """Return the current user profile."""
    return user


# ── Birth data persistence ─────────────────────────────────

class BirthDataRequest(BaseModel):
    birth_date: str         # "YYYY-MM-DD"
    birth_hour: int         # 0-23
    gender: str             # "male" / "female"
    calendar_type: Optional[str] = "solar"
    is_leap_month: Optional[bool] = False


@router.post("/birth-data", response_model=User)
async def save_birth_data(body: BirthDataRequest, user: User = Depends(get_current_user)):
    """Persist the user's birth details for auto-loading the Daily Forecast."""
    provider = get_auth_provider()
    if provider is None:
        raise HTTPException(status_code=500, detail="Auth provider not configured")

    updated = await provider.update_birth_data(
        user_id=user.id,
        birth_date=body.birth_date,
        birth_hour=body.birth_hour,
        gender=body.gender,
        calendar_type=body.calendar_type or "solar",
        is_leap_month=body.is_leap_month or False,
    )
    return updated
