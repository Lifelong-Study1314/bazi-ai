"""
Deity Interpretations (神煞) - Symbolic stars based on stem/branch combinations

Implements simplified versions of:
- Heavenly Virtue Nobleman (天乙貴人): Based on day stem + day/hour branches
- Heavenly Virtue (天德): Based on month branch
- Peach Blossom (桃花): Based on year/day branch
"""

from typing import Dict, List, Optional
from .stems_branches import (
    HeavenlyStem,
    EarthlyBranch,
    STEM_INDEX,
    BRANCH_INDEX,
    INDEX_TO_STEM,
    INDEX_TO_BRANCH,
)

# 天乙贵人: Day stem -> nobleman branches (2 per stem)
# "甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢虎马"
TIANYI_GUIREN = {
    HeavenlyStem.JIA: [EarthlyBranch.CHOU, EarthlyBranch.WEI],   # 牛羊
    HeavenlyStem.WU: [EarthlyBranch.CHOU, EarthlyBranch.WEI],
    HeavenlyStem.GENG: [EarthlyBranch.CHOU, EarthlyBranch.WEI],
    HeavenlyStem.YI: [EarthlyBranch.ZI, EarthlyBranch.SHEN],       # 鼠猴
    HeavenlyStem.JI: [EarthlyBranch.ZI, EarthlyBranch.SHEN],
    HeavenlyStem.BING: [EarthlyBranch.HAI, EarthlyBranch.YOU],    # 猪鸡
    HeavenlyStem.DING: [EarthlyBranch.HAI, EarthlyBranch.YOU],
    HeavenlyStem.REN: [EarthlyBranch.MAO, EarthlyBranch.SI],      # 兔蛇
    HeavenlyStem.GUI: [EarthlyBranch.MAO, EarthlyBranch.SI],
    HeavenlyStem.XIN: [EarthlyBranch.YIN, EarthlyBranch.WU_BRANCH],  # 虎马
}

# 桃花 (Peach Blossom): Branch -> peach blossom branch
# "寅午戌桃花在卯，巳酉丑桃花在午，亥卯未桃花在子，申子辰桃花在酉"
TAOHUA_MAP = {
    EarthlyBranch.YIN: EarthlyBranch.MAO,   # 寅午戌 -> 卯
    EarthlyBranch.WU_BRANCH: EarthlyBranch.MAO,
    EarthlyBranch.XU: EarthlyBranch.MAO,
    EarthlyBranch.SI: EarthlyBranch.WU_BRANCH,   # 巳酉丑 -> 午
    EarthlyBranch.YOU: EarthlyBranch.WU_BRANCH,
    EarthlyBranch.CHOU: EarthlyBranch.WU_BRANCH,
    EarthlyBranch.HAI: EarthlyBranch.ZI,     # 亥卯未 -> 子
    EarthlyBranch.MAO: EarthlyBranch.ZI,
    EarthlyBranch.WEI: EarthlyBranch.ZI,
    EarthlyBranch.SHEN: EarthlyBranch.YOU,  # 申子辰 -> 酉
    EarthlyBranch.ZI: EarthlyBranch.YOU,
    EarthlyBranch.CHEN: EarthlyBranch.YOU,
}

# Day stem name_cn to enum
STEM_NAME_TO_ENUM = {
    "甲": HeavenlyStem.JIA, "乙": HeavenlyStem.YI, "丙": HeavenlyStem.BING,
    "丁": HeavenlyStem.DING, "戊": HeavenlyStem.WU, "己": HeavenlyStem.JI,
    "庚": HeavenlyStem.GENG, "辛": HeavenlyStem.XIN, "壬": HeavenlyStem.REN,
    "癸": HeavenlyStem.GUI,
}

# Branch name_cn to enum
BRANCH_NAME_TO_ENUM = {
    "子": EarthlyBranch.ZI, "丑": EarthlyBranch.CHOU, "寅": EarthlyBranch.YIN,
    "卯": EarthlyBranch.MAO, "辰": EarthlyBranch.CHEN, "巳": EarthlyBranch.SI,
    "午": EarthlyBranch.WU_BRANCH, "未": EarthlyBranch.WEI, "申": EarthlyBranch.SHEN,
    "酉": EarthlyBranch.YOU, "戌": EarthlyBranch.XU, "亥": EarthlyBranch.HAI,
}


def _get_branch_enum(branch_dict: Dict) -> Optional[EarthlyBranch]:
    name = branch_dict.get("name_cn") if isinstance(branch_dict, dict) else None
    return BRANCH_NAME_TO_ENUM.get(name) if name else None


def _get_stem_enum(stem_dict: Dict) -> Optional[HeavenlyStem]:
    name = stem_dict.get("name_cn") if isinstance(stem_dict, dict) else None
    return STEM_NAME_TO_ENUM.get(name) if name else None


def get_deities_for_chart(four_pillars: Dict, day_master: Dict) -> List[Dict]:
    """
    Get deity interpretations for a BAZI chart.

    Args:
        four_pillars: Dict with year/month/day/hour, each having stem and branch
        day_master: Dict with stem_cn, element, yin_yang

    Returns:
        List of deity dicts: { key, name_en, name_cn, pillar, interpretation }
    """
    deities = []
    day_stem = four_pillars.get("day", {}).get("stem", {})
    day_branch = four_pillars.get("day", {}).get("branch", {})
    hour_branch = four_pillars.get("hour", {}).get("branch", {})
    year_branch = four_pillars.get("year", {}).get("branch", {})
    month_branch = four_pillars.get("month", {}).get("branch", {})

    # 天乙贵人 (Tian Yi Gui Ren)
    stem_enum = _get_stem_enum(day_stem)
    if stem_enum and stem_enum in TIANYI_GUIREN:
        noble_branches = TIANYI_GUIREN[stem_enum]
        day_br_enum = _get_branch_enum(day_branch)
        hour_br_enum = _get_branch_enum(hour_branch)
        found_in = []
        if day_br_enum in noble_branches:
            found_in.append("day")
        if hour_br_enum in noble_branches:
            found_in.append("hour")
        if found_in:
            deities.append({
                "key": "tianyi_guiren",
                "name_en": "Heavenly Virtue Nobleman",
                "name_cn": "天乙貴人",
                "pillar": ",".join(found_in),
                "interpretation_en": "Auspicious star indicating贵人 support, help from others, and ability to overcome difficulties.",
                "interpretation_zh_tw": "貴人星，主得貴人相助，逢凶化吉，易得他人提攜。",
                "interpretation_zh_cn": "贵人星，主得贵人相助，逢凶化吉，易得他人提携。",
                "interpretation_ko": "귀인성으로，귀인 도움과 타인의 지원을 받으며 어려움을 극복하는 능력이 있습니다.",
            })

    # 桃花 (Peach Blossom) - check year and day branch
    taohua_added = False
    for pillar_name, branch_dict in [("year", year_branch), ("day", day_branch)]:
        if taohua_added:
            break
        br_enum = _get_branch_enum(branch_dict)
        if br_enum and br_enum in TAOHUA_MAP:
            peach_branch = TAOHUA_MAP[br_enum]
            for pn, pdata in four_pillars.items():
                pb = pdata.get("branch", {})
                if _get_branch_enum(pb) == peach_branch:
                    deities.append({
                        "key": "taohua",
                        "name_en": "Peach Blossom",
                        "name_cn": "桃花",
                        "pillar": f"{pillar_name}_triggers_{pn}",
                        "interpretation_en": "Peach Blossom star — relates to charm, romance, and social appeal. Can indicate popularity or romantic opportunities.",
                        "interpretation_zh_tw": "桃花星，主魅力、人緣與感情機緣，日時見為牆內桃花（恩愛），年月見為牆外桃花。",
                        "interpretation_zh_cn": "桃花星，主魅力、人缘与感情机缘，日时见为墙内桃花（恩爱），年月见为墙外桃花。",
                        "interpretation_ko": "도화성으로，매력，인연 및 감정적 기회와 관련됩니다. 인기나 로맨틱한 기회를 나타낼 수 있습니다.",
                    })
                    taohua_added = True
                    break

    return deities
