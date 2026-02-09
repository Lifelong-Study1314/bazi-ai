"""
Mock auth provider backed by SQLite.
Good for local development; swap to Supabase for production.
"""

import uuid
import os
from datetime import datetime, timezone
from typing import Optional

import aiosqlite
import bcrypt

from .base import AuthProvider, User, SubscriptionTier

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "users.db")


class MockAuthProvider(AuthProvider):
    """SQLite-backed authentication provider for development."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    # ── lifecycle ──────────────────────────────────────────────

    async def startup(self) -> None:
        """Create the users table if it doesn't exist, and run migrations."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    name TEXT,
                    tier TEXT NOT NULL DEFAULT 'free',
                    stripe_customer_id TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            await db.commit()

            # Migration: add birth-data columns (safe to re-run)
            for col, col_type in [
                ("birth_date", "TEXT"),
                ("birth_hour", "INTEGER"),
                ("gender", "TEXT"),
                ("calendar_type", "TEXT"),
                ("is_leap_month", "INTEGER"),
                ("premium_until", "TEXT"),
            ]:
                try:
                    await db.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type}")
                    await db.commit()
                except Exception:
                    pass  # column already exists

    # ── helpers ────────────────────────────────────────────────

    @staticmethod
    def _hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def _verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    # Column order for all SELECT queries:
    # 0:id, 1:email, 2:password_hash, 3:name, 4:tier, 5:stripe_customer_id,
    # 6:created_at, 7:birth_date, 8:birth_hour, 9:gender, 10:calendar_type, 11:is_leap_month, 12:premium_until
    _SELECT_COLS = (
        "id, email, password_hash, name, tier, stripe_customer_id, created_at, "
        "birth_date, birth_hour, gender, calendar_type, is_leap_month, premium_until"
    )

    @staticmethod
    def _row_to_user(row: aiosqlite.Row) -> User:
        return User(
            id=row[0],
            email=row[1],
            name=row[3],
            tier=SubscriptionTier(row[4]),
            stripe_customer_id=row[5],
            created_at=row[6],
            birth_date=row[7] if len(row) > 7 else None,
            birth_hour=row[8] if len(row) > 8 else None,
            gender=row[9] if len(row) > 9 else None,
            calendar_type=row[10] if len(row) > 10 else None,
            is_leap_month=bool(row[11]) if len(row) > 11 and row[11] is not None else None,
            premium_until=row[12] if len(row) > 12 and row[12] else None,
        )

    # ── AuthProvider interface ─────────────────────────────────

    async def signup(self, email: str, password: str, name: Optional[str] = None) -> User:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        pw_hash = self._hash_password(password)

        async with aiosqlite.connect(self.db_path) as db:
            try:
                await db.execute(
                    "INSERT INTO users (id, email, password_hash, name, tier, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, email.lower().strip(), pw_hash, name, SubscriptionTier.FREE.value, now),
                )
                await db.commit()
            except aiosqlite.IntegrityError:
                raise ValueError("An account with this email already exists")

        return User(id=user_id, email=email.lower().strip(), name=name, tier=SubscriptionTier.FREE, created_at=now)

    async def login(self, email: str, password: str) -> User:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                f"SELECT {self._SELECT_COLS} FROM users WHERE email = ?",
                (email.lower().strip(),),
            )
            row = await cursor.fetchone()

        if row is None:
            raise ValueError("Invalid email or password")

        if not self._verify_password(password, row[2]):
            raise ValueError("Invalid email or password")

        return self._row_to_user(row)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                f"SELECT {self._SELECT_COLS} FROM users WHERE id = ?",
                (user_id,),
            )
            row = await cursor.fetchone()
        return self._row_to_user(row) if row else None

    async def update_user_tier(self, user_id: str, tier: SubscriptionTier | str) -> User:
        tier_value = tier.value if hasattr(tier, 'value') else str(tier)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE users SET tier = ? WHERE id = ?", (tier_value, user_id))
            await db.commit()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def update_stripe_customer_id(self, user_id: str, customer_id: str) -> User:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE users SET stripe_customer_id = ? WHERE id = ?", (customer_id, user_id))
            await db.commit()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def get_user_by_stripe_customer_id(self, customer_id: str) -> Optional[User]:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                f"SELECT {self._SELECT_COLS} FROM users WHERE stripe_customer_id = ?",
                (customer_id,),
            )
            row = await cursor.fetchone()
        return self._row_to_user(row) if row else None

    async def update_premium_until(self, user_id: str, premium_until_iso: str) -> User:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE users SET premium_until = ? WHERE id = ?", (premium_until_iso, user_id))
            await db.commit()
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
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE users SET birth_date=?, birth_hour=?, gender=?, calendar_type=?, is_leap_month=? WHERE id=?",
                (birth_date, birth_hour, gender, calendar_type, int(is_leap_month), user_id),
            )
            await db.commit()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user
