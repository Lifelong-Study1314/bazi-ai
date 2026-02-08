"""
Simple in-memory rate limiter for free-tier analysis requests.
Resets daily. Uses IP for anonymous users, user_id for logged-in users.
"""

import time
from collections import defaultdict
from .feature_flags import get_features


class RateLimiter:
    """In-memory daily rate limiter (no Redis required)."""

    def __init__(self):
        # key -> {"count": int, "day": int}
        self._counters: dict[str, dict] = defaultdict(lambda: {"count": 0, "day": 0})

    @staticmethod
    def _today() -> int:
        """Return the current UTC day as an integer (days since epoch)."""
        return int(time.time()) // 86400

    def check(self, key: str, tier: str) -> bool:
        """
        Return True if the request is allowed, False if rate-limited.
        Premium users are never rate-limited.
        """
        features = get_features(tier)
        limit = features.get("max_daily_analyses")
        if limit is None:
            return True  # Unlimited

        today = self._today()
        entry = self._counters[key]

        # Reset counter at day boundary
        if entry["day"] != today:
            entry["count"] = 0
            entry["day"] = today

        return entry["count"] < limit

    def get_usage(self, key: str, tier: str) -> dict:
        """Return current usage info for the key."""
        features = get_features(tier)
        limit = features.get("max_daily_analyses")
        if limit is None:
            return {"used": 0, "limit": None, "remaining": None}

        today = self._today()
        entry = self._counters[key]
        if entry["day"] != today:
            return {"used": 0, "limit": limit, "remaining": limit}

        return {"used": entry["count"], "limit": limit, "remaining": max(0, limit - entry["count"])}

    def increment(self, key: str) -> None:
        """Record one analysis usage."""
        today = self._today()
        entry = self._counters[key]
        if entry["day"] != today:
            entry["count"] = 0
            entry["day"] = today
        entry["count"] += 1


# Singleton
rate_limiter = RateLimiter()
