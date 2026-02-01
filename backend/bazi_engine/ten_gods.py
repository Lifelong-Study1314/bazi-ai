"""
Ten Gods (Shi Shen 十神) calculation for BAZI

Calculates the relationship between the Day Master and every Stem/Branch
in the chart. Each of the 10 outcomes describes how a target element
relates to the Day Master via Five Elements + Yin/Yang polarity.
"""

from typing import Dict, List
from .elements import get_element_relationships

# Ten God definitions: (key, name_en, name_cn, name_pinyin)
TEN_GODS = {
    "friend": {"key": "friend", "name_en": "Friend", "name_cn": "比肩", "name_pinyin": "Bǐ Jiān"},
    "rob_wealth": {"key": "rob_wealth", "name_en": "Rob Wealth", "name_cn": "劫財", "name_pinyin": "Jié Cái"},
    "eating_god": {"key": "eating_god", "name_en": "Eating God", "name_cn": "食神", "name_pinyin": "Shí Shén"},
    "hurting_officer": {"key": "hurting_officer", "name_en": "Hurting Officer", "name_cn": "傷官", "name_pinyin": "Shāng Guān"},
    "indirect_wealth": {"key": "indirect_wealth", "name_en": "Indirect Wealth", "name_cn": "偏財", "name_pinyin": "Piān Cái"},
    "direct_wealth": {"key": "direct_wealth", "name_en": "Direct Wealth", "name_cn": "正財", "name_pinyin": "Zhèng Cái"},
    "seven_killings": {"key": "seven_killings", "name_en": "Seven Killings", "name_cn": "七殺", "name_pinyin": "Qī Shā"},
    "direct_officer": {"key": "direct_officer", "name_en": "Direct Officer", "name_cn": "正官", "name_pinyin": "Zhèng Guān"},
    "indirect_resource": {"key": "indirect_resource", "name_en": "Indirect Resource", "name_cn": "偏印", "name_pinyin": "Piān Yìn"},
    "direct_resource": {"key": "direct_resource", "name_en": "Direct Resource", "name_cn": "正印", "name_pinyin": "Zhèng Yìn"},
}


def get_ten_god(
    dm_element: str,
    dm_yin_yang: str,
    target_element: str,
    target_yin_yang: str,
) -> Dict:
    """
    Calculate the Ten God relationship between Day Master and a target (Stem or Branch).

    Args:
        dm_element: Day Master element (e.g., "Wood", "Fire")
        dm_yin_yang: Day Master polarity ("Yang" or "Yin")
        target_element: Target element
        target_yin_yang: Target polarity

    Returns:
        Dict with keys: key, name_en, name_cn, name_pinyin
    """
    same_polarity = (dm_yin_yang or "").lower() == (target_yin_yang or "").lower()

    # DM -> Target relationship
    rel_dm_to_target = get_element_relationships(dm_element, target_element)
    rel_target_to_dm = get_element_relationships(target_element, dm_element)

    # Same element: Friend (same polarity) | Rob Wealth (diff polarity)
    if rel_dm_to_target == "same":
        key = "friend" if same_polarity else "rob_wealth"
        return TEN_GODS[key].copy()

    # DM produces target (Output): Eating God (same) | Hurting Officer (diff)
    if rel_dm_to_target == "generates":
        key = "eating_god" if same_polarity else "hurting_officer"
        return TEN_GODS[key].copy()

    # DM destroys target (Wealth): Indirect Wealth (same) | Direct Wealth (diff)
    if rel_dm_to_target == "destroys":
        key = "indirect_wealth" if same_polarity else "direct_wealth"
        return TEN_GODS[key].copy()

    # Target destroys DM (Influence): Seven Killings (same) | Direct Officer (diff)
    if rel_target_to_dm == "destroys":
        key = "seven_killings" if same_polarity else "direct_officer"
        return TEN_GODS[key].copy()

    # Target produces DM (Resource): Indirect Resource (same) | Direct Resource (diff)
    if rel_target_to_dm == "generates":
        key = "indirect_resource" if same_polarity else "direct_resource"
        return TEN_GODS[key].copy()

    # Fallback for edge case (e.g., invalid elements)
    return TEN_GODS["friend"].copy()


def annotate_four_pillars_with_ten_gods(
    four_pillars: Dict,
    day_master: Dict,
) -> Dict:
    """
    Add ten_god label to every stem and branch in four_pillars.
    Mutates four_pillars in place and returns it.

    Args:
        four_pillars: Dict with year/month/day/hour, each having stem and branch
        day_master: Dict with element and yin_yang

    Returns:
        The same four_pillars dict (mutated)
    """
    dm_element = day_master.get("element", "")
    dm_yin_yang = day_master.get("yin_yang", "")

    for pillar_name in ["year", "month", "day", "hour"]:
        pillar = four_pillars.get(pillar_name, {})
        stem = pillar.get("stem", {})
        branch = pillar.get("branch", {})

        if stem:
            ten_god = get_ten_god(
                dm_element,
                dm_yin_yang,
                stem.get("element", ""),
                stem.get("yin_yang", ""),
            )
            stem["ten_god"] = ten_god

        if branch:
            ten_god = get_ten_god(
                dm_element,
                dm_yin_yang,
                branch.get("element", ""),
                branch.get("yin_yang", ""),
            )
            branch["ten_god"] = ten_god

    return four_pillars


def get_strongest_ten_god(four_pillars: Dict) -> Dict:
    """
    Count Ten God occurrences across 8 positions (4 stems + 4 branches).
    Exclude Day pillar stem (self). Return the most frequent Ten God.

    Returns:
        Dict with strongest_ten_god key, count, name_en, name_cn
    """
    counts: Dict[str, int] = {}

    for pillar_name in ["year", "month", "day", "hour"]:
        pillar = four_pillars.get(pillar_name, {})
        stem = pillar.get("stem", {})
        branch = pillar.get("branch", {})

        if stem and "ten_god" in stem:
            # Exclude Day pillar stem (self = Day Master, always Friend)
            if pillar_name == "day":
                continue
            key = stem["ten_god"].get("key", "")
            if key:
                counts[key] = counts.get(key, 0) + 1

        if branch and "ten_god" in branch:
            key = branch["ten_god"].get("key", "")
            if key:
                counts[key] = counts.get(key, 0) + 1

    if not counts:
        return {
            "strongest_ten_god": "friend",
            "count": 0,
            "name_en": "Friend",
            "name_cn": "比肩",
        }

    strongest_key = max(counts, key=counts.get)
    tg = TEN_GODS.get(strongest_key, TEN_GODS["friend"])

    return {
        "key": strongest_key,
        "strongest_ten_god": strongest_key,
        "count": counts[strongest_key],
        "name_en": tg["name_en"],
        "name_cn": tg["name_cn"],
    }
