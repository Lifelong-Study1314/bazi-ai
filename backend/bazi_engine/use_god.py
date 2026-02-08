"""
Use God / Avoid God (用神 / 忌神) determination

The Use God is the most needed element to balance the chart.
The Avoid God is the element that worsens the imbalance.

Traditional method:
1. Determine Day Master strength based on seasonal strength + support from chart
2. If DM is strong  → Use God weakens it (output / controller elements)
3. If DM is weak   → Use God strengthens it (resource / same element)
4. If DM is balanced → gentle support via resource element

Also provides actionable advice: colors, directions, seasons, career types.
"""

from typing import Dict, List, Optional


# ---- Five-element cycles ----

# What produces each element (Resource / 生我)
RESOURCE_FOR = {
    "Wood": "Water",
    "Fire": "Wood",
    "Earth": "Fire",
    "Metal": "Earth",
    "Water": "Metal",
}

# What each element produces (Output / 我生)
OUTPUT_OF = {
    "Wood": "Fire",
    "Fire": "Earth",
    "Earth": "Metal",
    "Metal": "Water",
    "Water": "Wood",
}

# What controls each element (Power / 克我)
CONTROLLER_OF = {
    "Wood": "Metal",
    "Fire": "Water",
    "Earth": "Wood",
    "Metal": "Fire",
    "Water": "Earth",
}

# What each element controls (Wealth / 我克)
CONTROLLED_BY = {
    "Wood": "Earth",
    "Fire": "Metal",
    "Earth": "Water",
    "Metal": "Wood",
    "Water": "Fire",
}

# ---- Practical advice per element ----

ELEMENT_ADVICE = {
    "Wood": {
        "colors": {"en": "Green, Teal", "zh-TW": "綠色、青色", "zh-CN": "绿色、青色", "ko": "초록색, 청록색"},
        "directions": {"en": "East", "zh-TW": "東方", "zh-CN": "东方", "ko": "동쪽"},
        "seasons": {"en": "Spring", "zh-TW": "春季", "zh-CN": "春季", "ko": "봄"},
        "careers": {"en": "Education, publishing, design, forestry, fashion, health supplements", "zh-TW": "教育、出版、設計、林業、時裝、保健", "zh-CN": "教育、出版、设计、林业、时装、保健", "ko": "교육, 출판, 디자인, 임업, 패션, 건강보조식품"},
        "numbers": "3, 8",
        "emoji": "木",
    },
    "Fire": {
        "colors": {"en": "Red, Orange, Purple", "zh-TW": "紅色、橙色、紫色", "zh-CN": "红色、橙色、紫色", "ko": "빨간색, 주황색, 보라색"},
        "directions": {"en": "South", "zh-TW": "南方", "zh-CN": "南方", "ko": "남쪽"},
        "seasons": {"en": "Summer", "zh-TW": "夏季", "zh-CN": "夏季", "ko": "여름"},
        "careers": {"en": "Technology, entertainment, energy, media, restaurants, lighting", "zh-TW": "科技、娛樂、能源、媒體、餐飲、照明", "zh-CN": "科技、娱乐、能源、媒体、餐饮、照明", "ko": "기술, 엔터테인먼트, 에너지, 미디어, 요식업, 조명"},
        "numbers": "2, 7",
        "emoji": "火",
    },
    "Earth": {
        "colors": {"en": "Yellow, Brown, Beige", "zh-TW": "黃色、棕色、米色", "zh-CN": "黄色、棕色、米色", "ko": "노란색, 갈색, 베이지색"},
        "directions": {"en": "Center, Northeast, Southwest", "zh-TW": "中央、東北、西南", "zh-CN": "中央、东北、西南", "ko": "중앙, 동북, 서남"},
        "seasons": {"en": "Late Summer / seasonal transitions", "zh-TW": "四季交替之際", "zh-CN": "四季交替之际", "ko": "환절기"},
        "careers": {"en": "Real estate, construction, agriculture, mining, insurance, warehousing", "zh-TW": "房地產、建築、農業、礦業、保險、倉儲", "zh-CN": "房地产、建筑、农业、矿业、保险、仓储", "ko": "부동산, 건설, 농업, 광업, 보험, 창고업"},
        "numbers": "5, 10",
        "emoji": "土",
    },
    "Metal": {
        "colors": {"en": "White, Silver, Gold", "zh-TW": "白色、銀色、金色", "zh-CN": "白色、银色、金色", "ko": "흰색, 은색, 금색"},
        "directions": {"en": "West", "zh-TW": "西方", "zh-CN": "西方", "ko": "서쪽"},
        "seasons": {"en": "Autumn", "zh-TW": "秋季", "zh-CN": "秋季", "ko": "가을"},
        "careers": {"en": "Finance, banking, law, engineering, automotive, jewelry, IT hardware", "zh-TW": "金融、銀行、法律、工程、汽車、珠寶、IT硬件", "zh-CN": "金融、银行、法律、工程、汽车、珠宝、IT硬件", "ko": "금융, 은행, 법률, 공학, 자동차, 보석, IT 하드웨어"},
        "numbers": "4, 9",
        "emoji": "金",
    },
    "Water": {
        "colors": {"en": "Black, Blue, Dark Grey", "zh-TW": "黑色、藍色、深灰色", "zh-CN": "黑色、蓝色、深灰色", "ko": "검은색, 파란색, 짙은 회색"},
        "directions": {"en": "North", "zh-TW": "北方", "zh-CN": "北方", "ko": "북쪽"},
        "seasons": {"en": "Winter", "zh-TW": "冬季", "zh-CN": "冬季", "ko": "겨울"},
        "careers": {"en": "Logistics, shipping, tourism, beverages, consulting, communication", "zh-TW": "物流、航運、旅遊、飲料、諮詢、通訊", "zh-CN": "物流、航运、旅游、饮料、咨询、通讯", "ko": "물류, 해운, 관광, 음료, 컨설팅, 통신"},
        "numbers": "1, 6",
        "emoji": "水",
    },
}


def _calculate_dm_strength_score(
    day_master_element: str,
    element_counts: Dict[str, int],
    seasonal_strength: str,
    four_pillars: Dict,
) -> float:
    """
    Calculate a numeric Day Master strength score.

    Factors:
    - Seasonal strength: strong +2, neutral 0, weak -2
    - Each stem/branch with same element: +1
    - Each stem/branch with resource element: +0.5
    - Each stem/branch with controller element: -1
    - Each stem/branch with output element: -0.5
    - Day stem itself is excluded (it IS the Day Master)

    Returns a float score. Positive = strong DM, negative = weak DM.
    """
    score = 0.0

    # Seasonal factor
    if seasonal_strength == "strong":
        score += 2.0
    elif seasonal_strength == "weak":
        score -= 2.0

    resource_elem = RESOURCE_FOR.get(day_master_element, "")
    output_elem = OUTPUT_OF.get(day_master_element, "")
    controller_elem = CONTROLLER_OF.get(day_master_element, "")
    controlled_elem = CONTROLLED_BY.get(day_master_element, "")

    # Walk every stem and branch except day stem
    for pillar_name in ["year", "month", "day", "hour"]:
        pillar = four_pillars.get(pillar_name, {})
        positions = []

        # Exclude the Day Stem (it's the DM itself)
        if pillar_name != "day":
            positions.append(pillar.get("stem", {}))
        positions.append(pillar.get("branch", {}))

        for pos in positions:
            elem = pos.get("element", "")
            if not elem:
                continue
            if elem == day_master_element:
                score += 1.0   # Same element = support
            elif elem == resource_elem:
                score += 0.5   # Resource = moderate support
            elif elem == controller_elem:
                score -= 1.0   # Controller = opposition
            elif elem == output_elem:
                score -= 0.5   # Output = drain
            # controlled_elem is neutral (DM conquers it — slight drain but also wealth)

    return score


def determine_use_god(
    day_master_element: str,
    element_counts: Dict[str, int],
    seasonal_strength_str: str,
    four_pillars: Dict,
) -> Dict:
    """
    Determine the Use God (用神) and Avoid God (忌神) for the chart.

    Returns a dict with:
      - dm_strength: "strong" | "weak" | "balanced"
      - dm_strength_score: float
      - use_god: primary favorable element
      - use_god_secondary: secondary favorable element
      - avoid_god: primary unfavorable element
      - avoid_god_secondary: secondary unfavorable element
      - advice: practical advice dict for the use god element
      - avoid_advice: what to minimize
      - explanation_en / explanation_zh_tw / explanation_zh_cn / explanation_ko
    """
    score = _calculate_dm_strength_score(
        day_master_element, element_counts, seasonal_strength_str, four_pillars
    )

    resource = RESOURCE_FOR.get(day_master_element, "")
    output = OUTPUT_OF.get(day_master_element, "")
    controller = CONTROLLER_OF.get(day_master_element, "")
    controlled = CONTROLLED_BY.get(day_master_element, "")

    # Thresholds
    if score >= 1.5:
        dm_strength = "strong"
        # Strong DM: weaken it
        # Primary: output (drain / 泄), Secondary: controller (control / 克)
        use_god = output
        use_god_secondary = controller
        avoid_god = day_master_element   # same element adds more strength
        avoid_god_secondary = resource   # resource also strengthens
    elif score <= -1.5:
        dm_strength = "weak"
        # Weak DM: strengthen it
        # Primary: resource (生我), Secondary: same element (比劫)
        use_god = resource
        use_god_secondary = day_master_element
        avoid_god = controller           # controller further weakens
        avoid_god_secondary = output     # output drains
    else:
        dm_strength = "balanced"
        # Balanced: gentle support preferred
        use_god = resource
        use_god_secondary = day_master_element
        avoid_god = controller
        avoid_god_secondary = output

    advice = ELEMENT_ADVICE.get(use_god, {})
    avoid_info = ELEMENT_ADVICE.get(avoid_god, {})

    # Build multi-language explanations
    explanations = _build_explanations(
        day_master_element, dm_strength, score,
        use_god, use_god_secondary,
        avoid_god, avoid_god_secondary,
        advice, avoid_info,
    )

    return {
        "dm_strength": dm_strength,
        "dm_strength_score": round(score, 1),
        "use_god": use_god,
        "use_god_secondary": use_god_secondary,
        "avoid_god": avoid_god,
        "avoid_god_secondary": avoid_god_secondary,
        "use_god_emoji": ELEMENT_ADVICE.get(use_god, {}).get("emoji", ""),
        "avoid_god_emoji": ELEMENT_ADVICE.get(avoid_god, {}).get("emoji", ""),
        "advice": {
            "colors": advice.get("colors", {}),
            "directions": advice.get("directions", {}),
            "seasons": advice.get("seasons", {}),
            "careers": advice.get("careers", {}),
            "numbers": advice.get("numbers", ""),
        },
        **explanations,
    }


def _build_explanations(
    dm_element: str, dm_strength: str, score: float,
    use_god: str, use_god_2: str,
    avoid_god: str, avoid_god_2: str,
    advice: Dict, avoid_info: Dict,
) -> Dict:
    """Build multi-language explanation strings."""

    strength_label = {
        "strong": {"en": "Strong", "zh-TW": "偏旺", "zh-CN": "偏旺", "ko": "강"},
        "weak": {"en": "Weak", "zh-TW": "偏弱", "zh-CN": "偏弱", "ko": "약"},
        "balanced": {"en": "Balanced", "zh-TW": "中和", "zh-CN": "中和", "ko": "균형"},
    }

    sl = strength_label.get(dm_strength, strength_label["balanced"])

    # Element name translations
    elem_names = {
        "Wood": {"en": "Wood", "zh-TW": "木", "zh-CN": "木", "ko": "목(木)"},
        "Fire": {"en": "Fire", "zh-TW": "火", "zh-CN": "火", "ko": "화(火)"},
        "Earth": {"en": "Earth", "zh-TW": "土", "zh-CN": "土", "ko": "토(土)"},
        "Metal": {"en": "Metal", "zh-TW": "金", "zh-CN": "金", "ko": "금(金)"},
        "Water": {"en": "Water", "zh-TW": "水", "zh-CN": "水", "ko": "수(水)"},
    }

    ug = elem_names.get(use_god, {})
    ug2 = elem_names.get(use_god_2, {})
    ag = elem_names.get(avoid_god, {})
    ag2 = elem_names.get(avoid_god_2, {})
    dm = elem_names.get(dm_element, {})

    # English
    if dm_strength == "strong":
        reason_en = f"Your Day Master ({dm.get('en', dm_element)}) is {sl['en']} — it has ample support from the chart and season. To achieve balance, you need elements that drain or control its excess energy."
    elif dm_strength == "weak":
        reason_en = f"Your Day Master ({dm.get('en', dm_element)}) is {sl['en']} — it lacks sufficient support from the chart and season. To achieve balance, you need elements that nourish and strengthen it."
    else:
        reason_en = f"Your Day Master ({dm.get('en', dm_element)}) is {sl['en']} — it has a relatively even distribution of support and opposition. Gentle support from resource elements is recommended."

    explanation_en = (
        f"{reason_en}\n\n"
        f"Use God: {ug.get('en', use_god)} — your most favorable element. "
        f"Secondary: {ug2.get('en', use_god_2)}.\n"
        f"Avoid God: {ag.get('en', avoid_god)} — the element to minimize. "
        f"Secondary: {ag2.get('en', avoid_god_2)}."
    )

    # Traditional Chinese
    if dm_strength == "strong":
        reason_tw = f"您的日主（{dm.get('zh-TW', '')}）{sl['zh-TW']}——命盤中得到充足助力。需要泄耗或克制的五行來取得平衡。"
    elif dm_strength == "weak":
        reason_tw = f"您的日主（{dm.get('zh-TW', '')}）{sl['zh-TW']}——命盤中助力不足。需要生扶的五行來增強力量。"
    else:
        reason_tw = f"您的日主（{dm.get('zh-TW', '')}）{sl['zh-TW']}——命盤中生克較為均衡。建議以印星（生我之五行）溫和補益。"

    explanation_tw = (
        f"{reason_tw}\n\n"
        f"用神：{ug.get('zh-TW', '')}——最有利的五行。輔助用神：{ug2.get('zh-TW', '')}。\n"
        f"忌神：{ag.get('zh-TW', '')}——應盡量避開的五行。輔助忌神：{ag2.get('zh-TW', '')}。"
    )

    # Simplified Chinese
    if dm_strength == "strong":
        reason_cn = f"您的日主（{dm.get('zh-CN', '')}）{sl['zh-CN']}——命盘中得到充足助力。需要泄耗或克制的五行来取得平衡。"
    elif dm_strength == "weak":
        reason_cn = f"您的日主（{dm.get('zh-CN', '')}）{sl['zh-CN']}——命盘中助力不足。需要生扶的五行来增强力量。"
    else:
        reason_cn = f"您的日主（{dm.get('zh-CN', '')}）{sl['zh-CN']}——命盘中生克较为均衡。建议以印星（生我之五行）温和补益。"

    explanation_cn = (
        f"{reason_cn}\n\n"
        f"用神：{ug.get('zh-CN', '')}——最有利的五行。辅助用神：{ug2.get('zh-CN', '')}。\n"
        f"忌神：{ag.get('zh-CN', '')}——应尽量避开的五行。辅助忌神：{ag2.get('zh-CN', '')}。"
    )

    # Korean
    if dm_strength == "strong":
        reason_ko = f"일주（{dm.get('ko', '')}）가 {sl['ko']}합니다 — 명반에서 충분한 지지를 받고 있습니다. 균형을 위해 설기(泄氣)하거나 극제하는 오행이 필요합니다."
    elif dm_strength == "weak":
        reason_ko = f"일주（{dm.get('ko', '')}）가 {sl['ko']}합니다 — 명반에서 지지가 부족합니다. 균형을 위해 생부(生扶)하는 오행이 필요합니다."
    else:
        reason_ko = f"일주（{dm.get('ko', '')}）가 {sl['ko']}입니다 — 명반에서 생극이 비교적 균형을 이루고 있습니다. 인성(생아지오행)으로 부드러운 보완을 권장합니다."

    explanation_ko = (
        f"{reason_ko}\n\n"
        f"용신(用神): {ug.get('ko', '')} — 가장 유리한 오행. 보조 용신: {ug2.get('ko', '')}.\n"
        f"기신(忌神): {ag.get('ko', '')} — 최소화해야 할 오행. 보조 기신: {ag2.get('ko', '')}."
    )

    return {
        "explanation_en": explanation_en,
        "explanation_zh_tw": explanation_tw,
        "explanation_zh_cn": explanation_cn,
        "explanation_ko": explanation_ko,
    }
