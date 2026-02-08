"""
Tier-based feature flags.
Defines what each subscription tier can access.
"""

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
