"""
FastAPI dependency injection for authentication.
Provides get_optional_user (allows anonymous) and get_current_user (requires auth).
"""

from fastapi import Request, HTTPException
from typing import Optional

from .base import User
from .jwt_utils import decode_access_token

# Will be set at app startup via set_auth_provider()
_auth_provider = None


def set_auth_provider(provider):
    """Called once at app startup to inject the concrete provider."""
    global _auth_provider
    _auth_provider = provider


def get_auth_provider():
    """Return the active auth provider."""
    return _auth_provider


async def get_optional_user(request: Request) -> Optional[User]:
    """
    Extract user from Authorization header if present.
    Returns None for anonymous requests — never raises.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[7:]
    try:
        user_id = decode_access_token(token)
    except ValueError:
        return None

    if _auth_provider is None:
        return None

    return await _auth_provider.get_user_by_id(user_id)


async def get_current_user(request: Request) -> User:
    """
    Extract and validate user from Authorization header.
    Raises 401 if the token is missing, invalid, or the user is not found.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header[7:]
    try:
        user_id = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if _auth_provider is None:
        raise HTTPException(status_code=500, detail="Auth provider not configured")

    user = await _auth_provider.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
