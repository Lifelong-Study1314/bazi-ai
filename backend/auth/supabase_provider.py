"""
Supabase auth provider — production-grade replacement for MockAuthProvider.
Uses Supabase Postgres as the backing store; manages passwords ourselves
(bcrypt) and issues our own JWTs (python-jose).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

import bcrypt
from supabase import create_client, Client

from .base import AuthProvider, User, SubscriptionTier


class SupabaseAuthProvider(AuthProvider):
    """Supabase-backed authentication provider."""

    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
        self.table = "users"

    # ── lifecycle ──────────────────────────────────────────────

    async def startup(self) -> None:
        """No-op — table is created via Supabase SQL editor / migrations."""
        pass

    # ── helpers ────────────────────────────────────────────────

    @staticmethod
    def _hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def _verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    @staticmethod
    def _row_to_user(row: dict) -> User:
        return User(
            id=str(row["id"]),
            email=row["email"],
            name=row.get("name"),
            tier=SubscriptionTier(row.get("tier", "free")),
            stripe_customer_id=row.get("stripe_customer_id"),
            created_at=row.get("created_at", ""),
            premium_until=row.get("premium_until"),
            birth_date=row.get("birth_date"),
            birth_hour=row.get("birth_hour"),
            gender=row.get("gender"),
            calendar_type=row.get("calendar_type"),
            is_leap_month=row.get("is_leap_month"),
        )

    # ── AuthProvider interface ─────────────────────────────────

    async def signup(self, email: str, password: str, name: Optional[str] = None) -> User:
        email = email.lower().strip()

        # Check for existing user
        existing = self.client.table(self.table).select("id").eq("email", email).execute()
        if existing.data:
            raise ValueError("An account with this email already exists")

        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        pw_hash = self._hash_password(password)

        self.client.table(self.table).insert({
            "id": user_id,
            "email": email,
            "password_hash": pw_hash,
            "name": name,
            "tier": SubscriptionTier.FREE.value,
            "created_at": now,
        }).execute()

        return User(
            id=user_id, email=email, name=name,
            tier=SubscriptionTier.FREE, created_at=now,
        )

    async def login(self, email: str, password: str) -> User:
        email = email.lower().strip()
        result = self.client.table(self.table).select("*").eq("email", email).execute()

        if not result.data:
            raise ValueError("Invalid email or password")

        row = result.data[0]
        if not self._verify_password(password, row["password_hash"]):
            raise ValueError("Invalid email or password")

        return self._row_to_user(row)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = self.client.table(self.table).select("*").eq("id", user_id).execute()
        if not result.data:
            return None
        return self._row_to_user(result.data[0])

    async def update_user_tier(self, user_id: str, tier) -> User:
        tier_value = tier.value if hasattr(tier, "value") else str(tier)
        self.client.table(self.table).update({"tier": tier_value}).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def update_stripe_customer_id(self, user_id: str, customer_id: str) -> User:
        self.client.table(self.table).update(
            {"stripe_customer_id": customer_id}
        ).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def get_user_by_stripe_customer_id(self, customer_id: str) -> Optional[User]:
        result = self.client.table(self.table).select("*").eq(
            "stripe_customer_id", customer_id
        ).execute()
        if not result.data:
            return None
        return self._row_to_user(result.data[0])

    async def update_premium_until(self, user_id: str, premium_until_iso: str) -> User:
        self.client.table(self.table).update(
            {"premium_until": premium_until_iso}
        ).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def update_birth_data(
        self,
        user_id: str,
        birth_date: str,
        birth_hour: int,
        gender: str,
        calendar_type: str = "solar",
        is_leap_month: bool = False,
    ) -> User:
        self.client.table(self.table).update({
            "birth_date": birth_date,
            "birth_hour": birth_hour,
            "gender": gender,
            "calendar_type": calendar_type,
            "is_leap_month": is_leap_month,
        }).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user