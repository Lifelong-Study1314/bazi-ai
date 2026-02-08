"""
JWT token creation and verification.
Uses HS256 symmetric signing with a secret from config.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

from config import get_settings

ALGORITHM = "HS256"
DEFAULT_EXPIRE_DAYS = 7


def _get_secret() -> str:
    return get_settings().jwt_secret


def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT containing the user_id as 'sub'."""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=DEFAULT_EXPIRE_DAYS))
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, _get_secret(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """
    Decode a JWT and return the user_id ('sub' claim).
    Raises ValueError if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise ValueError("Token missing 'sub' claim")
        return user_id
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
