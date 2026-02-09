"""
Abstract auth provider interface and shared models.
All concrete providers (mock, supabase, etc.) must implement AuthProvider.
"""

from abc import ABC, abstractmethod
from enum import Enum
from pydantic import BaseModel
from typing import Optional


class SubscriptionTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"


class User(BaseModel):
    """Canonical user representation shared across all providers."""
    id: str
    email: str
    name: Optional[str] = None
    tier: SubscriptionTier = SubscriptionTier.FREE
    stripe_customer_id: Optional[str] = None
    created_at: str  # ISO-8601
    # One-time purchase: premium until this datetime (ISO-8601); used with WeChat/Alipay
    premium_until: Optional[str] = None
    # Birth data (persisted so the Daily Forecast tab auto-loads)
    birth_date: Optional[str] = None       # "YYYY-MM-DD" (solar)
    birth_hour: Optional[int] = None       # 0-23
    gender: Optional[str] = None           # "male" / "female"
    calendar_type: Optional[str] = None    # "solar" / "lunar"
    is_leap_month: Optional[bool] = None


class AuthProvider(ABC):
    """
    Abstract base class for authentication providers.
    Implement this to swap between mock (SQLite), Supabase, etc.
    """

    @abstractmethod
    async def startup(self) -> None:
        """Initialise resources (e.g. create DB tables)."""
        ...

    @abstractmethod
    async def signup(self, email: str, password: str, name: Optional[str] = None) -> User:
        """Create a new user account. Raise ValueError on duplicate email."""
        ...

    @abstractmethod
    async def login(self, email: str, password: str) -> User:
        """Authenticate and return user. Raise ValueError on bad credentials."""
        ...

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Look up a user by primary key."""
        ...

    @abstractmethod
    async def update_user_tier(self, user_id: str, tier: SubscriptionTier) -> User:
        """Change a user's subscription tier."""
        ...

    @abstractmethod
    async def update_stripe_customer_id(self, user_id: str, customer_id: str) -> User:
        """Store the Stripe customer ID against the user."""
        ...

    @abstractmethod
    async def get_user_by_stripe_customer_id(self, customer_id: str) -> Optional[User]:
        """Look up a user by their Stripe customer ID."""
        ...

    @abstractmethod
    async def update_premium_until(self, user_id: str, premium_until_iso: str) -> User:
        """Set premium access until the given datetime (ISO-8601); for one-time purchases."""
        ...

    @abstractmethod
    async def update_birth_data(
        self,
        user_id: str,
        birth_date: str,
        birth_hour: int,
        gender: str,
        calendar_type: str = "solar",
        is_leap_month: bool = False,
    ) -> User:
        """Persist the user's birth details for auto-loading forecasts."""
        ...
