"""
Annual Luck (流年) calculation for BAZI

Calculates the current year's pillar and its interactions with the natal
Four Pillars: Six Clashes (Liu Chong 六沖) and Six Combinations (Liu He 六合).
"""

from datetime import datetime
from typing import Dict, List, Optional

from .stems_branches import (
    get_stem_by_index,
    get_branch_by_index,
    stem_to_dict,
    branch_to_dict,
)

GREGORIAN_EPOCH = 1900


def _get_year_stem_branch(year: int):
    """Calculate Heavenly Stem and Earthly Branch for a given year (avoids circular import)."""
    year_position = (year - GREGORIAN_EPOCH) % 60
    stem_index = year_position % 10
    branch_index = year_position % 12
    stem = get_stem_by_index(stem_index)
    branch = get_branch_by_index(branch_index)
    return stem, branch

# Branch name_cn to index (0-11) for lookup from dict
BRANCH_NAME_TO_INDEX = {
    "子": 0, "丑": 1, "寅": 2, "卯": 3, "辰": 4, "巳": 5,
    "午": 6, "未": 7, "申": 8, "酉": 9, "戌": 10, "亥": 11,
}

# Six Clashes (Liu Chong 六沖): pairs of branch indices that clash
# Each pair is 6 apart on the zodiac wheel
SIX_CLASHES = [
    (0, 6),   # Zi (Rat) vs Wu (Horse)
    (1, 7),   # Chou (Ox) vs Wei (Goat)
    (2, 8),   # Yin (Tiger) vs Shen (Monkey)
    (3, 9),   # Mao (Rabbit) vs You (Rooster)
    (4, 10),  # Chen (Dragon) vs Xu (Dog)
    (5, 11),  # Si (Snake) vs Hai (Pig)
]

# Six Combinations (Liu He 六合): pairs of branch indices that harmonize
SIX_COMBINATIONS = [
    (0, 1),   # Zi (Rat) + Chou (Ox)
    (2, 11),  # Yin (Tiger) + Hai (Pig)
    (3, 10),  # Mao (Rabbit) + Xu (Dog)
    (4, 9),   # Chen (Dragon) + You (Rooster)
    (5, 8),   # Si (Snake) + Shen (Monkey)
    (6, 7),   # Wu (Horse) + Wei (Goat)
]


def _normalize_clash_pair(a: int, b: int) -> tuple:
    """Normalize pair for lookup (order-independent)."""
    return (min(a, b), max(a, b))


def _is_clash(idx1: int, idx2: int) -> bool:
    """Check if two branch indices form a Six Clashes pair."""
    pair = _normalize_clash_pair(idx1, idx2)
    return pair in [tuple(p) for p in SIX_CLASHES]


def _is_combination(idx1: int, idx2: int) -> bool:
    """Check if two branch indices form a Six Combinations pair."""
    pair = _normalize_clash_pair(idx1, idx2)
    return pair in [tuple(p) for p in SIX_COMBINATIONS]


# Pillar meaning labels for descriptions (localized)
PILLAR_LABELS = {
    "year": {"en": "Ancestors/Parents", "zh-TW": "祖輩/父母", "zh-CN": "祖辈/父母", "ko": "조상/부모"},
    "month": {"en": "Career/Parents", "zh-TW": "事業/父母", "zh-CN": "事业/父母", "ko": "직업/부모"},
    "day": {"en": "Self/Spouse", "zh-TW": "自身/配偶", "zh-CN": "自身/配偶", "ko": "자신/배우자"},
    "hour": {"en": "Children/Legacy", "zh-TW": "子女/晚年", "zh-CN": "子女/晚年", "ko": "자녀/만년"},
}


def calculate_annual_luck(
    four_pillars: Dict,
    year: Optional[int] = None,
    language: str = "en",
) -> Dict:
    """
    Calculate the current year's pillar and its interactions with natal Four Pillars.

    Args:
        four_pillars: Dict with year/month/day/hour, each having stem and branch
        year: Optional year (default: current system year)
        language: "en", "zh-TW", or "zh-CN" for localized descriptions

    Returns:
        Dict with annual_pillar and interactions list
    """
    if year is None:
        year = datetime.now().year

    # Get annual pillar
    year_stem, year_branch = _get_year_stem_branch(year)
    annual_stem_dict = stem_to_dict(year_stem)
    annual_branch_dict = branch_to_dict(year_branch)

    # Get annual branch index
    annual_branch_name = annual_branch_dict.get("name_cn", "")
    annual_branch_idx = BRANCH_NAME_TO_INDEX.get(annual_branch_name, -1)

    if annual_branch_idx < 0:
        return {
            "annual_pillar": {
                "stem": annual_stem_dict,
                "branch": annual_branch_dict,
                "year": year,
            },
            "interactions": [],
        }

    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"
    interactions: List[Dict] = []

    for pillar_name in ["year", "month", "day", "hour"]:
        pillar = four_pillars.get(pillar_name, {})
        branch = pillar.get("branch", {})
        branch_name = branch.get("name_cn", "")
        pillar_branch_idx = BRANCH_NAME_TO_INDEX.get(branch_name, -1)

        if pillar_branch_idx < 0:
            continue

        pillar_label = PILLAR_LABELS.get(pillar_name, {}).get(lang, pillar_name)

        if _is_clash(annual_branch_idx, pillar_branch_idx):
            if lang == "zh-TW":
                desc = f"流年地支與{pillar_label}柱相沖"
            elif lang == "zh-CN":
                desc = f"流年地支与{pillar_label}柱相冲"
            elif lang == "ko":
                desc = f"유년 지지가 {pillar_label}주와 상충"
            else:
                desc = f"Annual branch clashes with {pillar_name.capitalize()} pillar ({pillar_label})"
            interactions.append({
                "type": "Clash",
                "pillar": pillar_name,
                "pillar_label": pillar_label,
                "description": desc,
            })

        if _is_combination(annual_branch_idx, pillar_branch_idx):
            if lang == "zh-TW":
                desc = f"流年地支與{pillar_label}柱相合"
            elif lang == "zh-CN":
                desc = f"流年地支与{pillar_label}柱相合"
            elif lang == "ko":
                desc = f"유년 지지가 {pillar_label}주와 상합"
            else:
                desc = f"Annual branch combines with {pillar_name.capitalize()} pillar ({pillar_label})"
            interactions.append({
                "type": "Combination",
                "pillar": pillar_name,
                "pillar_label": pillar_label,
                "description": desc,
            })

    return {
        "annual_pillar": {
            "stem": annual_stem_dict,
            "branch": annual_branch_dict,
            "year": year,
        },
        "interactions": interactions,
    }
