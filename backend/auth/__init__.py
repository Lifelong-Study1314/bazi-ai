"""
Authentication module.
Provides abstract auth provider interface, JWT utilities, and FastAPI dependencies.
"""

from .base import AuthProvider, User, SubscriptionTier
from .jwt_utils import create_access_token, decode_access_token
from .dependencies import get_current_user, get_optional_user

__all__ = [
    "AuthProvider",
    "User",
    "SubscriptionTier",
    "create_access_token",
    "decode_access_token",
    "get_current_user",
    "get_optional_user",
]
