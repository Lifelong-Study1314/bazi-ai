"""
Daily & Weekly Mini-Forecast Engine

Pure-Python scoring that compares a target date's pillar against the user's
natal BAZI chart.  All heavy lifting happens here — no AI needed except for
the optional daily-wisdom quote (handled elsewhere).
"""

from datetime import date, timedelta
from typing import Dict, List, Tuple, Optional

from .stems_branches import (
    HeavenlyStem,
    EarthlyBranch,
    get_stem_by_index,
    get_branch_by_index,
    get_stem_element,
    get_branch_element,
    stem_to_dict,
    branch_to_dict,
    STEM_INDEX,
    BRANCH_INDEX,
)
from .elements import get_element_relationships
from .use_god import RESOURCE_FOR, OUTPUT_OF, CONTROLLER_OF, CONTROLLED_BY, ELEMENT_ADVICE
from .annual_luck import BRANCH_NAME_TO_INDEX, _is_clash, _is_combination

# ────────────────────────────────────────────────────────────
# Reference date for O(1) day-pillar calculation
# Jan 1, 1900 = sexagenary position 0 (甲子)
# ────────────────────────────────────────────────────────────
_REFERENCE_DATE = date(1900, 1, 1)

# ────────────────────────────────────────────────────────────
# Peach Blossom (桃花) lookup
# Key = frozenset of day-branch indices in the same group
# Value = branch index that activates peach blossom
# ────────────────────────────────────────────────────────────
_PEACH_BLOSSOM = {
    frozenset([2, 6, 10]): 3,    # 寅午戌 → 卯
    frozenset([5, 9, 1]): 6,     # 巳酉丑 → 午
    frozenset([8, 0, 4]): 9,     # 申子辰 → 酉
    frozenset([11, 3, 7]): 0,    # 亥卯未 → 子
}

# ────────────────────────────────────────────────────────────
# Chinese hour time-range info  (12 shichen)
# ────────────────────────────────────────────────────────────
_CHINESE_HOURS = [
    # (representative_24h_hour, branch_cn, time_range, localized names)
    (0,  "子", "23:00-01:00", {"en": "Zi",   "zh-TW": "子時", "zh-CN": "子时", "ko": "자시(子時)"}),
    (1,  "丑", "01:00-03:00", {"en": "Chou", "zh-TW": "丑時", "zh-CN": "丑时", "ko": "축시(丑時)"}),
    (3,  "寅", "03:00-05:00", {"en": "Yin",  "zh-TW": "寅時", "zh-CN": "寅时", "ko": "인시(寅時)"}),
    (5,  "卯", "05:00-07:00", {"en": "Mao",  "zh-TW": "卯時", "zh-CN": "卯时", "ko": "묘시(卯時)"}),
    (7,  "辰", "07:00-09:00", {"en": "Chen", "zh-TW": "辰時", "zh-CN": "辰时", "ko": "진시(辰時)"}),
    (9,  "巳", "09:00-11:00", {"en": "Si",   "zh-TW": "巳時", "zh-CN": "巳时", "ko": "사시(巳時)"}),
    (11, "午", "11:00-13:00", {"en": "Wu",   "zh-TW": "午時", "zh-CN": "午时", "ko": "오시(午時)"}),
    (13, "未", "13:00-15:00", {"en": "Wei",  "zh-TW": "未時", "zh-CN": "未时", "ko": "미시(未時)"}),
    (15, "申", "15:00-17:00", {"en": "Shen", "zh-TW": "申時", "zh-CN": "申时", "ko": "신시(申時)"}),
    (17, "酉", "17:00-19:00", {"en": "You",  "zh-TW": "酉時", "zh-CN": "酉时", "ko": "유시(酉時)"}),
    (19, "戌", "19:00-21:00", {"en": "Xu",   "zh-TW": "戌時", "zh-CN": "戌时", "ko": "술시(戌時)"}),
    (21, "亥", "21:00-23:00", {"en": "Hai",  "zh-TW": "亥時", "zh-CN": "亥时", "ko": "해시(亥時)"}),
]

# ────────────────────────────────────────────────────────────
# Element-to-practical mappings (localized)
# ────────────────────────────────────────────────────────────

ELEMENT_COLORS = {
    "Wood":  {"en": "Green",               "zh-TW": "綠色", "zh-CN": "绿色", "ko": "초록색"},
    "Fire":  {"en": "Red / Orange",         "zh-TW": "紅色", "zh-CN": "红色", "ko": "빨간색"},
    "Earth": {"en": "Yellow / Brown",       "zh-TW": "黃色", "zh-CN": "黄色", "ko": "노란색"},
    "Metal": {"en": "White / Silver / Gold","zh-TW": "白色", "zh-CN": "白色", "ko": "흰색"},
    "Water": {"en": "Blue / Black",         "zh-TW": "藍色", "zh-CN": "蓝色", "ko": "파란색"},
}

ELEMENT_DIRECTIONS = {
    "Wood":  {"en": "East",      "zh-TW": "東方", "zh-CN": "东方", "ko": "동쪽"},
    "Fire":  {"en": "South",     "zh-TW": "南方", "zh-CN": "南方", "ko": "남쪽"},
    "Earth": {"en": "Center",    "zh-TW": "中央", "zh-CN": "中央", "ko": "중앙"},
    "Metal": {"en": "West",      "zh-TW": "西方", "zh-CN": "西方", "ko": "서쪽"},
    "Water": {"en": "North",     "zh-TW": "北方", "zh-CN": "北方", "ko": "북쪽"},
}

ELEMENT_NUMBERS = {
    "Wood": "3, 8", "Fire": "2, 7", "Earth": "5, 10", "Metal": "4, 9", "Water": "1, 6",
}

ELEMENT_OBJECTS = {
    "Wood":  {"en": "Jade bracelet",    "zh-TW": "翡翠手鏈", "zh-CN": "翡翠手链", "ko": "옥 팔찌"},
    "Fire":  {"en": "Red agate pendant","zh-TW": "紅瑪瑙吊墜","zh-CN": "红玛瑙吊坠","ko": "홍마노 펜던트"},
    "Earth": {"en": "Crystal sphere",   "zh-TW": "水晶球",   "zh-CN": "水晶球",   "ko": "수정 구슬"},
    "Metal": {"en": "Silver ring",      "zh-TW": "銀戒指",   "zh-CN": "银戒指",   "ko": "은반지"},
    "Water": {"en": "Obsidian bead",    "zh-TW": "黑曜石珠",  "zh-CN": "黑曜石珠",  "ko": "흑요석 구슬"},
}

ELEMENT_FOODS = {
    "Wood":  {"en": "Green vegetables & sour fruits", "zh-TW": "綠色蔬菜與酸味水果", "zh-CN": "绿色蔬菜与酸味水果", "ko": "녹색 채소와 신 과일"},
    "Fire":  {"en": "Red fruits & spicy dishes",      "zh-TW": "紅色水果與辛辣料理", "zh-CN": "红色水果与辛辣料理", "ko": "붉은 과일과 매운 요리"},
    "Earth": {"en": "Root vegetables & sweet grains",  "zh-TW": "根莖類與甜味穀物",  "zh-CN": "根茎类与甜味谷物",  "ko": "뿌리 채소와 달콤한 곡물"},
    "Metal": {"en": "White foods (tofu, rice, pear)",  "zh-TW": "白色食物（豆腐、米、梨）","zh-CN": "白色食物（豆腐、米、梨）","ko": "흰 음식 (두부, 쌀, 배)"},
    "Water": {"en": "Seaweed, black beans & soups",    "zh-TW": "海帶、黑豆與湯品",  "zh-CN": "海带、黑豆与汤品",  "ko": "미역, 검은콩과 국"},
}

# ────────────────────────────────────────────────────────────
# Do's & Don'ts templates per element (localized, 4 per element)
# ────────────────────────────────────────────────────────────

_DO_TEMPLATES = {
    "Wood": [
        {"en": "Spend time in nature or parks",        "zh-TW": "走進大自然或公園", "zh-CN": "走进大自然或公园", "ko": "자연이나 공원에서 시간을 보내세요"},
        {"en": "Wear green or teal clothing",           "zh-TW": "穿綠色或青色衣物", "zh-CN": "穿绿色或青色衣物", "ko": "녹색이나 청록색 옷을 입으세요"},
        {"en": "Start new creative projects",           "zh-TW": "開始新的創意計畫", "zh-CN": "开始新的创意计划", "ko": "새로운 창작 프로젝트를 시작하세요"},
        {"en": "Read, study or learn something new",    "zh-TW": "閱讀、學習新事物", "zh-CN": "阅读、学习新事物", "ko": "독서하거나 새로운 것을 배우세요"},
    ],
    "Fire": [
        {"en": "Network and socialize actively",        "zh-TW": "積極社交與拓展人脈", "zh-CN": "积极社交与拓展人脉", "ko": "적극적으로 사교하고 네트워크를 넓히세요"},
        {"en": "Present ideas or perform publicly",     "zh-TW": "展現想法或公開表現", "zh-CN": "展现想法或公开表现", "ko": "아이디어를 발표하거나 공개적으로 활동하세요"},
        {"en": "Wear warm colors (red, orange, purple)","zh-TW": "穿暖色系（紅橙紫）", "zh-CN": "穿暖色系（红橙紫）", "ko": "따뜻한 색상 (빨강, 주황, 보라) 옷을 입으세요"},
        {"en": "Take bold, decisive actions",           "zh-TW": "採取大膽果決的行動", "zh-CN": "采取大胆果决的行动", "ko": "대담하고 결단력 있는 행동을 하세요"},
    ],
    "Earth": [
        {"en": "Organize your space and plans",         "zh-TW": "整理空間與計畫", "zh-CN": "整理空间与计划", "ko": "공간과 계획을 정리하세요"},
        {"en": "Focus on stable routines",              "zh-TW": "專注於穩定作息", "zh-CN": "专注于稳定作息", "ko": "안정적인 루틴에 집중하세요"},
        {"en": "Review finances and budgets",           "zh-TW": "檢視財務與預算", "zh-CN": "检视财务与预算", "ko": "재정과 예산을 점검하세요"},
        {"en": "Nurture existing relationships",        "zh-TW": "維繫現有人際關係", "zh-CN": "维系现有人际关系", "ko": "기존 인간관계를 돌보세요"},
    ],
    "Metal": [
        {"en": "Negotiate or sign agreements",          "zh-TW": "洽談或簽署協議", "zh-CN": "洽谈或签署协议", "ko": "협상하거나 계약을 체결하세요"},
        {"en": "Focus on precision and detail work",    "zh-TW": "專注精密與細節工作", "zh-CN": "专注精密与细节工作", "ko": "정밀하고 세밀한 작업에 집중하세요"},
        {"en": "Wear white, silver or gold accessories", "zh-TW": "佩戴白色、銀色或金色配飾", "zh-CN": "佩戴白色、银色或金色配饰", "ko": "흰색, 은색 또는 금색 액세서리를 착용하세요"},
        {"en": "Make important decisions with clarity",  "zh-TW": "以清晰頭腦做重要決定", "zh-CN": "以清晰头脑做重要决定", "ko": "명확한 마음으로 중요한 결정을 하세요"},
    ],
    "Water": [
        {"en": "Meditate or practice mindfulness",      "zh-TW": "冥想或練習正念", "zh-CN": "冥想或练习正念", "ko": "명상이나 마음 챙김을 실천하세요"},
        {"en": "Research and gather information",        "zh-TW": "調研與蒐集資訊", "zh-CN": "调研与搜集资讯", "ko": "조사하고 정보를 수집하세요"},
        {"en": "Wear blue or dark tones",               "zh-TW": "穿藍色或深色調衣物", "zh-CN": "穿蓝色或深色调衣物", "ko": "파란색이나 어두운 톤의 옷을 입으세요"},
        {"en": "Go with the flow — stay flexible",      "zh-TW": "順勢而為、保持彈性", "zh-CN": "顺势而为、保持弹性", "ko": "흐름을 따르세요 — 유연하게 대처하세요"},
    ],
}

_DONT_TEMPLATES = {
    "Wood": [
        {"en": "Don't make impulsive career changes",   "zh-TW": "不要衝動轉職",   "zh-CN": "不要冲动跳槽",   "ko": "충동적인 직업 변경을 하지 마세요"},
        {"en": "Avoid confrontations and arguments",     "zh-TW": "避免衝突與爭吵", "zh-CN": "避免冲突与争吵", "ko": "대립과 다툼을 피하세요"},
        {"en": "Don't overcommit to new obligations",    "zh-TW": "不要過度承擔新義務","zh-CN": "不要过度承担新义务","ko": "새로운 의무를 과도하게 떠맡지 마세요"},
    ],
    "Fire": [
        {"en": "Don't engage in heated arguments",       "zh-TW": "不要加入激烈爭辯", "zh-CN": "不要加入激烈争辩", "ko": "격렬한 논쟁에 참여하지 마세요"},
        {"en": "Avoid high-risk financial decisions",     "zh-TW": "避免高風險財務決定", "zh-CN": "避免高风险财务决定", "ko": "고위험 재정적 결정을 피하세요"},
        {"en": "Don't overpromise or overextend",         "zh-TW": "不要過度承諾或勉強","zh-CN": "不要过度承诺或勉强","ko": "과도한 약속이나 무리를 하지 마세요"},
    ],
    "Earth": [
        {"en": "Don't resist necessary changes",         "zh-TW": "不要抗拒必要的改變","zh-CN": "不要抗拒必要的改变","ko": "필요한 변화에 저항하지 마세요"},
        {"en": "Avoid overthinking or ruminating",        "zh-TW": "避免過度思考或鑽牛角尖","zh-CN": "避免过度思考或钻牛角尖","ko": "과도한 생각이나 반추를 피하세요"},
        {"en": "Don't hoard resources unnecessarily",     "zh-TW": "不要不必要地囤積資源","zh-CN": "不要不必要地囤积资源","ko": "불필요하게 자원을 비축하지 마세요"},
    ],
    "Metal": [
        {"en": "Don't be overly rigid or critical",      "zh-TW": "不要過於僵化或苛刻","zh-CN": "不要过于僵化或苛刻","ko": "지나치게 경직되거나 비판적이지 마세요"},
        {"en": "Avoid unnecessary confrontation",         "zh-TW": "避免不必要的對抗", "zh-CN": "避免不必要的对抗", "ko": "불필요한 대립을 피하세요"},
        {"en": "Don't neglect self-care or rest",         "zh-TW": "不要忽略自我照顧與休息","zh-CN": "不要忽略自我照顾与休息","ko": "자기 관리와 휴식을 소홀히 하지 마세요"},
    ],
    "Water": [
        {"en": "Don't isolate yourself from others",      "zh-TW": "不要孤立自己",   "zh-CN": "不要孤立自己",   "ko": "스스로를 고립시키지 마세요"},
        {"en": "Avoid excessive worry about the future",   "zh-TW": "避免過度擔憂未來","zh-CN": "避免过度担忧未来","ko": "미래에 대한 과도한 걱정을 피하세요"},
        {"en": "Don't neglect structure and discipline",   "zh-TW": "不要忽視規律與紀律","zh-CN": "不要忽视规律与纪律","ko": "구조와 규율을 소홀히 하지 마세요"},
    ],
}

# ────────────────────────────────────────────────────────────
# Mood keywords
# ────────────────────────────────────────────────────────────

_MOOD_TIERS = [
    (80, {"en": "Breakthrough Day",  "zh-TW": "突破之日", "zh-CN": "突破之日", "ko": "돌파의 날"}),
    (60, {"en": "Steady Progress",   "zh-TW": "穩步前進", "zh-CN": "稳步前进", "ko": "꾸준한 진전"}),
    (40, {"en": "Gentle Flow",       "zh-TW": "順其自然", "zh-CN": "顺其自然", "ko": "자연스러운 흐름"}),
    (20, {"en": "Rest & Recharge",   "zh-TW": "養精蓄銳", "zh-CN": "养精蓄锐", "ko": "휴식과 재충전"}),
    (0,  {"en": "Lay Low",           "zh-TW": "韜光養晦", "zh-CN": "韬光养晦", "ko": "낮은 자세로"}),
]


# ════════════════════════════════════════════════════════════
# Core public functions
# ════════════════════════════════════════════════════════════

def get_daily_pillar(target_date: date) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """O(1) day-pillar calculation using datetime arithmetic."""
    delta = (target_date - _REFERENCE_DATE).days
    pos = delta % 60
    return get_stem_by_index(pos % 10), get_branch_by_index(pos % 12)


def _get_natal_branch_indices(chart: dict) -> List[int]:
    """Extract branch indices from natal four pillars."""
    indices = []
    fp = chart.get("four_pillars", {})
    for pillar_name in ("year", "month", "day", "hour"):
        branch_cn = fp.get(pillar_name, {}).get("branch", {}).get("name_cn", "")
        idx = BRANCH_NAME_TO_INDEX.get(branch_cn, -1)
        if idx >= 0:
            indices.append(idx)
    return indices


def _get_peach_blossom_branch(day_branch_idx: int) -> int:
    """Return the branch index that activates peach blossom for the given day-branch."""
    for group, pb_idx in _PEACH_BLOSSOM.items():
        if day_branch_idx in group:
            return pb_idx
    return -1


# ────────────────────────────────────────────────────────────
# Overall score
# ────────────────────────────────────────────────────────────

def calculate_overall_score(
    dm_element: str,
    use_god: str,
    use_god_2: str,
    avoid_god: str,
    avoid_god_2: str,
    daily_elem: str,
    daily_branch_idx: int,
    natal_branch_indices: List[int],
) -> int:
    """Score 0-100 for how favorable the day is."""
    score = 50.0

    # Use God / Avoid God alignment
    if daily_elem == use_god:
        score += 25
    elif daily_elem == use_god_2:
        score += 15
    elif daily_elem == avoid_god:
        score -= 20
    elif daily_elem == avoid_god_2:
        score -= 12

    # Element relationship with Day Master
    rel = get_element_relationships(daily_elem, dm_element)
    if rel == "generates":
        score += 10   # Daily element nourishes DM (resource)
    elif rel == "same":
        score += 5    # Companion element
    elif rel == "destroys":
        score -= 10   # Daily element attacks DM

    reverse = get_element_relationships(dm_element, daily_elem)
    if reverse == "generates":
        score -= 3    # DM drains into daily element (output)
    elif reverse == "destroys":
        score -= 5    # DM conquers daily element (wealth, minor drain)

    # Branch interactions with natal chart
    for nb_idx in natal_branch_indices:
        if _is_clash(daily_branch_idx, nb_idx):
            score -= 8
        if _is_combination(daily_branch_idx, nb_idx):
            score += 8

    return max(0, min(100, int(round(score))))


# ────────────────────────────────────────────────────────────
# Domain scores
# ────────────────────────────────────────────────────────────

def calculate_domain_scores(
    dm_element: str,
    use_god: str,
    avoid_god: str,
    daily_elem: str,
    daily_branch_idx: int,
    natal_day_branch_idx: int,
    natal_branch_indices: List[int],
) -> Dict[str, int]:
    """Return scores 0-100 for love, wealth, career, study, social."""
    wealth_elem = CONTROLLED_BY.get(dm_element, "")   # What DM controls
    career_elem = CONTROLLER_OF.get(dm_element, "")   # What controls DM
    resource_elem = RESOURCE_FOR.get(dm_element, "")   # What generates DM
    output_elem = OUTPUT_OF.get(dm_element, "")         # What DM produces

    pb_branch = _get_peach_blossom_branch(natal_day_branch_idx)

    domains = {}

    # --- Love ---
    love = 50.0
    if daily_branch_idx == pb_branch:
        love += 25  # Peach Blossom activated
    if daily_elem == resource_elem:
        love += 10  # Resource element = emotional nourishment
    if daily_elem == dm_element:
        love += 5
    if daily_elem == avoid_god:
        love -= 12
    # Combinations boost romance
    for nb in natal_branch_indices:
        if _is_combination(daily_branch_idx, nb):
            love += 6
        if _is_clash(daily_branch_idx, nb):
            love -= 5
    domains["love"] = max(0, min(100, int(round(love))))

    # --- Wealth ---
    wealth = 50.0
    if daily_elem == wealth_elem:
        wealth += 22
    if daily_elem == use_god and wealth_elem == use_god:
        wealth += 8
    if daily_elem == avoid_god:
        wealth -= 15
    rel = get_element_relationships(dm_element, daily_elem)
    if rel == "destroys":
        wealth += 5  # DM conquers → wealth opportunity
    for nb in natal_branch_indices:
        if _is_combination(daily_branch_idx, nb):
            wealth += 5
        if _is_clash(daily_branch_idx, nb):
            wealth -= 6
    domains["wealth"] = max(0, min(100, int(round(wealth))))

    # --- Career ---
    career = 50.0
    if daily_elem == career_elem:
        career += 20
    if daily_elem == output_elem:
        career += 10  # Output = visibility, recognition
    if daily_elem == avoid_god:
        career -= 15
    if daily_elem == use_god:
        career += 12
    for nb in natal_branch_indices:
        if _is_clash(daily_branch_idx, nb):
            career -= 6
        if _is_combination(daily_branch_idx, nb):
            career += 5
    domains["career"] = max(0, min(100, int(round(career))))

    # --- Study ---
    study = 50.0
    if daily_elem == resource_elem:
        study += 22  # Resource = learning & wisdom
    if daily_elem == dm_element:
        study += 5
    if daily_elem == avoid_god:
        study -= 12
    if daily_elem == use_god:
        study += 10
    for nb in natal_branch_indices:
        if _is_combination(daily_branch_idx, nb):
            study += 4
        if _is_clash(daily_branch_idx, nb):
            study -= 5
    domains["study"] = max(0, min(100, int(round(study))))

    # --- Social ---
    social = 50.0
    if daily_elem == dm_element:
        social += 15  # Same element = camaraderie
    if daily_elem == output_elem:
        social += 12  # Output = expression, charisma
    if daily_branch_idx == pb_branch:
        social += 10
    if daily_elem == avoid_god:
        social -= 12
    for nb in natal_branch_indices:
        if _is_combination(daily_branch_idx, nb):
            social += 7
        if _is_clash(daily_branch_idx, nb):
            social -= 6
    domains["social"] = max(0, min(100, int(round(social))))

    return domains


# ────────────────────────────────────────────────────────────
# Lucky items
# ────────────────────────────────────────────────────────────

def get_lucky_items(
    use_god_elem: str,
    daily_stem: HeavenlyStem,
    daily_branch: EarthlyBranch,
    dm_element: str,
    language: str,
) -> dict:
    """Derive lucky color, number, direction, hour, object, food."""
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"
    elem = use_god_elem or dm_element  # Fallback

    # Lucky hour — find the Chinese hour whose element == use_god_elem
    best_hour: Optional[dict] = None
    best_score = -999
    from .calculator import get_hour_stem_branch
    for hr_24, br_cn, time_range, names in _CHINESE_HOURS:
        h_stem, h_branch = get_hour_stem_branch(daily_stem, hr_24)
        h_elem = get_stem_element(h_stem)
        sc = 0
        if h_elem == use_god_elem:
            sc += 30
        if h_elem == dm_element:
            sc += 10
        if get_element_relationships(h_elem, dm_element) == "generates":
            sc += 15
        if sc > best_score:
            best_score = sc
            best_hour = {"name": br_cn, "time": time_range, "name_loc": names.get(lang, br_cn), "score": sc}

    return {
        "color": ELEMENT_COLORS.get(elem, ELEMENT_COLORS["Wood"]).get(lang, ""),
        "number": ELEMENT_NUMBERS.get(elem, ""),
        "direction": ELEMENT_DIRECTIONS.get(elem, ELEMENT_DIRECTIONS["Wood"]).get(lang, ""),
        "hour": best_hour,
        "object": ELEMENT_OBJECTS.get(elem, ELEMENT_OBJECTS["Wood"]).get(lang, ""),
        "food": ELEMENT_FOODS.get(elem, ELEMENT_FOODS["Wood"]).get(lang, ""),
    }


# ────────────────────────────────────────────────────────────
# Energy rhythm (12 Chinese hours)
# ────────────────────────────────────────────────────────────

def get_energy_rhythm(
    dm_element: str,
    use_god_elem: str,
    daily_stem: HeavenlyStem,
    language: str,
) -> List[dict]:
    """Score each of the 12 shichen for the user."""
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"
    from .calculator import get_hour_stem_branch

    rhythm = []
    for hr_24, br_cn, time_range, names in _CHINESE_HOURS:
        h_stem, h_branch = get_hour_stem_branch(daily_stem, hr_24)
        h_elem = get_stem_element(h_stem)

        sc = 50.0
        if h_elem == use_god_elem:
            sc += 25
        if h_elem == dm_element:
            sc += 10
        rel = get_element_relationships(h_elem, dm_element)
        if rel == "generates":
            sc += 15
        elif rel == "destroys":
            sc -= 15
        if h_elem == CONTROLLER_OF.get(dm_element, ""):
            sc -= 10

        sc = max(0, min(100, int(round(sc))))

        if sc >= 75:
            level = "high"
        elif sc >= 45:
            level = "medium"
        else:
            level = "low"

        rhythm.append({
            "branch": br_cn,
            "name": names.get(lang, br_cn),
            "time": time_range,
            "element": h_elem,
            "score": sc,
            "level": level,
        })
    return rhythm


# ────────────────────────────────────────────────────────────
# Do's and Don'ts
# ────────────────────────────────────────────────────────────

def get_dos_and_donts(
    dm_element: str,
    use_god_elem: str,
    avoid_god_elem: str,
    daily_elem: str,
    language: str,
) -> Tuple[List[str], List[str]]:
    """Return (dos, donts) as localized strings."""
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"

    # Determine which elements to draw from
    # Favorable = Use God element  +  daily element if favorable
    favorable_elem = use_god_elem or dm_element
    unfavorable_elem = avoid_god_elem or CONTROLLER_OF.get(dm_element, "")

    # If daily element is favorable, reinforce with its Do's
    is_daily_favorable = (
        daily_elem == use_god_elem
        or get_element_relationships(daily_elem, dm_element) == "generates"
        or daily_elem == dm_element
    )

    do_elem = daily_elem if is_daily_favorable else favorable_elem
    dont_elem = avoid_god_elem if avoid_god_elem else unfavorable_elem

    dos = [t.get(lang, t["en"]) for t in _DO_TEMPLATES.get(do_elem, _DO_TEMPLATES.get(favorable_elem, []))][:4]
    donts = [t.get(lang, t["en"]) for t in _DONT_TEMPLATES.get(dont_elem, _DONT_TEMPLATES.get(unfavorable_elem, []))][:3]

    # Ensure we always have items
    if not dos:
        dos = [t.get(lang, t["en"]) for t in _DO_TEMPLATES.get(dm_element, _DO_TEMPLATES["Wood"])][:3]
    if not donts:
        donts = [t.get(lang, t["en"]) for t in _DONT_TEMPLATES.get(dm_element, _DONT_TEMPLATES["Wood"])][:3]

    return dos, donts


# ────────────────────────────────────────────────────────────
# Weekly outlook
# ────────────────────────────────────────────────────────────

_DAY_NAMES = {
    0: {"en": "Mon", "zh-TW": "週一", "zh-CN": "周一", "ko": "월"},
    1: {"en": "Tue", "zh-TW": "週二", "zh-CN": "周二", "ko": "화"},
    2: {"en": "Wed", "zh-TW": "週三", "zh-CN": "周三", "ko": "수"},
    3: {"en": "Thu", "zh-TW": "週四", "zh-CN": "周四", "ko": "목"},
    4: {"en": "Fri", "zh-TW": "週五", "zh-CN": "周五", "ko": "금"},
    5: {"en": "Sat", "zh-TW": "週六", "zh-CN": "周六", "ko": "토"},
    6: {"en": "Sun", "zh-TW": "週日", "zh-CN": "周日", "ko": "일"},
}


def get_weekly_outlook(
    dm_element: str,
    use_god: str,
    use_god_2: str,
    avoid_god: str,
    avoid_god_2: str,
    natal_branch_indices: List[int],
    target_date: date,
    language: str,
) -> List[dict]:
    """7-day score trend starting from Mon of the week containing target_date."""
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"

    # Find Monday of the target week
    monday = target_date - timedelta(days=target_date.weekday())

    week = []
    for i in range(7):
        d = monday + timedelta(days=i)
        d_stem, d_branch = get_daily_pillar(d)
        d_elem = get_stem_element(d_stem)
        d_branch_idx = BRANCH_INDEX[d_branch]

        sc = calculate_overall_score(
            dm_element, use_god, use_god_2, avoid_god, avoid_god_2,
            d_elem, d_branch_idx, natal_branch_indices,
        )

        week.append({
            "date": d.isoformat(),
            "day": _DAY_NAMES.get(d.weekday(), {}).get(lang, ""),
            "score": sc,
            "element": d_elem,
            "is_today": d == target_date,
        })
    return week


# ────────────────────────────────────────────────────────────
# Fortune mood
# ────────────────────────────────────────────────────────────

def get_fortune_mood(score: int, language: str) -> str:
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"
    for threshold, labels in _MOOD_TIERS:
        if score >= threshold:
            return labels.get(lang, labels["en"])
    return _MOOD_TIERS[-1][1].get(lang, "")


# ════════════════════════════════════════════════════════════
# Main entry point
# ════════════════════════════════════════════════════════════

def calculate_daily_forecast(chart: dict, language: str = "en", target_date: Optional[date] = None) -> dict:
    """
    Full daily forecast for a natal chart and a target date.

    Args:
        chart: result of calculate_bazi()
        language: en / zh-TW / zh-CN / ko
        target_date: defaults to today

    Returns:
        Complete forecast dict suitable for JSON serialisation.
    """
    if target_date is None:
        target_date = date.today()

    # ---- Extract natal chart info ----
    dm_element = chart["day_master"]["element"]
    ug_data = chart.get("use_god", {})
    use_god_elem = ug_data.get("use_god", dm_element)
    use_god_2 = ug_data.get("use_god_secondary", "")
    avoid_god_elem = ug_data.get("avoid_god", "")
    avoid_god_2 = ug_data.get("avoid_god_secondary", "")

    natal_branches = _get_natal_branch_indices(chart)
    fp = chart.get("four_pillars", {})
    day_branch_cn = fp.get("day", {}).get("branch", {}).get("name_cn", "")
    natal_day_branch_idx = BRANCH_NAME_TO_INDEX.get(day_branch_cn, 0)

    # ---- Daily pillar ----
    daily_stem, daily_branch = get_daily_pillar(target_date)
    daily_elem = get_stem_element(daily_stem)
    daily_branch_idx = BRANCH_INDEX[daily_branch]

    # ---- Scores ----
    overall = calculate_overall_score(
        dm_element, use_god_elem, use_god_2, avoid_god_elem, avoid_god_2,
        daily_elem, daily_branch_idx, natal_branches,
    )

    mood = get_fortune_mood(overall, language)

    domains = calculate_domain_scores(
        dm_element, use_god_elem, avoid_god_elem,
        daily_elem, daily_branch_idx, natal_day_branch_idx, natal_branches,
    )

    lucky = get_lucky_items(use_god_elem, daily_stem, daily_branch, dm_element, language)

    dos, donts = get_dos_and_donts(dm_element, use_god_elem, avoid_god_elem, daily_elem, language)

    energy = get_energy_rhythm(dm_element, use_god_elem, daily_stem, language)

    weekly = get_weekly_outlook(
        dm_element, use_god_elem, use_god_2, avoid_god_elem, avoid_god_2,
        natal_branches, target_date, language,
    )

    return {
        "date": target_date.isoformat(),
        "daily_pillar": {
            "stem": stem_to_dict(daily_stem),
            "branch": branch_to_dict(daily_branch),
        },
        "overall_score": overall,
        "mood": mood,
        "domains": domains,
        "lucky": lucky,
        "dos": dos,
        "donts": donts,
        "energy_rhythm": energy,
        "weekly_trend": weekly,
    }
