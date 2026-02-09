"""
Tier-based feature flags.
Defines what each subscription tier can access.
"""

from datetime import datetime, timezone

from auth.base import User

TIER_FEATURES = {
    "free": {
        "ai_preview_lines": 3,       # Truncate AI text after N non-empty lines
        "max_daily_analyses": 3,      # Rate limit per day
        "pdf_export": False,
        "history": False,
        "mini_forecasts": False,
    },
    "premium": {
        "ai_preview_lines": None,     # No truncation
        "max_daily_analyses": None,    # Unlimited
        "pdf_export": True,
        "history": True,
        "mini_forecasts": True,
    },
}


def get_features(tier: str) -> dict:
    """Return the feature dict for a given tier (defaults to free)."""
    return TIER_FEATURES.get(tier, TIER_FEATURES["free"])


def get_effective_tier(user: User) -> str:
    """Premium if subscription is active OR premium_until is in the future."""
    if user.tier.value == "premium":
        return "premium"
    if user.premium_until:
        try:
            until = datetime.fromisoformat(user.premium_until.replace("Z", "+00:00"))
            if until.tzinfo is None:
                until = until.replace(tzinfo=timezone.utc)
            if until > datetime.now(timezone.utc):
                return "premium"
        except (ValueError, TypeError):
            pass
    return "free"


def get_features_for_user(user: User) -> dict:
    """Return features for the user's effective tier (subscription or premium_until)."""
    return get_features(get_effective_tier(user))
