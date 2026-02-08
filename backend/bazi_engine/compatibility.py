"""
Compatibility Analysis (合婚) — Compare two BAZI charts

Evaluates relationship compatibility across multiple dimensions:
1. Day Master Interaction (element relationship between the two Day Masters)
2. Year Branch (Zodiac) Compatibility (六合, 三合, 六沖, 六害)
3. Day Branch Compatibility (Spouse Palace 夫妻宮)
4. Five Elements Complementarity (combined balance)
5. Use God Synergy (does one person strengthen the other's Use God?)

Returns a 0-100 score with dimensional breakdown and multi-language explanations.
"""

from typing import Dict, List, Tuple

from .elements import get_element_relationships, GENERATION_CYCLE, DESTRUCTION_CYCLE, Element
from .use_god import RESOURCE_FOR, OUTPUT_OF, CONTROLLER_OF, ELEMENT_ADVICE


# ---- Branch interaction tables (index-based, 0-11) ----

# Six Harmonies (六合) — deeply harmonizing pairs
SIX_HARMONIES = {
    frozenset({0, 1}),    # 子丑
    frozenset({2, 11}),   # 寅亥
    frozenset({3, 10}),   # 卯戌
    frozenset({4, 9}),    # 辰酉
    frozenset({5, 8}),    # 巳申
    frozenset({6, 7}),    # 午未
}

# Three Harmonies (三合) — groups of three branches forming a strong bond
THREE_HARMONIES_GROUPS = [
    frozenset({8, 0, 4}),    # 申子辰 — Water
    frozenset({11, 3, 7}),   # 亥卯未 — Wood
    frozenset({2, 6, 10}),   # 寅午戌 — Fire
    frozenset({5, 9, 1}),    # 巳酉丑 — Metal
]

# Six Clashes (六沖) — conflicting pairs
SIX_CLASHES = {
    frozenset({0, 6}),   # 子午
    frozenset({1, 7}),   # 丑未
    frozenset({2, 8}),   # 寅申
    frozenset({3, 9}),   # 卯酉
    frozenset({4, 10}),  # 辰戌
    frozenset({5, 11}),  # 巳亥
}

# Six Harms (六害) — subtly undermining pairs
SIX_HARMS = {
    frozenset({0, 7}),   # 子未
    frozenset({1, 6}),   # 丑午
    frozenset({2, 5}),   # 寅巳
    frozenset({3, 4}),   # 卯辰
    frozenset({8, 11}),  # 申亥
    frozenset({9, 10}),  # 酉戌
}

BRANCH_NAME_TO_INDEX = {
    "子": 0, "丑": 1, "寅": 2, "卯": 3, "辰": 4, "巳": 5,
    "午": 6, "未": 7, "申": 8, "酉": 9, "戌": 10, "亥": 11,
}


def _branch_idx(pillar: dict) -> int:
    """Extract branch index from a pillar dict."""
    name = pillar.get("branch", {}).get("name_cn", "")
    return BRANCH_NAME_TO_INDEX.get(name, -1)


def _is_harmony(a: int, b: int) -> bool:
    return frozenset({a, b}) in SIX_HARMONIES


def _is_three_harmony(a: int, b: int) -> bool:
    pair = frozenset({a, b})
    return any(pair.issubset(g) for g in THREE_HARMONIES_GROUPS)


def _is_clash(a: int, b: int) -> bool:
    return frozenset({a, b}) in SIX_CLASHES


def _is_harm(a: int, b: int) -> bool:
    return frozenset({a, b}) in SIX_HARMS


# ---- Scoring helpers ----

def _score_branch_pair(idx_a: int, idx_b: int) -> Tuple[float, str]:
    """Score a branch pair (0-25). Returns (score, relationship_key)."""
    if idx_a < 0 or idx_b < 0:
        return 12.0, "neutral"
    if idx_a == idx_b:
        return 18.0, "same"
    if _is_harmony(idx_a, idx_b):
        return 25.0, "six_harmony"
    if _is_three_harmony(idx_a, idx_b):
        return 20.0, "three_harmony"
    if _is_harm(idx_a, idx_b):
        return 5.0, "six_harm"
    if _is_clash(idx_a, idx_b):
        return 0.0, "six_clash"
    return 12.0, "neutral"


def _score_dm_interaction(elem_a: str, elem_b: str) -> Tuple[float, str]:
    """Score Day Master element interaction (0-30)."""
    if elem_a == elem_b:
        return 22.0, "same"
    rel_ab = get_element_relationships(elem_a, elem_b)
    rel_ba = get_element_relationships(elem_b, elem_a)
    if rel_ab == "generates" or rel_ba == "generates":
        return 28.0, "generates"
    if rel_ab == "destroys":
        return 10.0, "controls"
    if rel_ba == "destroys":
        return 10.0, "controlled"
    return 15.0, "neutral"


def _score_element_complement(counts_a: Dict[str, int], counts_b: Dict[str, int]) -> float:
    """Score how well combined elements balance each other (0-10)."""
    combined = {}
    for e in ["Wood", "Fire", "Earth", "Metal", "Water"]:
        combined[e] = counts_a.get(e, 0) + counts_b.get(e, 0)
    total = sum(combined.values())
    if total == 0:
        return 5.0
    avg = total / 5
    # Lower variance = better balance
    variance = sum((v - avg) ** 2 for v in combined.values()) / 5
    # Normalize: perfect balance=0 variance, worst≈16
    score = max(0, 10 - variance * 0.6)
    return round(score, 1)


def _score_use_god_synergy(chart_a: Dict, chart_b: Dict) -> float:
    """Score how well each person's strengths support the other's Use God (0-10)."""
    ug_a = chart_a.get("use_god", {}).get("use_god", "")
    ug_b = chart_b.get("use_god", {}).get("use_god", "")
    counts_a = chart_a.get("elements", {}).get("counts", {})
    counts_b = chart_b.get("elements", {}).get("counts", {})
    score = 0.0
    # Does person B have plenty of A's Use God element?
    if ug_a and counts_b.get(ug_a, 0) >= 2:
        score += 5.0
    elif ug_a and counts_b.get(ug_a, 0) >= 1:
        score += 2.5
    # Vice versa
    if ug_b and counts_a.get(ug_b, 0) >= 2:
        score += 5.0
    elif ug_b and counts_a.get(ug_b, 0) >= 1:
        score += 2.5
    return min(score, 10.0)


# ---- Relationship labels ----

BRANCH_REL_LABELS = {
    "six_harmony": {
        "en": "Six Harmony (六合) — Deep natural bond",
        "zh-TW": "六合——天生深厚的緣分",
        "zh-CN": "六合——天生深厚的缘分",
        "ko": "육합(六合) — 천생의 깊은 인연",
    },
    "three_harmony": {
        "en": "Three Harmony (三合) — Strong affinity",
        "zh-TW": "三合——強烈的吸引力",
        "zh-CN": "三合——强烈的吸引力",
        "ko": "삼합(三合) — 강한 친화력",
    },
    "same": {
        "en": "Same Branch — Familiar energy",
        "zh-TW": "同支——相似的能量",
        "zh-CN": "同支——相似的能量",
        "ko": "동지(同支) — 유사한 에너지",
    },
    "neutral": {
        "en": "Neutral — No strong bond or conflict",
        "zh-TW": "中性——無明顯合沖",
        "zh-CN": "中性——无明显合冲",
        "ko": "중립 — 뚜렷한 합충 없음",
    },
    "six_harm": {
        "en": "Six Harm (六害) — Subtle friction",
        "zh-TW": "六害——暗中相害",
        "zh-CN": "六害——暗中相害",
        "ko": "육해(六害) — 은밀한 마찰",
    },
    "six_clash": {
        "en": "Six Clash (六沖) — Direct conflict",
        "zh-TW": "六沖——直接衝突",
        "zh-CN": "六冲——直接冲突",
        "ko": "육충(六沖) — 직접적 충돌",
    },
}

DM_REL_LABELS = {
    "generates": {
        "en": "Nourishing — One supports the other's growth",
        "zh-TW": "相生——互相滋養成長",
        "zh-CN": "相生——互相滋养成长",
        "ko": "상생 — 서로의 성장을 돕는 관계",
    },
    "same": {
        "en": "Kindred — Same element, deep mutual understanding",
        "zh-TW": "同類——相同五行，深刻的默契",
        "zh-CN": "同类——相同五行，深刻的默契",
        "ko": "동류 — 같은 오행, 깊은 상호 이해",
    },
    "controls": {
        "en": "Dominant — Person A's element controls Person B's",
        "zh-TW": "主導——一方五行剋制另一方",
        "zh-CN": "主导——一方五行克制另一方",
        "ko": "주도 — A의 오행이 B를 극제",
    },
    "controlled": {
        "en": "Yielding — Person B's element controls Person A's",
        "zh-TW": "順從——另一方五行剋制此方",
        "zh-CN": "顺从——另一方五行克制此方",
        "ko": "수용 — B의 오행이 A를 극제",
    },
    "neutral": {
        "en": "Independent — Elements don't directly interact",
        "zh-TW": "獨立——五行間無直接生剋",
        "zh-CN": "独立——五行间无直接生克",
        "ko": "독립 — 오행 간 직접적 생극 없음",
    },
}

SCORE_TIER_LABELS = {
    "excellent": {
        "en": "Excellent Match (天作之合)",
        "zh-TW": "天作之合",
        "zh-CN": "天作之合",
        "ko": "천생연분 (天作之合)",
        "emoji": "◈",
    },
    "good": {
        "en": "Good Match (良緣)",
        "zh-TW": "良緣",
        "zh-CN": "良缘",
        "ko": "좋은 인연 (良緣)",
        "emoji": "◇",
    },
    "average": {
        "en": "Average Match (普通)",
        "zh-TW": "普通",
        "zh-CN": "普通",
        "ko": "보통 (普通)",
        "emoji": "○",
    },
    "challenging": {
        "en": "Challenging Match (需磨合)",
        "zh-TW": "需要磨合",
        "zh-CN": "需要磨合",
        "ko": "노력 필요 (需磨合)",
        "emoji": "△",
    },
    "difficult": {
        "en": "Difficult Match (相剋)",
        "zh-TW": "相剋",
        "zh-CN": "相克",
        "ko": "상극 (相剋)",
        "emoji": "▽",
    },
}


def _get_tier(score: float) -> str:
    if score >= 82:
        return "excellent"
    if score >= 66:
        return "good"
    if score >= 50:
        return "average"
    if score >= 35:
        return "challenging"
    return "difficult"


# ---- Main entry point ----

def analyze_compatibility(chart_a: Dict, chart_b: Dict, language: str = "en") -> Dict:
    """
    Compare two BAZI charts and return compatibility analysis.

    Args:
        chart_a: Full BAZI chart dict for person A (from calculate_bazi)
        chart_b: Full BAZI chart dict for person B
        language: Display language

    Returns:
        Dict with total_score, tier, dimensional breakdown, and explanations
    """
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"

    dm_elem_a = chart_a.get("day_master", {}).get("element", "")
    dm_elem_b = chart_b.get("day_master", {}).get("element", "")
    fp_a = chart_a.get("four_pillars", {})
    fp_b = chart_b.get("four_pillars", {})

    # 1. Day Master interaction (0-30)
    dm_score, dm_rel = _score_dm_interaction(dm_elem_a, dm_elem_b)

    # 2. Year Branch compatibility (0-25)
    year_idx_a = _branch_idx(fp_a.get("year", {}))
    year_idx_b = _branch_idx(fp_b.get("year", {}))
    year_score, year_rel = _score_branch_pair(year_idx_a, year_idx_b)

    # 3. Day Branch compatibility (Spouse Palace) (0-25)
    day_idx_a = _branch_idx(fp_a.get("day", {}))
    day_idx_b = _branch_idx(fp_b.get("day", {}))
    day_score, day_rel = _score_branch_pair(day_idx_a, day_idx_b)

    # 4. Five Elements complementarity (0-10)
    counts_a = chart_a.get("elements", {}).get("counts", {})
    counts_b = chart_b.get("elements", {}).get("counts", {})
    elem_score = _score_element_complement(counts_a, counts_b)

    # 5. Use God synergy (0-10)
    ug_score = _score_use_god_synergy(chart_a, chart_b)

    total = round(dm_score + year_score + day_score + elem_score + ug_score, 1)
    tier = _get_tier(total)

    # Build dimensional breakdown
    dimensions = [
        {
            "key": "day_master",
            "label": {"en": "Day Master Compatibility", "zh-TW": "日主相合度", "zh-CN": "日主相合度", "ko": "일주 궁합"},
            "score": dm_score,
            "max_score": 30,
            "relationship": dm_rel,
            "relationship_label": DM_REL_LABELS.get(dm_rel, {}).get(lang, ""),
            "detail": {
                "en": f"{dm_elem_a} ↔ {dm_elem_b}",
                "zh-TW": f"{dm_elem_a} ↔ {dm_elem_b}",
                "zh-CN": f"{dm_elem_a} ↔ {dm_elem_b}",
                "ko": f"{dm_elem_a} ↔ {dm_elem_b}",
            },
        },
        {
            "key": "year_branch",
            "label": {"en": "Zodiac Compatibility (Year)", "zh-TW": "生肖相合（年柱）", "zh-CN": "生肖相合（年柱）", "ko": "띠 궁합 (년주)"},
            "score": year_score,
            "max_score": 25,
            "relationship": year_rel,
            "relationship_label": BRANCH_REL_LABELS.get(year_rel, {}).get(lang, ""),
            "detail": {
                "en": f"{fp_a.get('year', {}).get('branch', {}).get('zodiac', '')} ↔ {fp_b.get('year', {}).get('branch', {}).get('zodiac', '')}",
                "zh-TW": f"{fp_a.get('year', {}).get('branch', {}).get('name_cn', '')} ↔ {fp_b.get('year', {}).get('branch', {}).get('name_cn', '')}",
                "zh-CN": f"{fp_a.get('year', {}).get('branch', {}).get('name_cn', '')} ↔ {fp_b.get('year', {}).get('branch', {}).get('name_cn', '')}",
                "ko": f"{fp_a.get('year', {}).get('branch', {}).get('name_cn', '')}({fp_a.get('year', {}).get('branch', {}).get('zodiac', '')}) ↔ {fp_b.get('year', {}).get('branch', {}).get('name_cn', '')}({fp_b.get('year', {}).get('branch', {}).get('zodiac', '')})",
            },
        },
        {
            "key": "day_branch",
            "label": {"en": "Spouse Palace (Day Branch)", "zh-TW": "夫妻宮（日支）", "zh-CN": "夫妻宫（日支）", "ko": "부부궁 (일지)"},
            "score": day_score,
            "max_score": 25,
            "relationship": day_rel,
            "relationship_label": BRANCH_REL_LABELS.get(day_rel, {}).get(lang, ""),
            "detail": {
                "en": f"{fp_a.get('day', {}).get('branch', {}).get('zodiac', '')} ↔ {fp_b.get('day', {}).get('branch', {}).get('zodiac', '')}",
                "zh-TW": f"{fp_a.get('day', {}).get('branch', {}).get('name_cn', '')} ↔ {fp_b.get('day', {}).get('branch', {}).get('name_cn', '')}",
                "zh-CN": f"{fp_a.get('day', {}).get('branch', {}).get('name_cn', '')} ↔ {fp_b.get('day', {}).get('branch', {}).get('name_cn', '')}",
                "ko": f"{fp_a.get('day', {}).get('branch', {}).get('name_cn', '')}({fp_a.get('day', {}).get('branch', {}).get('zodiac', '')}) ↔ {fp_b.get('day', {}).get('branch', {}).get('name_cn', '')}({fp_b.get('day', {}).get('branch', {}).get('zodiac', '')})",
            },
        },
        {
            "key": "elements",
            "label": {"en": "Five Elements Balance", "zh-TW": "五行互補", "zh-CN": "五行互补", "ko": "오행 상호보완"},
            "score": elem_score,
            "max_score": 10,
            "relationship": "balance",
            "relationship_label": "",
        },
        {
            "key": "use_god",
            "label": {"en": "Use God Synergy", "zh-TW": "用神互助", "zh-CN": "用神互助", "ko": "용신 시너지"},
            "score": ug_score,
            "max_score": 10,
            "relationship": "synergy",
            "relationship_label": "",
        },
    ]

    return {
        "total_score": total,
        "tier": tier,
        "tier_label": SCORE_TIER_LABELS.get(tier, {}).get(lang, ""),
        "tier_emoji": SCORE_TIER_LABELS.get(tier, {}).get("emoji", ""),
        "dimensions": dimensions,
        "person_a": {
            "day_master": chart_a.get("day_master", {}),
            "use_god": chart_a.get("use_god", {}),
            "elements": chart_a.get("elements", {}),
            "four_pillars": chart_a.get("four_pillars", {}),
        },
        "person_b": {
            "day_master": chart_b.get("day_master", {}),
            "use_god": chart_b.get("use_god", {}),
            "elements": chart_b.get("elements", {}),
            "four_pillars": chart_b.get("four_pillars", {}),
        },
    }
