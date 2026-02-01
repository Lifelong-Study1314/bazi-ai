"""
BAZI Chart Calculator

Core logic for converting birth date/time to BAZI chart
This is the heart of the application
"""

from datetime import datetime
from typing import Dict, List, Tuple
from .stems_branches import (
    HeavenlyStem,
    EarthlyBranch,
    get_stem_by_index,
    get_branch_by_index,
    stem_to_dict,
    branch_to_dict,
    get_stem_element,
    get_branch_element,
    STEM_INDEX,
    BRANCH_INDEX,
)
from .elements import count_elements, get_element_balance, get_element_relationships
from .hidden_stems import annotate_four_pillars_with_hidden_stems
from .ten_gods import annotate_four_pillars_with_ten_gods, get_strongest_ten_god
from .annual_luck import calculate_annual_luck
from .seasonal_strength import get_seasonal_strength
from .deities import get_deities_for_chart
from .hidden_stems import BRANCH_NAME_TO_ENUM


# BAZI Chart data for years 1900-2100 (simplified version)
# In production, use a proper lunar calendar library like pylunar when available on macOS
# For now, we'll use a calculated approach

GREGORIAN_EPOCH = 1900  # Starting reference year


def get_year_stem_branch(year: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given year
    
    The pattern repeats every 60 years (60 = LCM of 10 stems and 12 branches)
    Year 1900 (庚子) is position 0
    
    Args:
        year: Gregorian calendar year (e.g., 1995)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Calculate position in 60-year cycle
    year_position = (year - GREGORIAN_EPOCH) % 60
    
    # Stem cycles every 10 years
    stem_index = year_position % 10
    # Branch cycles every 12 years
    branch_index = year_position % 12
    
    stem = get_stem_by_index(stem_index)
    branch = get_branch_by_index(branch_index)
    
    return stem, branch


def is_leap_year(year: int) -> bool:
    """Check if a year is a leap year"""
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)


def get_days_in_month(year: int, month: int) -> int:
    """Get number of days in a specific month"""
    days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    if month == 2 and is_leap_year(year):
        return 29
    return days_in_month[month - 1]


def get_day_stem_branch(year: int, month: int, day: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given day
    
    Uses the "day number" calculation from January 1, 1900
    Day 1 was 甲子 (Jiǎ-Zǐ)
    
    Args:
        year: Gregorian calendar year
        month: Month (1-12)
        day: Day (1-31)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Calculate total days from January 1, 1900
    total_days = 0
    
    # Add days for complete years
    for y in range(GREGORIAN_EPOCH, year):
        total_days += 366 if is_leap_year(y) else 365
    
    # Add days for complete months in current year
    for m in range(1, month):
        total_days += get_days_in_month(year, m)
    
    # Add remaining days
    total_days += day
    
    # Day 1 (January 1, 1900) was 甲子 (position 0)
    day_position = (total_days - 1) % 60
    
    stem_index = day_position % 10
    branch_index = day_position % 12
    
    stem = get_stem_by_index(stem_index)
    branch = get_branch_by_index(branch_index)
    
    return stem, branch


def get_month_stem_branch(year: int, month: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given month
    
    The month stem depends on the year stem
    The month branch follows the zodiac: Zǐ (11), Chǒu (12), Yín (1), Mǎo (2)...
    
    Args:
        year: Gregorian calendar year
        month: Month (1-12)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Get year stem
    year_stem, _ = get_year_stem_branch(year)
    year_stem_index = (year_stem.value["name_cn"].encode('utf-8'))
    
    # Find year stem in stem list (0-9)
    from .stems_branches import STEM_INDEX
    year_stem_pos = STEM_INDEX.get(year_stem, 0)
    
    # Month stem cycle: depends on year stem
    # Each year, stems shift by 2 (yin-yang pairs)
    # Month 1 (Jan/Feb in solar) = Month 11 in lunar (Zǐ) - actually it's complex
    
    # Simplified: Month stems follow a pattern based on year stem
    # For now, use a basic pattern (this should be enhanced with lunar calendar)
    month_stem_base = year_stem_pos * 2
    month_stem_index = (month_stem_base + (month - 1) % 12) % 10
    
    month_stem = get_stem_by_index(month_stem_index)
    
    # Month branch follows lunar zodiac
    # Solar month 1-2 = lunar 11, 12
    # Solar month 3-4 = lunar 1, 2, etc.
    month_branch_index = (month + 10) % 12  # Converts solar to lunar month branch
    month_branch = get_branch_by_index(month_branch_index)
    
    return month_stem, month_branch


def get_hour_stem_branch(day_stem: HeavenlyStem, hour: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given hour
    
    The hour branch depends on the time (0-23):
    Zǐ (11pm-1am, hour 23-1)
    Chǒu (1am-3am, hour 1-3)
    ... and so on (each 2-hour period)
    
    The hour stem cycles through stems (skip some) based on day stem
    
    Args:
        day_stem: HeavenlyStem of the day
        hour: Hour in 24-hour format (0-23)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    from .stems_branches import STEM_INDEX
    
    # Hour branch mapping (2-hour periods)
    # Hour 0-1: Zǐ (11pm-1am)
    # Hour 2-3: Chǒu (1am-3am)
    # Hour 4-5: Yín (3am-5am)
    # ... etc
    hour_for_branch = hour % 24
    
    # Special handling: BAZI uses Chinese traditional hours (12 periods)
    if hour_for_branch >= 23 or hour_for_branch < 1:
        hour_branch_index = 0  # Zǐ
    else:
        hour_branch_index = (hour_for_branch + 1) // 2
        if hour_branch_index > 11:
            hour_branch_index = 11
    
    hour_branch = get_branch_by_index(hour_branch_index)
    
    # Hour stem calculation based on day stem
    day_stem_pos = STEM_INDEX.get(day_stem, 0)
    
    # Each day stem corresponds to a starting hour stem
    # The hour stems follow the pattern based on day stem
    hour_stem_base = (day_stem_pos // 2) * 2  # Determine starting point
    hour_stem_index = (hour_stem_base + hour_branch_index // 2) % 10
    
    hour_stem = get_stem_by_index(hour_stem_index)
    
    return hour_stem, hour_branch


def _get_luck_direction(gender: str, year_stem: HeavenlyStem) -> int:
    """
    Determine the direction of luck pillar progression.

    In traditional BAZI:
    - Yang male / Yin female: forward (increasing stems/branches)
    - Yin male / Yang female: backward

    We implement a simplified version of this rule.
    """
    year_stem_yin_yang = year_stem.value.get("yin_yang", "Yang")
    is_yang = year_stem_yin_yang == "Yang"
    gender_lower = (gender or "").lower()
    is_male = gender_lower == "male"
    
    # Forward for Yang male or Yin female, backward otherwise
    if (is_male and is_yang) or (not is_male and not is_yang):
        return 1
    return -1


def calculate_age_periods(
    birth_date: datetime,
    gender: str,
    year_stem: HeavenlyStem,
    year_branch: EarthlyBranch,
    day_master_element: str,
    language: str = "en",
) -> List[Dict]:
    """
    Calculate simplified 10-year luck periods (大運) as age-based ranges.
    
    This implementation is intentionally approximate but deterministic:
    - Uses a fixed starting age of 8 for the first major luck period
    - Each period covers 10 years (e.g., 8–17, 18–27, ...)
    - Luck pillars progress forward or backward in the sexagenary cycle
      based on gender and year stem yin/yang.
    - Each period gets a luck score and qualitative label by comparing
      its main element (stem element) to the day master's element.
    - We also derive simple life-domain themes and recommended actions
      to make the output practically useful.
    """
    # Starting age for first major luck cycle (simplified)
    start_age_base = 8
    num_periods = 8  # Cover roughly age 8–87
    
    direction = _get_luck_direction(gender, year_stem)
    year_stem_index = STEM_INDEX.get(year_stem, 0)
    year_branch_index = BRANCH_INDEX.get(year_branch, 0)
    
    periods: List[Dict] = []

    def _derive_life_domains(main_element: str, relationship: str) -> Dict[str, int]:
        """
        Map element + relationship to emphasis scores for life domains.
        
        Domains: career, wealth, relationships, health, learning.
        Scores range 0–3 (0 = no focus, 3 = very strong focus).
        """
        domains = {
            "career": 0,
            "wealth": 0,
            "relationships": 0,
            "health": 0,
            "learning": 0,
        }
        element = (main_element or "").lower()

        # Base mapping from element nature
        if element == "wood":
            domains["learning"] += 2
            domains["career"] += 1
        elif element == "fire":
            domains["career"] += 2
            domains["relationships"] += 1
        elif element == "earth":
            domains["wealth"] += 1
            domains["health"] += 2
        elif element == "metal":
            domains["wealth"] += 2
            domains["career"] += 1
        elif element == "water":
            domains["learning"] += 1
            domains["relationships"] += 2

        # Adjust based on relationship to day master
        if relationship == "generates":
            # Supportive to the day master → easier growth
            for key in domains:
                domains[key] += 1
        elif relationship == "destroys":
            # Pressures the day master → more challenges but also growth potential
            domains["career"] += 1
            domains["health"] += 1
        elif relationship == "same":
            # Same element → identity, self-development
            domains["learning"] += 1
            domains["relationships"] += 1

        # Clamp to 0–3
        for key in domains:
            if domains[key] < 0:
                domains[key] = 0
            if domains[key] > 3:
                domains[key] = 3

        return domains

    def _build_text_guidance(
        start_age: int,
        end_age: int,
        main_element: str,
        quality: str,
        domains: Dict[str, int],
        language: str,
    ) -> Dict[str, List[str] | str]:
        """
        Create high-level themes, focus areas, cautions, and recommended actions
        for a single 10-year period.
        """
        themes: List[str] = []
        focus_areas: List[str] = []
        cautions: List[str] = []
        actions: List[str] = []

        lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"

        # Overall decade theme (localized)
        if quality in ("very_auspicious", "auspicious"):
            themes.append(
                {
                    "en": "This decade tends to bring supportive opportunities and smoother progress.",
                    "zh-TW": "此十年多為順勢之運，較容易遇到助力與機會。",
                    "zh-CN": "此十年多为顺势之运，更容易遇到助力与机会。",
                    "ko": "이 10년은 지원적 기회와 순조로운 진전을 가져오는 경향이 있습니다.",
                }[lang]
            )
        elif quality == "neutral":
            themes.append(
                {
                    "en": "This decade is relatively balanced, offering steady growth if you act consciously.",
                    "zh-TW": "此十年整體較為平衡，若能主動規劃，仍可穩健成長。",
                    "zh-CN": "此十年整体较为平衡，若能主动规划，仍可稳健成长。",
                    "ko": "이 10년은 상대적으로 균형 잡혀 있으며，의식적으로 행동하면 꾸준한 성장을 제공합니다.",
                }[lang]
            )
        else:
            themes.append(
                {
                    "en": "This decade may feel more testing, but it is powerful for inner growth and restructuring.",
                    "zh-TW": "此十年較具考驗，但也是調整體質、重整方向的關鍵期。",
                    "zh-CN": "此十年较具考验，但也是调整体质、重整方向的关键期。",
                    "ko": "이 10년은 더 시험적일 수 있지만，내적 성장과 재구조화에 강력합니다.",
                }[lang]
            )

        # Domain-based guidance
        if domains.get("career", 0) >= 2:
            focus_areas.append(
                {
                    "en": "Consider strategic career moves, role changes, or taking on more visible responsibilities.",
                    "zh-TW": "事業面適合做策略性布局：調整跑道、升遷或承擔更高能見度的責任。",
                    "zh-CN": "事业面适合做策略性布局：调整跑道、升迁或承担更高能见度的责任。",
                    "ko": "전략적 직업 이동，역할 변경 또는 더 눈에 띄는 책임을 맡는 것을 고려하세요.",
                }[lang]
            )
            if quality in ("very_challenging", "challenging"):
                cautions.append(
                    {
                        "en": "Avoid impulsive job changes; prepare skills and networks before major moves.",
                        "zh-TW": "避免衝動轉職；重大變動前先備妥技能與人脈。",
                        "zh-CN": "避免冲动跳槽；重大变动前先备妥技能与人脉。",
                        "ko": "충동적인 직업 변경을 피하고；중대한 변화 전에 기술과 인맥을 준비하세요.",
                    }[lang]
                )
            else:
                actions.append(
                    {
                        "en": "Invest in leadership skills, reputation-building, and long-term career positioning.",
                        "zh-TW": "投資在領導力、口碑與長線職涯定位。",
                        "zh-CN": "投资在领导力、口碑与长期职业定位。",
                        "ko": "리더십，평판 구축 및 장기 직업 포지셔닝에 투자하세요.",
                    }[lang]
                )

        if domains.get("wealth", 0) >= 2:
            focus_areas.append(
                {
                    "en": "Strengthen your financial foundation, savings, and long-term assets.",
                    "zh-TW": "財務面宜打底：儲蓄、現金流與長期資產配置。",
                    "zh-CN": "财务面宜打底：储蓄、现金流与长期资产配置。",
                    "ko": "재정 기반，저축 및 장기 자산을 강화하세요.",
                }[lang]
            )
            if quality in ("very_challenging", "challenging"):
                cautions.append(
                    {
                        "en": "Be conservative with debt and speculative investments; prioritize cash flow stability.",
                        "zh-TW": "保守看待負債與投機；優先維持現金流穩定。",
                        "zh-CN": "保守看待负债与投机；优先维持现金流稳定。",
                        "ko": "부채와 투기적 투자에 보수적이고；현금 흐름 안정성을 우선시하세요.",
                    }[lang]
                )
            else:
                actions.append(
                    {
                        "en": "Plan for long-term investments and gradual asset accumulation.",
                        "zh-TW": "規劃長期投資，循序累積資產。",
                        "zh-CN": "规划长期投资，循序累积资产。",
                        "ko": "장기 투자와 점진적 자산 축적을 계획하세요.",
                    }[lang]
                )

        if domains.get("relationships", 0) >= 2:
            focus_areas.append(
                {
                    "en": "Relationships, partnerships, and social connections are highlighted.",
                    "zh-TW": "人際／伴侶關係是重點：合作、婚戀與社交連結更受影響。",
                    "zh-CN": "人际／伴侣关系是重点：合作、婚恋与社交连结更受影响。",
                    "ko": "관계，파트너십 및 사회적 연결이 강조됩니다.",
                }[lang]
            )
            if quality in ("very_challenging", "challenging"):
                cautions.append(
                    {
                        "en": "Attend to communication patterns and emotional triggers to avoid unnecessary conflicts.",
                        "zh-TW": "留意溝通模式與情緒觸發點，避免無謂的衝突。",
                        "zh-CN": "留意沟通模式与情绪触发点，避免无谓的冲突。",
                        "ko": "불필요한 갈등을 피하기 위해 의사소통 패턴과 감정적 트리거에 주의하세요.",
                    }[lang]
                )
            else:
                actions.append(
                    {
                        "en": "Deepen key relationships and nurture supportive communities around you.",
                        "zh-TW": "深化重要關係，經營能支持你的圈子與社群。",
                        "zh-CN": "深化重要关系，经营能支持你的圈子与社群。",
                        "ko": "핵심 관계를 심화하고 주변의 지원적인 공동체를 육성하세요.",
                    }[lang]
                )

        if domains.get("health", 0) >= 2:
            focus_areas.append(
                {
                    "en": "Body, energy, and emotional resilience require attention.",
                    "zh-TW": "健康與精力管理很重要：作息、情緒韌性與壓力調節需特別留意。",
                    "zh-CN": "健康与精力管理很重要：作息、情绪韧性与压力调节需特别留意。",
                    "ko": "몸，에너지 및 감정적 회복력에 주의가 필요합니다.",
                }[lang]
            )
            if quality in ("very_challenging", "challenging"):
                cautions.append(
                    {
                        "en": "Avoid overwork and ignoring early health signals; build sustainable routines.",
                        "zh-TW": "避免過勞與忽視警訊；建立可長期維持的健康習慣。",
                        "zh-CN": "避免过劳与忽视信号；建立可长期维持的健康习惯。",
                        "ko": "과로와 초기 건강 신호 무시를 피하고；지속 가능한 루틴을 구축하세요.",
                    }[lang]
                )
            else:
                actions.append(
                    {
                        "en": "Establish strong daily routines for sleep, movement, and nourishment.",
                        "zh-TW": "建立穩定的睡眠、運動與飲食規律。",
                        "zh-CN": "建立稳定的睡眠、运动与饮食规律。",
                        "ko": "수면，운동 및 영양을 위한 강력한 일상 루틴을 확립하세요.",
                    }[lang]
                )

        if domains.get("learning", 0) >= 2:
            focus_areas.append(
                {
                    "en": "Learning, inner work, and skill-building are especially fruitful in this decade.",
                    "zh-TW": "學習與內在修練有利：進修、累積技能與找到良師益友。",
                    "zh-CN": "学习与内在修炼有利：进修、累积技能与找到良师益友。",
                    "ko": "학습，내적 수양 및 기술 구축이 이 10년에 특히 유익합니다.",
                }[lang]
            )
            actions.append(
                {
                    "en": "Pursue structured learning, mentorship, or spiritual/inner development practices.",
                    "zh-TW": "建議採取結構化學習、尋找導師，或進行身心靈的內在成長練習。",
                    "zh-CN": "建议采取结构化学习、寻找导师，或进行身心灵的内在成长练习。",
                    "ko": "구조화된 학습，멘토십 또는 영적/내적 발전 실천을 추구하세요.",
                }[lang]
            )

        summary = {
            "en": (
                f"From about age {start_age} to {end_age}, focus on steady work in the highlighted areas—"
                f"this decade is about building foundations for the next cycles."
            ),
            "zh-TW": (
                f"約在 {start_age}–{end_age} 歲之間，建議把重點放在上述面向的穩健經營；"
                f"此十年適合打底，為下一輪運勢累積能量。"
            ),
            "zh-CN": (
                f"约在 {start_age}–{end_age} 岁之间，建议把重点放在上述面向的稳健经营；"
                f"此十年适合打底，为下一轮运势累积能量。"
            ),
            "ko": (
                f"약 {start_age}–{end_age}세 사이에 강조된 영역에서 꾸준한 작업에 집중하세요—"
                f"이 10년은 다음 주기를 위한 기반을 구축하는 시기입니다."
            ),
        }[lang]

        return {
            "summary": summary,
            "themes": themes,
            "focus_areas": focus_areas,
            "cautions": cautions,
            "recommended_actions": actions,
        }
    
    for i in range(num_periods):
        # Age range
        start_age = start_age_base + i * 10
        end_age = start_age + 9
        
        # Luck pillar index offset (1-based from natal year pillar)
        offset = (i + 1) * direction
        luck_stem_index = (year_stem_index + offset) % 10
        luck_branch_index = (year_branch_index + offset) % 12
        
        luck_stem = get_stem_by_index(luck_stem_index)
        luck_branch = get_branch_by_index(luck_branch_index)
        
        luck_element = get_stem_element(luck_stem)
        
        # Determine relationship between luck element and day master
        relationship = get_element_relationships(luck_element, day_master_element)
        
        # Simple scoring heuristic
        score = 0
        if relationship == "same":
            score = 2
        elif relationship == "generates":
            # Luck element generates the day master → supportive
            score = 2
        else:
            # Check reverse relationship (day master vs luck element)
            reverse_rel = get_element_relationships(day_master_element, luck_element)
            if reverse_rel == "generates":
                # Day master generates luck element → more output/effort
                score = 1
            elif relationship == "destroys":
                # Luck element destroys day master → challenging
                score = -2
            elif reverse_rel == "destroys":
                # Day master destroys luck element → pressure/responsibility
                score = -1
        
        if score >= 2:
            quality = "very_auspicious"
        elif score == 1:
            quality = "auspicious"
        elif score == 0:
            quality = "neutral"
        elif score == -1:
            quality = "challenging"
        else:
            quality = "very_challenging"
        
        favorable = score >= 1

        domains = _derive_life_domains(luck_element, relationship)
        guidance = _build_text_guidance(
            start_age=start_age,
            end_age=end_age,
            main_element=luck_element,
            quality=quality,
            domains=domains,
            language=language,
        )
        
        # Approximate Gregorian years for this age range
        start_year = birth_date.year + start_age
        end_year = birth_date.year + end_age
        
        periods.append(
            {
                "start_age": start_age,
                "end_age": end_age,
                "start_year": start_year,
                "end_year": end_year,
                "luck_pillar": {
                    "stem": stem_to_dict(luck_stem),
                    "branch": branch_to_dict(luck_branch),
                },
                "main_element": luck_element,
                "day_master_element": day_master_element,
                "relationship_to_day_master": relationship,
                "luck_score": score,
                "quality": quality,
                "favorable": favorable,
                "domains": domains,
                "summary": guidance["summary"],
                "themes": guidance["themes"],
                "focus_areas": guidance["focus_areas"],
                "cautions": guidance["cautions"],
                "recommended_actions": guidance["recommended_actions"],
            }
        )
    
    return periods


def calculate_bazi(birth_date_str: str, birth_hour: int, gender: str, language: str = "en") -> Dict:
    """
    Calculate complete BAZI chart for a person
    
    Args:
        birth_date_str: Birth date as "YYYY-MM-DD"
        birth_hour: Birth hour (0-23)
        gender: "male" or "female"
        
    Returns:
        Complete BAZI chart dictionary
        
    Example:
        calculate_bazi("1990-05-15", 14, "male")
    """
    try:
        # Parse input
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        year = birth_date.year
        month = birth_date.month
        day = birth_date.day
        
        # Calculate four pillars
        year_stem, year_branch = get_year_stem_branch(year)
        month_stem, month_branch = get_month_stem_branch(year, month)
        day_stem, day_branch = get_day_stem_branch(year, month, day)
        hour_stem, hour_branch = get_hour_stem_branch(day_stem, birth_hour)
        
        # Convert to dictionary format
        four_pillars = {
            "year": {
                "stem": stem_to_dict(year_stem),
                "branch": branch_to_dict(year_branch),
            },
            "month": {
                "stem": stem_to_dict(month_stem),
                "branch": branch_to_dict(month_branch),
            },
            "day": {
                "stem": stem_to_dict(day_stem),
                "branch": branch_to_dict(day_branch),
            },
            "hour": {
                "stem": stem_to_dict(hour_stem),
                "branch": branch_to_dict(hour_branch),
            },
        }
        
        # Extract elements from all pillars
        all_elements = []
        for pillar_name in ["year", "month", "day", "hour"]:
            pillar = four_pillars[pillar_name]
            all_elements.append(pillar["stem"]["element"])
            all_elements.append(pillar["branch"]["element"])
        
        # Count and analyze elements
        element_counts = count_elements(all_elements)
        element_analysis = get_element_balance(element_counts)
        
        # Determine day master (core of the chart)
        day_master_stem = four_pillars["day"]["stem"]["name_cn"]
        day_master_element = four_pillars["day"]["stem"]["element"]
        day_master_dict = {
            "element": day_master_element,
            "yin_yang": four_pillars["day"]["stem"]["yin_yang"],
        }

        # Annotate four pillars with Hidden Stems (藏干)
        annotate_four_pillars_with_hidden_stems(four_pillars)

        # Annotate four pillars with Ten Gods (Shi Shen)
        annotate_four_pillars_with_ten_gods(four_pillars, day_master_dict)
        strongest_ten_god = get_strongest_ten_god(four_pillars)

        # Calculate annual luck (current year pillar and interactions)
        annual_luck = calculate_annual_luck(four_pillars, language=language)

        # Seasonal strength (得令/失令)
        month_branch_name = four_pillars["month"]["branch"].get("name_cn", "")
        month_branch_enum = BRANCH_NAME_TO_ENUM.get(month_branch_name)
        month_branch_index = BRANCH_INDEX.get(month_branch_enum, 0) if month_branch_enum else 0
        seasonal_strength = get_seasonal_strength(day_master_element, month_branch_index)

        # Deity interpretations (神煞)
        deities = get_deities_for_chart(four_pillars, day_master_dict)

        # Calculate age-based luck periods (10-year cycles)
        age_periods = calculate_age_periods(
            birth_date=birth_date,
            gender=gender,
            year_stem=year_stem,
            year_branch=year_branch,
            day_master_element=day_master_element,
            language=language,
        )
        
        return {
            "success": True,
            "input": {
                "birth_date": birth_date_str,
                "birth_hour": birth_hour,
                "gender": gender,
                "birth_hour_name": f"{birth_hour}:00",
            },
            "four_pillars": four_pillars,
            "day_master": {
                "stem_cn": day_master_stem,
                "element": day_master_element,
                "yin_yang": four_pillars["day"]["stem"]["yin_yang"],
            },
            "elements": {
                "counts": element_counts,
                "analysis": element_analysis,
            },
            "age_periods": age_periods,
            "all_elements": all_elements,
            "strongest_ten_god": strongest_ten_god,
            "annual_luck": annual_luck,
            "seasonal_strength": seasonal_strength,
            "deities": deities,
        }
        
    except ValueError as e:
        return {
            "success": False,
            "error": f"Invalid input: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Calculation error: {str(e)}"
        }
