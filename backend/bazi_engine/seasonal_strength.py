"""
Seasonal Strength (得令/失令) - Day Master strength based on birth month

The Day Master element gains or loses strength depending on whether
the birth month is in its "season" (得令) or opposite season (失令).
Element-season mapping per Five Elements theory.
"""

from typing import Dict

# Month branch index (0-11) -> season for element
# Wood: Spring (寅2, 卯3); Fire: Summer (巳5, 午6); Metal: Autumn (申8, 酉9);
# Water: Winter (亥11, 子12); Earth: Late season (辰4, 未7, 戌10, 丑1)
ELEMENT_SEASON_BRANCHES = {
    "Wood": [2, 3],      # 寅, 卯 - Spring
    "Fire": [5, 6],      # 巳, 午 - Summer
    "Metal": [8, 9],     # 申, 酉 - Autumn
    "Water": [11, 0],    # 亥, 子 - Winter (子=0)
    "Earth": [1, 4, 7, 10],  # 丑, 辰, 未, 戌 - Late season / transition
}

# Opposite season (weakening): Wood vs Metal, Fire vs Water, Earth neutral in some
ELEMENT_OPPOSITE_BRANCHES = {
    "Wood": [8, 9],      # Metal season weakens Wood
    "Fire": [11, 0],     # Water season weakens Fire
    "Metal": [2, 3],     # Wood season weakens Metal
    "Water": [5, 6],     # Fire season weakens Water
    "Earth": [],         # Earth is neutral in transition; use weak for non-season months
}


def get_seasonal_strength(day_master_element: str, month_branch_index: int) -> Dict:
    """
    Determine Day Master seasonal strength based on birth month.

    Args:
        day_master_element: "Wood", "Fire", "Earth", "Metal", or "Water"
        month_branch_index: 0-11 (子=0, 丑=1, ..., 亥=11)

    Returns:
        Dict with strength ("strong"|"neutral"|"weak"), explanation_en, explanation_zh
    """
    if not day_master_element or day_master_element not in ELEMENT_SEASON_BRANCHES:
        return {
            "strength": "neutral",
            "explanation_en": "Unable to determine seasonal strength.",
            "explanation_zh_tw": "無法判斷得令與否。",
            "explanation_zh_cn": "无法判断得令与否。",
            "explanation_ko": "득령 여부를 판단할 수 없습니다.",
        }

    in_season = month_branch_index in ELEMENT_SEASON_BRANCHES[day_master_element]
    opposite = ELEMENT_OPPOSITE_BRANCHES.get(day_master_element, [])
    in_opposite = month_branch_index in opposite

    if in_season:
        strength = "strong"
        exp_en = f"Your Day Master ({day_master_element}) is in season (得令) — born in its element's peak month. This suggests natural vitality and support from the environment."
        exp_tw = f"您的日主（{day_master_element}）得令，生於該五行當令之月，代表先天能量較旺，環境對您有助益。"
        exp_cn = f"您的日主（{day_master_element}）得令，生于该五行当令之月，代表先天能量较旺，环境对您有助益。"
        exp_ko = f"일주（{day_master_element}）가 득령입니다. 해당 오행이 당령인 달에 태어나 선천적 에너지가 왕성하고 환경의 도움을 받습니다."
    elif in_opposite:
        strength = "weak"
        exp_en = f"Your Day Master ({day_master_element}) is out of season (失令) — born in its opposite element's peak month. This suggests the need for support from other pillars or elements."
        exp_tw = f"您的日主（{day_master_element}）失令，生於剋制該五行之月，代表先天能量較弱，需從其他柱或五行中尋求補益。"
        exp_cn = f"您的日主（{day_master_element}）失令，生于克制该五行之月，代表先天能量较弱，需从其他柱或五行中寻求补益。"
        exp_ko = f"일주（{day_master_element}）가 실령입니다. 해당 오행을 극하는 달에 태어나 선천적 에너지가 약하며 다른 주나 오행에서 보완이 필요합니다."
    else:
        strength = "neutral"
        exp_en = f"Your Day Master ({day_master_element}) is in a neutral season — neither strongly supported nor weakened by the birth month."
        exp_tw = f"您的日主（{day_master_element}）處於平令，出生月份對日主既無明顯助益也無明顯剋制。"
        exp_cn = f"您的日主（{day_master_element}）处于平令，出生月份对日主既无明显助益也无明显克制。"
        exp_ko = f"일주（{day_master_element}）가 평령입니다. 출생 월이 일주에 뚜렷한 도움이나 극제를 주지 않습니다."

    return {
        "strength": strength,
        "explanation_en": exp_en,
        "explanation_zh_tw": exp_tw,
        "explanation_zh_cn": exp_cn,
        "explanation_ko": exp_ko,
    }
