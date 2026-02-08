"""
Prompts for BAZI insights generation
Supports English, Traditional Chinese, Simplified Chinese, and Korean
"""


def get_system_message(language: str = "en") -> str:
    """Get system message for the AI in specified language"""
    
    if language == "zh-TW":
        return """你是一位經驗豐富的八字大師。你對八字命理有深入的理解，並能夠根據四柱八字提供深刻且實用的人生指導。

你的分析應該：
1. 直接、具體地解釋日主的強弱
2. 提供關於職業、財富、關係和健康的實用建議
3. 解釋幸運周期和時機
4. 以同情心和尊重的態度對待
5. 提供可行的、基於五行平衡原則的建議

分析結構（請按照以下格式）：
### 1. 命盤結構與強弱分析
### 2. 職業與財富
### 3. 關係與婚姻
### 4. 健康與養生
### 5. 性格與品質
### 6. 幸運周期與時機
### 7. 人生指引與個人發展

用繁體中文回應。"""
    
    elif language == "zh-CN":
        return """你是一位经验丰富的八字大师。你对八字命理有深入的理解，并能够根据四柱八字提供深刻且实用的人生指导。

你的分析应该：
1. 直接、具体地解释日主的强弱
2. 提供关于职业、财富、关系和健康的实用建议
3. 解释幸运周期和时机
4. 以同情心和尊重的态度对待
5. 提供可行的、基于五行平衡原则的建议

分析结构（请按照以下格式）：
### 1. 命盘结构与强弱分析
### 2. 职业与财富
### 3. 关系与婚姻
### 4. 健康与养生
### 5. 性格与品质
### 6. 幸运周期与时机
### 7. 人生指引与个人发展

用简体中文回应。"""
    
    elif language == "ko":
        return """당신은 사주 명리학에 깊은 이해를 가진 경험 많은 사주 전문가입니다. 사주팔자를 바탕으로 깊고 실용적인 인생 지도를 제공할 수 있습니다.

분석 시 다음을 수행하세요:
1. 일주의 강약을 직접적이고 구체적으로 설명
2. 직업, 재물, 관계, 건강에 대한 실용적 조언 제공
3. 대운 주기와 시기 설명
4. 공감과 존중의 태도로 대하기
5. 오행 균형 원칙에 기반한 실천 가능한 조언 제공

분석 구조 (다음 형식을 따르세요):
### 1. 사주 구조와 강약 분석
### 2. 직업과 재물
### 3. 관계와 결혼
### 4. 건강과 양생
### 5. 성격과 품성
### 6. 대운 주기와 시기
### 7. 인생 가이드와 자기계발

한국어로만 응답하세요. 다른 언어를 섞지 마세요."""
    
    else:  # English (default)
        return """You are an experienced BAZI master with deep knowledge of Chinese metaphysics and destiny analysis.

Your analysis should:
1. Directly and specifically explain the strength/weakness of the Day Master
2. Provide practical guidance on career, wealth, relationships, and health
3. Explain luck cycles and timing
4. Be compassionate and respectful in tone
5. Offer actionable advice based on Five Element balance principles

Analysis Structure (follow this format):
### 1. Chart Structure & Strength Analysis
### 2. Career & Finance
### 3. Relationships & Marriage
### 4. Health & Wellness
### 5. Personality & Character
### 6. Luck Cycles & Timing
### 7. Life Guidance & Personal Development

Respond in English."""


def get_analysis_prompt(bazi_data: dict, language: str = "en") -> str:
    """Generate the user prompt with BAZI data in specified language"""
    
    # Extract data
    year_stem = bazi_data.get('four_pillars', {}).get('year', {}).get('stem', {}).get('name_cn', '')
    year_branch = bazi_data.get('four_pillars', {}).get('year', {}).get('branch', {}).get('name_cn', '')
    month_stem = bazi_data.get('four_pillars', {}).get('month', {}).get('stem', {}).get('name_cn', '')
    month_branch = bazi_data.get('four_pillars', {}).get('month', {}).get('branch', {}).get('name_cn', '')
    day_stem = bazi_data.get('four_pillars', {}).get('day', {}).get('stem', {}).get('name_cn', '')
    day_branch = bazi_data.get('four_pillars', {}).get('day', {}).get('branch', {}).get('name_cn', '')
    hour_stem = bazi_data.get('four_pillars', {}).get('hour', {}).get('stem', {}).get('name_cn', '')
    hour_branch = bazi_data.get('four_pillars', {}).get('hour', {}).get('branch', {}).get('name_cn', '')
    
    elements = bazi_data.get('elements', {}).get('counts', {})
    day_master = bazi_data.get('day_master', {}).get('element', '')
    balance = bazi_data.get('elements', {}).get('analysis', {}).get('balance', '')
    age_periods = bazi_data.get('age_periods', [])
    strongest_ten_god = bazi_data.get('strongest_ten_god', {})
    annual_luck = bazi_data.get('annual_luck', {})
    seasonal_strength = bazi_data.get('seasonal_strength', {})
    deities = bazi_data.get('deities', [])

    # Build hidden stems summary
    hidden_stems_parts = []
    for pn in ['year', 'month', 'day', 'hour']:
        branch = bazi_data.get('four_pillars', {}).get(pn, {}).get('branch', {})
        hs = branch.get('hidden_stems', [])
        if hs:
            names = ''.join([s.get('name_cn', '') for s in hs])
            hidden_stems_parts.append(f"{pn}: {names}")
    hidden_stems_text = "; ".join(hidden_stems_parts) if hidden_stems_parts else ""

    # Build Ten Gods text
    ten_gods_name_en = strongest_ten_god.get('name_en', '')
    ten_gods_name_cn = strongest_ten_god.get('name_cn', '')
    ten_gods_count = strongest_ten_god.get('count', 0)

    # Build Annual Luck text
    annual_pillar = annual_luck.get('annual_pillar', {})
    annual_year = annual_pillar.get('year', '')
    annual_stem = annual_pillar.get('stem', {}).get('name_cn', '')
    annual_branch = annual_pillar.get('branch', {}).get('name_cn', '')
    interactions = annual_luck.get('interactions', [])

    if language == "zh-TW":
        age_periods_text = ""
        if age_periods:
            age_periods_text = "\\n主要十年大運（含建議，簡要）：\\n"
            for period in age_periods[:5]:
                start_age = period.get("start_age")
                end_age = period.get("end_age")
                quality = period.get("quality", "")
                pillar_stem = period.get("luck_pillar", {}).get("stem", {}).get("name_cn", "")
                pillar_branch = period.get("luck_pillar", {}).get("branch", {}).get("name_cn", "")
                summary = period.get("summary", "")
                focus = period.get("focus_areas", []) or []
                focus_text = "；".join(focus[:2])
                age_periods_text += f"- 年齡 {start_age}–{end_age} 歲：{pillar_stem}{pillar_branch}，整體運勢：{quality}。重點：{focus_text}。概要：{summary}\\n"
        
        return f"""請分析以下八字命盤：

四柱：
- 年柱：{year_stem}{year_branch}
- 月柱：{month_stem}{month_branch}
- 日柱：{day_stem}{day_branch}
- 時柱：{hour_stem}{hour_branch}

五行統計：
- 木：{elements.get('Wood', 0)}
- 火：{elements.get('Fire', 0)}
- 土：{elements.get('Earth', 0)}
- 金：{elements.get('Metal', 0)}
- 水：{elements.get('Water', 0)}

日主：{day_master}
五行平衡狀態：{balance}
{age_periods_text}
十神：此命盤最突出的十神是{ten_gods_name_cn}（{ten_gods_name_en}），出現{ten_gods_count}次，影響性格與人生主題。
流年：當前年份{annual_year}年柱為{annual_stem}{annual_branch}。與命盤互動：{"；".join([i.get("description", "") for i in interactions]) if interactions else "無特殊沖合"}。分析時請考慮今年的流年動態。
得令：{seasonal_strength.get("strength", "")} — {seasonal_strength.get("explanation_zh_tw", "")}
藏干：{hidden_stems_text if hidden_stems_text else "無"}
神煞：{"; ".join([f"{d.get('name_cn', '')}({d.get('name_en', '')}): {d.get('interpretation_zh_tw', '')}" for d in deities]) if deities else "無"}

請提供深入的八字分析和人生指導。並請在分析結尾加上「### 8. 流年展望」簡要預測今年運勢。"""
    
    elif language == "zh-CN":
        age_periods_text = ""
        if age_periods:
            age_periods_text = "\\n主要十年大运（含建议，简要）：\\n"
            for period in age_periods[:5]:
                start_age = period.get("start_age")
                end_age = period.get("end_age")
                quality = period.get("quality", "")
                pillar_stem = period.get("luck_pillar", {}).get("stem", {}).get("name_cn", "")
                pillar_branch = period.get("luck_pillar", {}).get("branch", {}).get("name_cn", "")
                summary = period.get("summary", "")
                focus = period.get("focus_areas", []) or []
                focus_text = "；".join(focus[:2])
                age_periods_text += f"- 年龄 {start_age}–{end_age} 岁：{pillar_stem}{pillar_branch}，整体运势：{quality}。重点：{focus_text}。概要：{summary}\\n"
        
        return f"""请分析以下八字命盘：

四柱：
- 年柱：{year_stem}{year_branch}
- 月柱：{month_stem}{month_branch}
- 日柱：{day_stem}{day_branch}
- 时柱：{hour_stem}{hour_branch}

五行统计：
- 木：{elements.get('Wood', 0)}
- 火：{elements.get('Fire', 0)}
- 土：{elements.get('Earth', 0)}
- 金：{elements.get('Metal', 0)}
- 水：{elements.get('Water', 0)}

日主：{day_master}
五行平衡状态：{balance}
{age_periods_text}
十神：此命盘最突出的十神是{ten_gods_name_cn}（{ten_gods_name_en}），出现{ten_gods_count}次，影响性格与人生主题。
流年：当前年份{annual_year}年柱为{annual_stem}{annual_branch}。与命盘互动：{"；".join([i.get("description", "") for i in interactions]) if interactions else "无特殊冲合"}。分析时请考虑今年的流年动态。
得令：{seasonal_strength.get("strength", "")} — {seasonal_strength.get("explanation_zh_cn", "")}
藏干：{hidden_stems_text if hidden_stems_text else "无"}
神煞：{"; ".join([f"{d.get('name_cn', '')}({d.get('name_en', '')}): {d.get('interpretation_zh_cn', '')}" for d in deities]) if deities else "无"}

请提供深入的八字分析和人生指导。并在分析结尾加上「### 8. 流年展望」简要预测今年运势。"""
    
    elif language == "ko":
        age_periods_text = ""
        if age_periods:
            age_periods_text = "\\n주요 10년 대운 (조언 포함, 요약):\\n"
            for period in age_periods[:5]:
                start_age = period.get("start_age")
                end_age = period.get("end_age")
                quality = period.get("quality", "")
                pillar_stem = period.get("luck_pillar", {}).get("stem", {}).get("name_cn", "")
                pillar_branch = period.get("luck_pillar", {}).get("branch", {}).get("name_cn", "")
                summary = period.get("summary", "")
                focus = period.get("focus_areas", []) or []
                focus_text = "；".join(focus[:2])
                age_periods_text += f"- 나이 {start_age}–{end_age}세：{pillar_stem}{pillar_branch}，전체 운세：{quality}。핵심：{focus_text}。요약：{summary}\\n"
        
        expl_ko = seasonal_strength.get("explanation_ko", "") or seasonal_strength.get("explanation_en", "")
        deities_ko = "; ".join([f"{d.get('name_cn', '')}({d.get('name_en', '')}): {d.get('interpretation_ko', d.get('interpretation_en', ''))}" for d in deities]) if deities else "없음"
        
        return f"""다음 사주 명반을 분석해 주세요:

사주:
- 년주：{year_stem}{year_branch}
- 월주：{month_stem}{month_branch}
- 일주：{day_stem}{day_branch}
- 시주：{hour_stem}{hour_branch}

오행 통계:
- 목：{elements.get('Wood', 0)}
- 화：{elements.get('Fire', 0)}
- 토：{elements.get('Earth', 0)}
- 금：{elements.get('Metal', 0)}
- 수：{elements.get('Water', 0)}

일주：{day_master}
오행 균형 상태：{balance}
{age_periods_text}
십성：이 명반에서 가장 두드러진 십성은 {ten_gods_name_cn}（{ten_gods_name_en}）이며 {ten_gods_count}회 출현합니다. 성격과 인생 주제에 영향을 줍니다.
유년：현재 연도 {annual_year}년주는 {annual_stem}{annual_branch}입니다. 명반과의 상호작용：{"；".join([i.get("description", "") for i in interactions]) if interactions else "특별한 충합 없음"}。올해 유년 동태를 고려하여 분석해 주세요.
득령：{seasonal_strength.get("strength", "")} — {expl_ko}
장간：{hidden_stems_text if hidden_stems_text else "없음"}
신살：{deities_ko}

깊이 있는 사주 분석과 인생 지도를 제공해 주세요. 분석 끝에「### 8. 연간 전망」을 추가하여 올해 운세를 간단히 예측해 주세요."""
    
    else:  # English (default)
        age_periods_text = ""
        if age_periods:
            age_periods_text = "\\nKey ten-year luck periods (with guidance, summary):\\n"
            for period in age_periods[:5]:
                start_age = period.get("start_age")
                end_age = period.get("end_age")
                quality = period.get("quality", "")
                pillar_stem = period.get("luck_pillar", {}).get("stem", {}).get("name_cn", "")
                pillar_branch = period.get("luck_pillar", {}).get("branch", {}).get("name_cn", "")
                summary = period.get("summary", "")
                focus = period.get("focus_areas", []) or []
                focus_text = "; ".join(focus[:2])
                age_periods_text += f"- Age {start_age}–{end_age}: {pillar_stem}{pillar_branch}, overall luck: {quality}. Focus: {focus_text}. Summary: {summary}\\n"
        
        return f"""Please provide a BAZI analysis for the following birth chart:

Four Pillars:
- Year: {year_stem}{year_branch}
- Month: {month_stem}{month_branch}
- Day: {day_stem}{day_branch}
- Hour: {hour_stem}{hour_branch}

Five Elements Count:
- Wood: {elements.get('Wood', 0)}
- Fire: {elements.get('Fire', 0)}
- Earth: {elements.get('Earth', 0)}
- Metal: {elements.get('Metal', 0)}
- Water: {elements.get('Water', 0)}

Day Master: {day_master}
Element Balance Status: {balance}
{age_periods_text}
Ten Gods: The strongest Ten God in this chart is {ten_gods_name_en} ({ten_gods_name_cn}), appearing {ten_gods_count} times. This influences personality and life themes.
Annual Luck: The current year {annual_year} pillar is {annual_stem}{annual_branch}. Interactions with natal chart: {"; ".join([i.get("description", "") for i in interactions]) if interactions else "None"}. Consider these when discussing this year's outlook.
Seasonal Strength: {seasonal_strength.get("strength", "")} — {seasonal_strength.get("explanation_en", "")}
Hidden Stems (藏干): {hidden_stems_text if hidden_stems_text else "None"}
Deities (神煞): {"; ".join([f"{d.get('name_en', '')}({d.get('name_cn', '')}): {d.get('interpretation_en', '')}" for d in deities]) if deities else "None"}

Please provide deep insights and practical guidance for this person's destiny. Include a brief "### 8. Yearly Forecast" section at the end with a 1-2 sentence outlook for the current year.

In particular, please:
- Explain the life story by decades, using the provided ten-year luck periods as the main structure.
- Highlight 3–5 key milestone ages and suggest what the person can do at those times to align with their chart.
- Give practical, concrete suggestions for how to navigate both auspicious and challenging decades."""


# ==================== Section-specific prompts (150 words max each) ====================

def _get_section_system_message(language: str) -> str:
    """System message for section prompts: concise, actionable, strict template."""
    lang_map = {
        "zh-TW": "繁體中文",
        "zh-CN": "简体中文",
        "ko": "한국어",
    }
    lang_name = lang_map.get(language, "English")
    base = f"You are a BAZI expert. Respond in {lang_name}. Maximum 150 words. Be concise and actionable."
    if language in ("zh-TW", "zh-CN"):
        base += f" Respond ONLY in {lang_name}. Do not include any English words."
    elif language == "ko":
        base += f" Respond ONLY in {lang_name}. Do not include English words. Chinese characters (Hanja) for BAZI terms are acceptable."
    else:
        base += f" Respond ONLY in {lang_name}. Chinese characters for BAZI terms (e.g. pillar names) are acceptable for authenticity."
    base += (
        " CRITICAL: Follow the EXACT output template in the user message."
        " Use the EXACT label names provided (e.g. 'Theme:', 'Do:', 'Avoid:')."
        " Each label must appear on its own line, followed by a colon and its value."
        " Bullet points under a label use '- ' prefix."
        " Do NOT add extra labels, do NOT reorder labels, do NOT skip any label."
        " Do NOT use numbered lists (1. 2. 3.) — use ONLY the label: value format and '- ' bullet points."
        " Do NOT use markdown ** for bold — use plain text."
        " Use concrete examples relevant to the user's chart data."
    )
    if language in ("zh-TW", "zh-CN"):
        base += " IMPORTANT: All label names must be in Chinese as specified in the template. Do NOT use English labels like 'Do:', 'Avoid:', 'Focus:' — use the exact Chinese labels provided."
    elif language == "ko":
        base += " IMPORTANT: All label names must be in Korean as specified in the template. Do NOT use English labels like 'Do:', 'Avoid:', 'Focus:' — use the exact Korean labels provided."
    return base


def _get_elements_in_pillars(bazi_data: dict) -> str:
    """e.g. Year: Wood+Fire, Month: Earth+Wood, Day: Metal+Fire, Hour: Water+Earth"""
    fp = bazi_data.get("four_pillars", {})
    parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s_elem = p.get("stem", {}).get("element", "")
        b_elem = p.get("branch", {}).get("element", "")
        parts.append(f"{pn.capitalize()}: {s_elem}+{b_elem}" if s_elem and b_elem else f"{pn.capitalize()}: -")
    return ", ".join(parts)


def _get_absent_elements(counts: dict) -> list:
    """Elements with count 0"""
    return [k for k, v in (counts or {}).items() if v == 0]


def _get_ten_god_pillar_locations(four_pillars: dict, strongest_key: str) -> str:
    """e.g. Year stem, Month branch, Hour stem"""
    if not strongest_key:
        return ""
    locations = []
    for pn in ["year", "month", "day", "hour"]:
        p = four_pillars.get(pn, {})
        stem = p.get("stem", {})
        branch = p.get("branch", {})
        if stem.get("ten_god", {}).get("key") == strongest_key:
            locations.append(f"{pn.capitalize()} stem")
        if branch.get("ten_god", {}).get("key") == strongest_key:
            locations.append(f"{pn.capitalize()} branch")
    return ", ".join(locations) if locations else ""


_ZODIAC_I18N = {
    "Rat":     {"en": "Rat",     "zh-TW": "鼠", "zh-CN": "鼠", "ko": "쥐"},
    "Ox":      {"en": "Ox",      "zh-TW": "牛", "zh-CN": "牛", "ko": "소"},
    "Tiger":   {"en": "Tiger",   "zh-TW": "虎", "zh-CN": "虎", "ko": "호랑이"},
    "Rabbit":  {"en": "Rabbit",  "zh-TW": "兔", "zh-CN": "兔", "ko": "토끼"},
    "Dragon":  {"en": "Dragon",  "zh-TW": "龍", "zh-CN": "龙", "ko": "용"},
    "Snake":   {"en": "Snake",   "zh-TW": "蛇", "zh-CN": "蛇", "ko": "뱀"},
    "Horse":   {"en": "Horse",   "zh-TW": "馬", "zh-CN": "马", "ko": "말"},
    "Goat":    {"en": "Goat",    "zh-TW": "羊", "zh-CN": "羊", "ko": "양"},
    "Monkey":  {"en": "Monkey",  "zh-TW": "猴", "zh-CN": "猴", "ko": "원숭이"},
    "Rooster": {"en": "Rooster", "zh-TW": "雞", "zh-CN": "鸡", "ko": "닭"},
    "Dog":     {"en": "Dog",     "zh-TW": "狗", "zh-CN": "狗", "ko": "개"},
    "Pig":     {"en": "Pig",     "zh-TW": "豬", "zh-CN": "猪", "ko": "돼지"},
}

def _localize_zodiac(zodiac: str, lang: str) -> str:
    return _ZODIAC_I18N.get(zodiac, {}).get(lang, zodiac or "")


def _get_pillar_naming(stem_dict: dict, branch_dict: dict, language: str = "en") -> str:
    """Pillar naming localized by language.
    en:    丙午 (Fire Horse)
    zh-*:  丙午
    ko:    丙午 (화 말)
    """
    stem_cn = stem_dict.get("name_cn", "")
    branch_cn = branch_dict.get("name_cn", "")
    base = f"{stem_cn}{branch_cn}" if stem_cn and branch_cn else ""
    if not base:
        return ""
    if language in ("zh-TW", "zh-CN"):
        return base  # Chinese-only, no English annotation
    stem_elem = stem_dict.get("element", "")
    branch_zodiac = branch_dict.get("zodiac", "")
    if language == "ko":
        elem_ko = _localize_elem(stem_elem, "ko")
        zodiac_ko = _localize_zodiac(branch_zodiac, "ko")
        if elem_ko and zodiac_ko:
            return f"{base} ({elem_ko} {zodiac_ko})"
        return base
    # English
    if stem_elem and branch_zodiac:
        return f"{base} ({stem_elem} {branch_zodiac})"
    return base


def get_five_elements_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Five Elements: elements.counts, elements.analysis, day_master → strict template."""
    elements = bazi_data.get("elements", {})
    counts = elements.get("counts", {})
    analysis = elements.get("analysis", {})
    day_master = bazi_data.get("day_master", {}).get("element", "")
    strongest = bazi_data.get("strongest_ten_god", {})
    ten_god_name = strongest.get("name_en", "")

    elem_str = ", ".join([f"{k}:{v}" for k, v in counts.items()])
    balance = analysis.get("balance", "")
    elements_in_pillars = _get_elements_in_pillars(bazi_data)
    absent = _get_absent_elements(counts)
    absent_str = ", ".join(absent) if absent else "none"

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = (
            f"五行統計：{elem_str}。日主：{day_master}。平衡：{balance}。\n"
            f"四柱五行分布：{elements_in_pillars}。缺失五行：{absent_str}。最突出十神：{ten_god_name}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號）：\n\n"
            f"概述：（1–2句說明五行整體平衡狀況及對命主的影響）\n"
            f"出現：（列出在四柱中出現的五行及數量）\n"
            f"缺失：（列出缺失的五行，或「無」）\n\n"
            f"做：\n- （具體行動1，如「因水為0，週三穿藍色」）\n- （具體行動2）\n- （具體行動3）\n\n"
            f"避免：\n- （具體避免事項1）\n- （具體避免事項2）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"五行统计：{elem_str}。日主：{day_master}。平衡：{balance}。\n"
            f"四柱五行分布：{elements_in_pillars}。缺失五行：{absent_str}。最突出十神：{ten_god_name}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号）：\n\n"
            f"概述：（1–2句说明五行整体平衡状况及对命主的影响）\n"
            f"出现：（列出在四柱中出现的五行及数量）\n"
            f"缺失：（列出缺失的五行，或「无」）\n\n"
            f"做：\n- （具体行动1，如「因水为0，周三穿蓝色」）\n- （具体行动2）\n- （具体行动3）\n\n"
            f"避免：\n- （具体避免事项1）\n- （具体避免事项2）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"오행 통계：{elem_str}。일주：{day_master}。균형：{balance}。\n"
            f"사주 오행 분포：{elements_in_pillars}。결핍 오행：{absent_str}。가장 두드러진 십성：{ten_god_name}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론）：\n\n"
            f"개요：（1–2문장으로 오행 전체 균형 상태와 명주에 대한 영향）\n"
            f"출현：（사주에 출현하는 오행과 수량 나열）\n"
            f"결핍：（결핍 오행 나열 또는「없음」）\n\n"
            f"하세요：\n- （구체적 행동1，예: 수가 0이므로 수요일에 파란색 착용）\n- （구체적 행동2）\n- （구체적 행동3）\n\n"
            f"피하세요：\n- （구체적 회피 사항1）\n- （구체적 회피 사항2）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Five Elements: {elem_str}. Day Master: {day_master}. Balance: {balance}.\n"
            f"Elements in pillars: {elements_in_pillars}. Absent elements: {absent_str}. Strongest Ten God: {ten_god_name}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Overview: (1-2 sentences on overall element balance and its effect on the person)\n"
            f"Present: (list elements present with counts)\n"
            f"Missing: (list absent elements, or 'None')\n\n"
            f"Do:\n- (specific action 1, e.g. 'Since Water is 0, wear blue on Wednesdays')\n- (specific action 2)\n- (specific action 3)\n\n"
            f"Avoid:\n- (specific avoidance 1)\n- (specific avoidance 2)\n\n"
            f"150 words max. Respond in English."
        )
    return (system, user)


def get_ten_gods_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Ten Gods: strongest_ten_god, four_pillars summary → strict template."""
    strongest = bazi_data.get("strongest_ten_god", {})
    name_en = strongest.get("name_en", "")
    name_cn = strongest.get("name_cn", "")
    count = strongest.get("count", 0)
    strongest_key = strongest.get("key") or strongest.get("strongest_ten_god", "")
    ss = bazi_data.get("seasonal_strength", {})
    seasonal_str = ss.get("strength", "")

    fp = bazi_data.get("four_pillars", {})
    pillars_parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s = p.get("stem", {}).get("name_cn", "")
        b = p.get("branch", {}).get("name_cn", "")
        pillars_parts.append(f"{pn}:{s}{b}")
    pillars_str = ", ".join(pillars_parts)
    locations = _get_ten_god_pillar_locations(fp, strongest_key)
    day_master = bazi_data.get("day_master", {}).get("element", "")

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = (
            f"四柱：{pillars_str}。日主：{day_master}。最突出十神：{name_cn}，出現{count}次。\n"
            f"出現位置：{locations or '見於命盤'}。得令狀態：{seasonal_str}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號）：\n\n"
            f"角色：（此十神代表什麼，1句話）\n"
            f"互動：（此十神與日主五行的生剋關係，結合得令狀態說明）\n\n"
            f"事業：\n- （事業/工作表現1）\n- （事業/工作表現2）\n\n"
            f"感情：\n- （感情/關係表現1）\n- （感情/關係表現2）\n\n"
            f"做：（利用此十神能量的具體行動）\n"
            f"避免：（此十神過強時應避免什麼）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"四柱：{pillars_str}。日主：{day_master}。最突出十神：{name_cn}，出现{count}次。\n"
            f"出现位置：{locations or '见于命盘'}。得令状态：{seasonal_str}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号）：\n\n"
            f"角色：（此十神代表什么，1句话）\n"
            f"互动：（此十神与日主五行的生克关系，结合得令状态说明）\n\n"
            f"事业：\n- （事业/工作表现1）\n- （事业/工作表现2）\n\n"
            f"感情：\n- （感情/关系表现1）\n- （感情/关系表现2）\n\n"
            f"做：（利用此十神能量的具体行动）\n"
            f"避免：（此十神过强时应避免什么）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"사주：{pillars_str}。일주：{day_master}。가장 두드러진 십성：{name_cn}，{count}회 출현。\n"
            f"출현 위치：{locations or '명반 내'}。득령 상태：{seasonal_str}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론）：\n\n"
            f"역할：（이 십성이 대표하는 것，1문장）\n"
            f"상호작용：（이 십성과 일주 오행의 생극 관계，득령 상태와 연결하여 설명）\n\n"
            f"직업：\n- （직업/업무 표현1）\n- （직업/업무 표현2）\n\n"
            f"인간관계：\n- （인간관계 표현1）\n- （인간관계 표현2）\n\n"
            f"하세요：（이 십성 에너지를 활용하는 구체적 행동）\n"
            f"피하세요：（이 십성이 과한 경우 피해야 할 것）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Four Pillars: {pillars_str}. Day Master: {day_master}. Strongest Ten God: {name_en} ({name_cn}), appears {count} times.\n"
            f"Locations: {locations or 'in chart'}. Seasonal Strength: {seasonal_str}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Role: (what this Ten God represents, 1 sentence)\n"
            f"Interaction: (how it interacts with Day Master element — generates/controls/same — considering Seasonal Strength)\n\n"
            f"Career:\n- (career/work manifestation 1)\n- (career/work manifestation 2)\n\n"
            f"Relationships:\n- (relationship manifestation 1)\n- (relationship manifestation 2)\n\n"
            f"Do: (specific action to harness this Ten God energy)\n"
            f"Avoid: (what to avoid when this Ten God is dominant)\n\n"
            f"150 words max. Respond in English."
        )
    return (system, user)


def get_seasonal_strength_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Seasonal Strength: seasonal_strength, day_master → strict template."""
    ss = bazi_data.get("seasonal_strength", {})
    strength = ss.get("strength", "")
    expl_en = ss.get("explanation_en", "")
    expl_tw = ss.get("explanation_zh_tw", "")
    expl_cn = ss.get("explanation_zh_cn", "")
    day_master = bazi_data.get("day_master", {}).get("element", "")

    fp = bazi_data.get("four_pillars", {})
    month_p = fp.get("month", {})
    month_stem = month_p.get("stem", {}).get("name_cn", "")
    month_branch = month_p.get("branch", {}).get("name_cn", "")
    month_str = f"{month_stem}{month_branch}"

    al = bazi_data.get("annual_luck", {})
    ap = al.get("annual_pillar", {})
    year = ap.get("year", "")
    ann_stem = ap.get("stem", {}).get("name_cn", "")
    ann_branch = ap.get("branch", {}).get("name_cn", "")
    annual_str = f"{year} {ann_stem}{ann_branch}"

    system = _get_section_system_message(language)
    expl_ko = ss.get("explanation_ko", "") or expl_en
    if language == "zh-TW":
        user = (
            f"日主：{day_master}。得令狀態：{strength}。說明：{expl_tw or expl_en}\n"
            f"月柱：{month_str}。流年：{annual_str}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號）：\n\n"
            f"含義：（出生月份季節如何影響日主五行，1–2句）\n"
            f"今年：（結合流年{year}，得令如何指導今年決策）\n\n"
            f"本季：\n- （當前季節的具體決策建議1）\n- （當前季節的具體決策建議2）\n\n"
            f"做：（本月或本季的具體行動）\n"
            f"避免：（本月或本季應避免的事項）\n"
            f"時機：（最佳時間窗口建議，如「春季前三個月」）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"日主：{day_master}。得令状态：{strength}。说明：{expl_cn or expl_en}\n"
            f"月柱：{month_str}。流年：{annual_str}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号）：\n\n"
            f"含义：（出生月份季节如何影响日主五行，1–2句）\n"
            f"今年：（结合流年{year}，得令如何指导今年决策）\n\n"
            f"本季：\n- （当前季节的具体决策建议1）\n- （当前季节的具体决策建议2）\n\n"
            f"做：（本月或本季的具体行动）\n"
            f"避免：（本月或本季应避免的事项）\n"
            f"时机：（最佳时间窗口建议，如「春季前三个月」）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"일주：{day_master}。득령 상태：{strength}。설명：{expl_ko}\n"
            f"월주：{month_str}。유년：{annual_str}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론）：\n\n"
            f"의미：（출생 월의 계절이 일주 오행에 어떻게 영향을 미치는지，1–2문장）\n"
            f"올해：（유년 {year}와 결합하여 득령이 올해 결정에 어떻게 지침을 주는지）\n\n"
            f"이번 계절：\n- （현재 계절의 구체적 결정 조언1）\n- （현재 계절의 구체적 결정 조언2）\n\n"
            f"하세요：（이번 달 또는 이번 계절의 구체적 행동）\n"
            f"피하세요：（이번 달 또는 이번 계절에 피해야 할 사항）\n"
            f"시기：（최적 시간 창 제안，예: 봄철 첫 3개월）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Day Master: {day_master}. Seasonal strength: {strength}. Explanation: {expl_en}\n"
            f"Month pillar: {month_str}. Annual forecast: {annual_str}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Meaning: (how birth month season affects Day Master element, 1-2 sentences)\n"
            f"This Year: (how seasonal strength combined with {year} annual pillar guides this year's decisions)\n\n"
            f"This Season:\n- (specific seasonal guidance 1)\n- (specific seasonal guidance 2)\n\n"
            f"Do: (specific action for this month or season)\n"
            f"Avoid: (what to avoid this month or season)\n"
            f"Timing: (best time window advice, e.g. 'first three months of spring')\n\n"
            f"150 words max. Respond in English."
        )
    return (system, user)


def get_annual_forecast_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Annual Forecast: annual_luck, four_pillars → strict quarterly template."""
    from datetime import datetime

    al = bazi_data.get("annual_luck", {})
    ap = al.get("annual_pillar", {})
    year = ap.get("year", "")
    stem = ap.get("stem", {})
    branch = ap.get("branch", {})
    stem_elem = stem.get("element", "")
    branch_zodiac = branch.get("zodiac", "")
    pillar_naming = _get_pillar_naming(stem, branch, language)
    interactions = al.get("interactions", [])
    int_desc = "; ".join([i.get("description", "") for i in interactions]) if interactions else ""

    birth_date_str = bazi_data.get("input", {}).get("birth_date", "")
    birth_year = int(birth_date_str[:4]) if birth_date_str else datetime.now().year
    current_age = datetime.now().year - birth_year
    age_periods = bazi_data.get("age_periods", [])
    current_period = None
    for p in age_periods:
        if p.get("start_age", 0) <= current_age < p.get("end_age", 0):
            current_period = p
            break
    if not current_period and age_periods:
        current_period = age_periods[0]

    fp = bazi_data.get("four_pillars", {})
    pillars_parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s = p.get("stem", {}).get("name_cn", "")
        b = p.get("branch", {}).get("name_cn", "")
        pillars_parts.append(f"{s}{b}")
    pillars_str = " ".join(pillars_parts)

    # Localize element/zodiac for the template hint text
    l_elem = _localize_elem(stem_elem, language)
    l_zodiac = _localize_zodiac(branch_zodiac, language)

    system = _get_section_system_message(language)
    if language == "zh-TW":
        period_str_tw = ""
        if current_period:
            sa = current_period.get("start_age", "")
            ea = current_period.get("end_age", "")
            lp = current_period.get("luck_pillar", {})
            period_str_tw = f"年齡 {sa}–{ea} 歲，{_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}), 'zh-TW')}"
        user = (
            f"命盤四柱：{pillars_str}。流年{year}：{pillar_naming}。與命盤互動：{int_desc or '無特殊沖合'}\n"
            f"當前年齡段：{period_str_tw}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號。每個 Q 只寫一行，不要加子標籤）：\n\n"
            f"主題：（{year}年整體主題，一個短語）\n"
            f"概述：（1–2句連結流年柱{l_elem}{l_zodiac}與命盤的互動）\n\n"
            f"Q1：（1–3月的重點行動，一句話）\n"
            f"Q2：（4–6月的重點行動，一句話）\n"
            f"Q3：（7–9月的重點行動，一句話）\n"
            f"Q4：（10–12月的重點行動，一句話）\n\n"
            f"吉月：（最有利的具體月份）\n"
            f"凶月：（需謹慎的具體月份）\n"
            f"做：（今年最重要的行動建議）\n"
            f"避免：（今年最需避免的事項）\n\n"
            f"150字內。用繁體中文回應。不要使用數字編號（1. 2. 3.）。"
        )
    elif language == "zh-CN":
        period_str_cn = ""
        if current_period:
            sa = current_period.get("start_age", "")
            ea = current_period.get("end_age", "")
            lp = current_period.get("luck_pillar", {})
            period_str_cn = f"年龄 {sa}–{ea} 岁，{_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}), 'zh-CN')}"
        user = (
            f"命盘四柱：{pillars_str}。流年{year}：{pillar_naming}。与命盘互动：{int_desc or '无特殊冲合'}\n"
            f"当前年龄段：{period_str_cn}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号。每个 Q 只写一行，不要加子标签）：\n\n"
            f"主题：（{year}年整体主题，一个短语）\n"
            f"概述：（1–2句连结流年柱{l_elem}{l_zodiac}与命盘的互动）\n\n"
            f"Q1：（1–3月的重点行动，一句话）\n"
            f"Q2：（4–6月的重点行动，一句话）\n"
            f"Q3：（7–9月的重点行动，一句话）\n"
            f"Q4：（10–12月的重点行动，一句话）\n\n"
            f"吉月：（最有利的具体月份）\n"
            f"凶月：（需谨慎的具体月份）\n"
            f"做：（今年最重要的行动建议）\n"
            f"避免：（今年最需避免的事项）\n\n"
            f"150字内。用简体中文回应。不要使用数字编号（1. 2. 3.）。"
        )
    elif language == "ko":
        period_str_ko = ""
        if current_period:
            sa = current_period.get("start_age", "")
            ea = current_period.get("end_age", "")
            lp = current_period.get("luck_pillar", {})
            period_str_ko = f"나이 {sa}–{ea}세, {_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}), 'ko')}"
        user = (
            f"명반 사주：{pillars_str}。유년 {year}：{pillar_naming}。명반과 상호작용：{int_desc or '특별한 충합 없음'}\n"
            f"현재 연령대：{period_str_ko}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론。각 Q는 한 줄만，하위 레이블 추가 금지）：\n\n"
            f"주제：（{year}년 전체 주제，짧은 구）\n"
            f"개요：（1–2문장으로 유년주 {l_elem} {l_zodiac}와 명반의 상호작용 연결）\n\n"
            f"Q1：（1–3월 핵심 행동，한 문장）\n"
            f"Q2：（4–6월 핵심 행동，한 문장）\n"
            f"Q3：（7–9월 핵심 행동，한 문장）\n"
            f"Q4：（10–12월 핵심 행동，한 문장）\n\n"
            f"길월：（가장 유리한 구체적 월）\n"
            f"흉월：（신중해야 할 구체적 월）\n"
            f"하세요：（올해 가장 중요한 행동 조언）\n"
            f"피하세요：（올해 가장 피해야 할 사항）\n\n"
            f"150자 이내。한국어로 응답해 주세요。숫자 번호매기기（1. 2. 3.）사용 금지。"
        )
    else:
        period_str_en = ""
        if current_period:
            sa = current_period.get("start_age", "")
            ea = current_period.get("end_age", "")
            lp = current_period.get("luck_pillar", {})
            period_str_en = f"ages {sa}–{ea}, {_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}), 'en')}"
        user = (
            f"Chart: {pillars_str}. Annual pillar {year}: {pillar_naming}. Interactions: {int_desc or 'None'}\n"
            f"Current age period: {period_str_en}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Theme: (overall {year} year theme, one short phrase)\n"
            f"Overview: (1-2 sentences connecting annual pillar {stem_elem} {branch_zodiac} to the natal chart)\n\n"
            f"Q1 (Jan-Mar): (key focus and action)\n"
            f"Q2 (Apr-Jun): (key focus and action)\n"
            f"Q3 (Jul-Sep): (key focus and action)\n"
            f"Q4 (Oct-Dec): (key focus and action)\n\n"
            f"Lucky Months: (most favorable specific months)\n"
            f"Caution Months: (months requiring extra care)\n"
            f"Do: (most important action for the year)\n"
            f"Avoid: (most important thing to avoid this year)\n\n"
            f"150 words max. Respond in English."
        )
    return (system, user)


def get_age_period_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Current Age Period: age_periods, current_age, birth_date → strict template."""
    from datetime import datetime

    birth_date_str = bazi_data.get("input", {}).get("birth_date", "")
    birth_year = int(birth_date_str[:4]) if birth_date_str else datetime.now().year
    current_age = datetime.now().year - birth_year

    age_periods = bazi_data.get("age_periods", [])
    current_period = None
    for p in age_periods:
        start = p.get("start_age", 0)
        end = p.get("end_age", 0)
        if start <= current_age < end:
            current_period = p
            break

    if not current_period:
        current_period = age_periods[0] if age_periods else {}

    start_age = current_period.get("start_age", "")
    end_age = current_period.get("end_age", "")
    quality = current_period.get("quality", "")
    pillar = current_period.get("luck_pillar", {})
    stem_d = pillar.get("stem", {})
    branch_d = pillar.get("branch", {})
    stem = stem_d.get("name_cn", "")
    branch = branch_d.get("name_cn", "")
    pillar_naming = _get_pillar_naming(stem_d, branch_d, language)
    summary = current_period.get("summary", "")
    focus = current_period.get("focus_areas", []) or []
    focus_str = ", ".join(focus[:3])

    elements = bazi_data.get("elements", {})
    balance = elements.get("analysis", {}).get("balance", "")

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = (
            f"當前年齡：{current_age}歲。當前十年大運：{start_age}–{end_age}歲，{pillar_naming or stem+branch}，整體：{quality}。\n"
            f"重點：{focus_str}。概要：{summary}。五行平衡：{balance}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號）：\n\n"
            f"主題：（此十年核心人生主題，一個短語）\n"
            f"概述：（此十年柱如何影響命主，連結五行平衡，1–2句）\n\n"
            f"機遇：\n- （此十年可把握的機遇1）\n- （此十年可把握的機遇2）\n\n"
            f"挑戰：\n- （此十年需謹慎的挑戰1）\n- （此十年需謹慎的挑戰2）\n\n"
            f"做：（此年齡段應採取的具體行動）\n"
            f"避免：（此年齡段應避免的事項）\n"
            f"時機：（十年中最佳的子時段，如「前期/中期/後期」）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"当前年龄：{current_age}岁。当前十年大运：{start_age}–{end_age}岁，{pillar_naming or stem+branch}，整体：{quality}。\n"
            f"重点：{focus_str}。概要：{summary}。五行平衡：{balance}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号）：\n\n"
            f"主题：（此十年核心人生主题，一个短语）\n"
            f"概述：（此十年柱如何影响命主，连结五行平衡，1–2句）\n\n"
            f"机遇：\n- （此十年可把握的机遇1）\n- （此十年可把握的机遇2）\n\n"
            f"挑战：\n- （此十年需谨慎的挑战1）\n- （此十年需谨慎的挑战2）\n\n"
            f"做：（此年龄段应采取的具体行动）\n"
            f"避免：（此年龄段应避免的事项）\n"
            f"时机：（十年中最佳的子时段，如「前期/中期/后期」）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"현재 나이：{current_age}세。현재 10년 대운：{start_age}–{end_age}세，{pillar_naming or stem+branch}，전체：{quality}。\n"
            f"핵심：{focus_str}。요약：{summary}。오행 균형：{balance}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론）：\n\n"
            f"주제：（이 10년의 핵심 인생 주제，짧은 구）\n"
            f"개요：（이 10년주가 명주에 어떤 영향을 미치는지，오행 균형과 연결，1–2문장）\n\n"
            f"기회：\n- （이 10년 동안 활용할 수 있는 기회1）\n- （이 10년 동안 활용할 수 있는 기회2）\n\n"
            f"도전：\n- （이 10년 동안 신중해야 할 도전1）\n- （이 10년 동안 신중해야 할 도전2）\n\n"
            f"하세요：（이 연령대에 취해야 할 구체적 행동）\n"
            f"피하세요：（이 연령대에 피해야 할 사항）\n"
            f"시기：（10년 중 최적 시기，예: 초기/중기/후기）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Current age: {current_age}. Current 10-year luck: ages {start_age}–{end_age}, {pillar_naming or stem+branch}, overall: {quality}.\n"
            f"Focus: {focus_str}. Summary: {summary}. Five Elements balance: {balance}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Theme: (core life theme of this decade, one short phrase)\n"
            f"Overview: (how this decade pillar affects the person, connecting to element balance, 1-2 sentences)\n\n"
            f"Opportunities:\n- (opportunity to embrace 1)\n- (opportunity to embrace 2)\n\n"
            f"Challenges:\n- (challenge to navigate 1)\n- (challenge to navigate 2)\n\n"
            f"Do: (specific action for this age range)\n"
            f"Avoid: (what to avoid during this age range)\n"
            f"Timing: (best sub-period within this decade, e.g. 'early/mid/late years')\n\n"
            f"150 words max. Respond in English."
        )
    return (system, user)


def get_age_periods_timeline_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Age-based Luck Timeline: Journey Overview + Theme/Focus/Opportunities/Challenges/Timing per decade."""
    age_periods = bazi_data.get("age_periods", [])[:8]
    day_master = bazi_data.get("day_master", {}).get("element", "")
    elements = bazi_data.get("elements", {})
    balance = elements.get("analysis", {}).get("balance", "")

    fp = bazi_data.get("four_pillars", {})
    pillars_parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s = p.get("stem", {}).get("name_cn", "")
        b = p.get("branch", {}).get("name_cn", "")
        pillars_parts.append(f"{s}{b}")
    pillars_str = " ".join(pillars_parts)

    # Localize periods_str format by language (zh-CN as reference)
    if language == "zh-CN":
        age_label_fmt = "年龄 {start}–{end} 岁："
    elif language == "zh-TW":
        age_label_fmt = "年齡 {start}–{end} 歲："
    elif language == "ko":
        age_label_fmt = "나이 {start}–{end}세："
    else:
        age_label_fmt = "Age {start}–{end}: "

    periods_text_parts = []
    for p in age_periods:
        start = p.get("start_age", "")
        end = p.get("end_age", "")
        pillar = p.get("luck_pillar", {})
        stem_d = pillar.get("stem", {})
        branch_d = pillar.get("branch", {})
        stem = stem_d.get("name_cn", "")
        branch = branch_d.get("name_cn", "")
        pillar_naming = _get_pillar_naming(stem_d, branch_d, language)
        quality = p.get("quality", "")
        main_elem = p.get("main_element", "")
        rel = p.get("relationship_to_day_master", "")
        domains = p.get("domains", {})
        focus = p.get("focus_areas", []) or []
        cautions = p.get("cautions", []) or []
        focus_str = "; ".join(focus[:2])
        caut_str = "; ".join(cautions[:2])
        label = age_label_fmt.format(start=start, end=end)
        periods_text_parts.append(
            f"{label}{pillar_naming or stem+branch}, quality={quality}, element={main_elem}, "
            f"relation_to_day_master={rel}, domains={domains}, focus={focus_str}, cautions={caut_str}"
        )
    periods_str = "\n".join(periods_text_parts)

    # NOTE: This prompt needs ~900 words total, so we do NOT use _get_section_system_message
    # which has a hard "Maximum 150 words" constraint that confuses the AI.
    lang_map = {"zh-TW": "繁體中文", "zh-CN": "简体中文", "ko": "한국어"}
    lang_name = lang_map.get(language, "English")
    system = f"You are a BAZI expert. Respond in {lang_name}."
    system += " Total ~900 words max. First JOURNEY OVERVIEW (~150 words), then 8 periods (~100–120 words each)."
    if language in ("zh-TW", "zh-CN"):
        system += f" Respond ONLY in {lang_name}. Do not include any English words."
    elif language == "ko":
        system += " Respond ONLY in Korean. Chinese characters (Hanja) for BAZI terms are acceptable. Do not include English words."
    else:
        system += " Respond ONLY in English. Chinese characters for BAZI-specific terms are acceptable for authenticity."
    system += (
        " CRITICAL: Follow the EXACT output template in the user message."
        " The JOURNEY OVERVIEW must come FIRST and contain ONLY the overview (analogy, turning points, elemental journey)."
        " Then write EXACTLY 8 separate ### blocks, one per age period. Each ### block must contain ONLY that age range's content."
        " Use **bold** for section labels (Theme, Key Focus, Opportunities, Challenges, Timing)."
        " Use * or - for bullet points under Key Focus. Use newlines between sections."
        " Do NOT use numbered lists (1. 2. 3.) inside the ### period blocks."
        " Use concrete examples relevant to the user's chart data."
    )
    if language in ("zh-TW", "zh-CN"):
        system += " IMPORTANT: All label names must be in Chinese as specified in the template. Do NOT use English labels."
    elif language == "ko":
        system += " IMPORTANT: All label names must be in Korean as specified in the template. Do NOT use English labels."

    if language == "zh-CN":
        user = f"""日主：{day_master}。四柱：{pillars_str}。五行平衡：{balance}。

十年大运（前8个周期）：
{periods_str}

请先提供「人生旅程总览」（约150字），再提供8个十年大运的详细内容。

重要：勿在回应中包含「--- JOURNEY OVERVIEW ---」等标题；直接以比喻内容开头。

1. 个性化比喻：你的人生路径类似[历史人物/名人]，因为...
2. 转折点：指出1–2个关键转折年龄（如28、45岁）并简述
3. 五行旅程：五行焦点（木火土金水）如何在这8个十年中转换

然后为每个十年大运提供（引用该十年柱如丙午火马，但勿在每段开头重复十年柱名如癸卯—标题已显示）：
重要：每个 ### 年龄 X–Y 岁 块只包含该年龄段的内容。勿将人生旅程总览或其他年龄段的内容放入 ### 年龄 8–17 岁 块内。请分别撰写8个 ### 块。

### 年龄 X–Y 岁
**主题：** 核心人生主题（1短语）
**关键重点：** 2–3个优先领域（用 * 列点）
**机遇：** 此十年可把握什么
**挑战：** 此十年需谨慎面对什么
**时机：** 早期/中期/晚期的最佳时机

用简体中文回应。每段约100–120字，总计约900字内。"""
    elif language == "zh-TW":
        user = f"""日主：{day_master}。四柱：{pillars_str}。五行平衡：{balance}。

十年大運（前8個週期）：
{periods_str}

請先提供「人生旅程總覽」（約150字），再提供8個十年大運的詳細內容。

重要：勿在回應中包含「--- JOURNEY OVERVIEW ---」等標題；直接以比喻內容開頭。

1. 個人化比喻：你的人生路徑類似[歷史人物/名人]，因為...
2. 轉折點：指出1–2個關鍵轉折年齡（如28、45歲）並簡述
3. 五行旅程：五行焦點（木火土金水）如何在這8個十年中轉換

然後為每個十年大運提供（引用該十年柱如丙午火馬，但勿在每段開頭重複十年柱名如癸卯—標題已顯示）：
重要：每個 ### 年齡 X–Y 歲 區塊只包含該年齡段的內容。勿將人生旅程總覽或其他年齡段的內容放入 ### 年齡 8–17 歲 區塊內。請分別撰寫8個 ### 區塊。

### 年齡 X–Y 歲
**主題：** 核心人生主題（1短語）
**關鍵重點：** 2–3個優先領域（用 * 列點）
**機遇：** 此十年可把握什麼
**挑戰：** 此十年需謹慎面對什麼
**時機：** 早期/中期/晚期的最佳時機

用繁體中文回應。每段約100–120字，總計約900字內。"""
    elif language == "ko":
        user = f"""일주：{day_master}。사주：{pillars_str}。오행 균형：{balance}。

10년 대운（앞 8개 주기）：
{periods_str}

먼저「인생 여정 개요」（약 150자）를 제공한 후，8개 10년 대운의 상세 내용을 제공해 주세요.

중요：응답에「--- JOURNEY OVERVIEW ---」등의 제목을 포함하지 마세요；비유 내용으로 바로 시작하세요.

1. 개인화 비유：당신의 인생 경로는 [역사적 인물]과 유사합니다，왜냐하면...
2. 전환점：1–2개의 핵심 전환 나이（예: 28、45세）를 지적하고 간략히 설명
3. 오행 여정：오행 초점（목화토금수）이 이 8개 10년 동안 어떻게 전환되는지

그런 다음 각 10년 대운에 대해（해당 10년주를 인용하되，예: 丙午 화마，각 단락 시작에 10년주 이름을 반복하지 마세요—헤더에 이미 표시됨）：
중요：각 ### 나이 X–Y세 블록에는 해당 연령대의 내용만 포함하세요。인생 여정 개요나 다른 연령대의 내용을 ### 나이 8–17세 블록 안에 넣지 마세요。8개의 ### 블록을 각각 별도로 작성하세요。

### 나이 X–Y세
**주제：** 핵심 인생 주제（1구）
**핵심 초점：** 2–3개 우선 영역（*로 목록）
**기회：** 이 10년 동안 무엇을 활용할 수 있는지
**도전：** 이 10년 동안 무엇을 신중히 대처해야 하는지
**시기：** 초기/중기/후기 최적 시기

한국어로 응답해 주세요。각 단락 약 100–120자，총 약 900자 이내。"""
    else:
        user = f"""Day Master: {day_master}. Chart: {pillars_str}. Five Elements balance: {balance}.

Ten-year luck periods (first 8):
{periods_str}

First provide JOURNEY OVERVIEW (~150 words), then detailed content for each of the 8 periods.

Important: Do NOT include '--- JOURNEY OVERVIEW ---' or similar headers in your response; begin directly with the analogy content.

1. Personalized Analogy: "Your life path resembles [Historical Figure/Famous Person] because..."
2. Turning Points: Identify 1–2 key turning point ages (e.g. 28, 45) with brief emphasis
3. Elemental Journey: How elemental focus (Wood/Fire/Earth/Metal/Water) shifts across the 8 decades

Then for each period (reference the decade pillar e.g. 丙午 fire horse, but do not repeat the decade pillar name e.g. 癸卯 at the start of each period—it is already displayed as the header):
Important: Each ### Age X–Y block must contain ONLY that age range's content. Do NOT put the journey overview or other age ranges inside the ### Age 8–17 block. Write 8 separate ### blocks.

### Age X–Y
**Theme:** Core life theme (1 phrase)
**Key Focus:** 2–3 areas to prioritize (use * for bullet points)
**Opportunities:** What to embrace during this decade
**Challenges:** What to navigate carefully
**Timing:** Best sub-periods (early/mid/late years)

Respond in English. ~100–120 words per period, ~900 words total max."""
    return (system, user)


def get_use_god_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Use God / Avoid God: strict template."""
    ug_data = bazi_data.get("use_god", {})
    dm_strength = ug_data.get("dm_strength", "balanced")
    use_god = ug_data.get("use_god", "")
    use_god_2 = ug_data.get("use_god_secondary", "")
    avoid_god = ug_data.get("avoid_god", "")
    avoid_god_2 = ug_data.get("avoid_god_secondary", "")
    dm_element = bazi_data.get("day_master", {}).get("element", "")
    advice = ug_data.get("advice", {})
    colors = advice.get("colors", {})
    directions = advice.get("directions", {})
    seasons = advice.get("seasons", {})
    careers = advice.get("careers", {})
    numbers = advice.get("numbers", "")

    elements_in_pillars = _get_elements_in_pillars(bazi_data)
    ss = bazi_data.get("seasonal_strength", {}).get("strength", "")

    system = _get_section_system_message(language)

    if language == "zh-TW":
        user = (
            f"日主：{dm_element}，日主強弱：{dm_strength}。得令：{ss}。\n"
            f"四柱五行分布：{elements_in_pillars}。\n"
            f"用神：{use_god}。輔助用神：{use_god_2}。忌神：{avoid_god}。輔助忌神：{avoid_god_2}。\n"
            f"推薦顏色：{colors.get('zh-TW', '')}。方位：{directions.get('zh-TW', '')}。季節：{seasons.get('zh-TW', '')}。\n"
            f"適合行業：{careers.get('zh-TW', '')}。幸運數字：{numbers}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號。不要使用數字編號 1. 2. 3.）：\n\n"
            f"原因：（為何此用神能幫助命盤平衡，結合日主強弱說明，1–2句）\n\n"
            f"日常行動：\n- （顏色/穿著行動）\n- （方位/工作空間行動）\n- （習慣/活動行動）\n\n"
            f"事業：（1–2個職業方向建議）\n\n"
            f"避免：\n- （忌神相關具體避免事項1）\n- （忌神相關具體避免事項2）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"日主：{dm_element}，日主强弱：{dm_strength}。得令：{ss}。\n"
            f"四柱五行分布：{elements_in_pillars}。\n"
            f"用神：{use_god}。辅助用神：{use_god_2}。忌神：{avoid_god}。辅助忌神：{avoid_god_2}。\n"
            f"推荐颜色：{colors.get('zh-CN', '')}。方位：{directions.get('zh-CN', '')}。季节：{seasons.get('zh-CN', '')}。\n"
            f"适合行业：{careers.get('zh-CN', '')}。幸运数字：{numbers}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号。不要使用数字编号 1. 2. 3.）：\n\n"
            f"原因：（为何此用神能帮助命盘平衡，结合日主强弱说明，1–2句）\n\n"
            f"日常行动：\n- （颜色/穿着行动）\n- （方位/工作空间行动）\n- （习惯/活动行动）\n\n"
            f"事业：（1–2个职业方向建议）\n\n"
            f"避免：\n- （忌神相关具体避免事项1）\n- （忌神相关具体避免事项2）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"일주：{dm_element}，일주 강약：{dm_strength}。득령：{ss}。\n"
            f"사주 오행 분포：{elements_in_pillars}。\n"
            f"용신：{use_god}。보조 용신：{use_god_2}。기신：{avoid_god}。보조 기신：{avoid_god_2}。\n"
            f"추천 색상：{colors.get('ko', '')}。방위：{directions.get('ko', '')}。계절：{seasons.get('ko', '')}。\n"
            f"적합 업종：{careers.get('ko', '')}。행운의 숫자：{numbers}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론。숫자 번호매기기 1. 2. 3. 사용 금지）：\n\n"
            f"이유：（이 용신이 명반 균형에 어떻게 도움이 되는지，일주 강약과 연결하여 설명，1–2문장）\n\n"
            f"일상 행동：\n- （색상/의류 행동）\n- （방위/업무 공간 행동）\n- （습관/활동 행동）\n\n"
            f"직업：（1–2가지 직업 방향 제안）\n\n"
            f"피하세요：\n- （기신 관련 구체적 회피 사항1）\n- （기신 관련 구체적 회피 사항2）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Day Master: {dm_element}, DM Strength: {dm_strength}. Seasonal: {ss}.\n"
            f"Elements in pillars: {elements_in_pillars}.\n"
            f"Use God: {use_god}. Secondary: {use_god_2}. Avoid God: {avoid_god}. Secondary: {avoid_god_2}.\n"
            f"Recommended colors: {colors.get('en', '')}. Direction: {directions.get('en', '')}. Season: {seasons.get('en', '')}.\n"
            f"Suitable careers: {careers.get('en', '')}. Lucky numbers: {numbers}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Why: (why this Use God helps balance the chart, connected to DM strength, 1-2 sentences)\n\n"
            f"Daily Actions:\n- (color/clothing action)\n- (direction/workspace action)\n- (habit/activity action)\n\n"
            f"Career: (1-2 career direction suggestions)\n\n"
            f"Avoid:\n- (specific Avoid God-related avoidance 1)\n- (specific Avoid God-related avoidance 2)\n\n"
            f"150 words max. Respond in English."
        )

    return (system, user)


def get_pillar_interactions_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Pillar Interactions: strict template."""
    pi = bazi_data.get("pillar_interactions", {})
    interactions = pi.get("interactions", [])
    summary = pi.get("summary", {})
    dm_element = bazi_data.get("day_master", {}).get("element", "")

    fp = bazi_data.get("four_pillars", {})
    pillars_parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s = p.get("stem", {}).get("name_cn", "")
        b = p.get("branch", {}).get("name_cn", "")
        pillars_parts.append(f"{pn}: {s}{b}")
    pillars_str = ", ".join(pillars_parts)

    ix_text = "\n".join([
        f"- {ix.get('type_label', '')} ({ix.get('detail_cn', '')}): {ix.get('description', '')}"
        for ix in interactions
    ]) if interactions else "None"

    system = _get_section_system_message(language)

    if language == "zh-TW":
        user = (
            f"日主：{dm_element}。四柱：{pillars_str}。\n"
            f"命局合沖刑害（共{summary.get('total', 0)}項，吉{summary.get('positive', 0)}凶{summary.get('negative', 0)}）：\n{ix_text}\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號）：\n\n"
            f"概述：（這些合沖刑害如何整體影響命主的人生格局，結合日主五行，1–2句）\n"
            f"關鍵影響：（哪個互動影響最大，為什麼，1–2句）\n\n"
            f"做：\n- （善用吉象的具體行動1）\n- （善用吉象的具體行動2）\n\n"
            f"避免：\n- （化解凶象的具體建議1）\n- （化解凶象的具體建議2）\n\n"
            f"150字內。用繁體中文回應。"
        )
    elif language == "zh-CN":
        user = (
            f"日主：{dm_element}。四柱：{pillars_str}。\n"
            f"命局合冲刑害（共{summary.get('total', 0)}项，吉{summary.get('positive', 0)}凶{summary.get('negative', 0)}）：\n{ix_text}\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号）：\n\n"
            f"概述：（这些合冲刑害如何整体影响命主的人生格局，结合日主五行，1–2句）\n"
            f"关键影响：（哪个互动影响最大，为什么，1–2句）\n\n"
            f"做：\n- （善用吉象的具体行动1）\n- （善用吉象的具体行动2）\n\n"
            f"避免：\n- （化解凶象的具体建议1）\n- （化解凶象的具体建议2）\n\n"
            f"150字内。用简体中文回应。"
        )
    elif language == "ko":
        user = (
            f"일주：{dm_element}。사주：{pillars_str}。\n"
            f"명국 합충형해（총 {summary.get('total', 0)}건，길 {summary.get('positive', 0)} 흉 {summary.get('negative', 0)}）：\n{ix_text}\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론）：\n\n"
            f"개요：（이러한 합충형해가 일주 오행과 결합하여 명주의 인생에 어떻게 영향을 미치는지，1–2문장）\n"
            f"핵심 영향：（어떤 상호작용이 가장 영향이 큰지，왜 그런지，1–2문장）\n\n"
            f"하세요：\n- （길상을 활용하는 구체적 행동1）\n- （길상을 활용하는 구체적 행동2）\n\n"
            f"피하세요：\n- （흉상을 화해하는 구체적 조언1）\n- （흉상을 화해하는 구체적 조언2）\n\n"
            f"150자 이내。한국어로 응답해 주세요。"
        )
    else:
        user = (
            f"Day Master: {dm_element}. Four Pillars: {pillars_str}.\n"
            f"Natal Pillar Interactions ({summary.get('total', 0)} total, {summary.get('positive', 0)} harmonious, {summary.get('negative', 0)} challenging):\n{ix_text}\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Overview: (how these interactions collectively shape the life pattern, connecting to Day Master element, 1-2 sentences)\n"
            f"Key Impact: (which interaction has the greatest effect and why, 1-2 sentences)\n\n"
            f"Do:\n- (specific action to leverage harmonious interactions 1)\n- (specific action to leverage harmonious interactions 2)\n\n"
            f"Avoid:\n- (specific advice to mitigate challenging interactions 1)\n- (specific advice to mitigate challenging interactions 2)\n\n"
            f"150 words max. Respond in English."
        )

    return (system, user)


_ELEM_I18N = {
    "Wood": {"en": "Wood", "zh-TW": "木", "zh-CN": "木", "ko": "목(木)"},
    "Fire":  {"en": "Fire",  "zh-TW": "火", "zh-CN": "火", "ko": "화(火)"},
    "Earth": {"en": "Earth", "zh-TW": "土", "zh-CN": "土", "ko": "토(土)"},
    "Metal": {"en": "Metal", "zh-TW": "金", "zh-CN": "金", "ko": "금(金)"},
    "Water": {"en": "Water", "zh-TW": "水", "zh-CN": "水", "ko": "수(水)"},
}

_YINYANG_I18N = {
    "Yin":  {"en": "Yin",  "zh-TW": "陰", "zh-CN": "阴", "ko": "음"},
    "Yang": {"en": "Yang", "zh-TW": "陽", "zh-CN": "阳", "ko": "양"},
}

def _localize_elem(elem: str, lang: str) -> str:
    return _ELEM_I18N.get(elem, {}).get(lang, elem or "")

def _localize_yinyang(yy: str, lang: str) -> str:
    return _YINYANG_I18N.get(yy, {}).get(lang, yy or "")


def get_compatibility_prompt(chart_a: dict, chart_b: dict, compat: dict, language: str = "en") -> tuple[str, str]:
    """Generate AI prompt for compatibility analysis between two BAZI charts."""
    dm_a = chart_a.get("day_master", {})
    dm_b = chart_b.get("day_master", {})
    ug_a = chart_a.get("use_god", {})
    ug_b = chart_b.get("use_god", {})

    # Pillar summaries
    def _pillars_str(chart):
        fp = chart.get("four_pillars", {})
        parts = []
        for pn in ["year", "month", "day", "hour"]:
            p = fp.get(pn, {})
            s = p.get("stem", {}).get("name_cn", "")
            b = p.get("branch", {}).get("name_cn", "")
            parts.append(f"{s}{b}")
        return " ".join(parts)

    pillars_a = _pillars_str(chart_a)
    pillars_b = _pillars_str(chart_b)
    score = compat.get("total_score", 0)
    tier = compat.get("tier_label", "")
    dims = compat.get("dimensions", [])

    dim_summary = "; ".join([
        f"{d.get('key', '')}: {d.get('score', 0)}/{d.get('max_score', 0)} ({d.get('relationship_label', '')})"
        for d in dims
    ])

    lang_map = {"zh-TW": "繁體中文", "zh-CN": "简体中文", "ko": "한국어"}
    lang_name = lang_map.get(language, "English")

    if language in ("zh-TW", "zh-CN"):
        lang_rule = f"Respond ONLY in {lang_name}. Do not include English words."
    elif language == "ko":
        lang_rule = f"Respond ONLY in {lang_name}. Chinese characters (Hanja) for BAZI terms are acceptable. Do not include English words."
    else:
        lang_rule = f"Respond ONLY in {lang_name}. Chinese characters for BAZI terms are acceptable for authenticity."

    system = (
        f"You are a BAZI compatibility expert. Respond in {lang_name}. "
        f"{lang_rule} "
        f"Be warm, balanced, and constructive — even for low-scoring matches, highlight growth opportunities. "
        f"CRITICAL: Follow the EXACT output template in the user message. "
        f"Use the EXACT label names provided. Each label on its own line followed by a colon. "
        f"Bullet points use '- ' prefix. Do NOT use numbered lists (1. 2. 3.). "
        f"Do NOT use markdown **bold**. 250 words max."
    )

    if language == "zh-TW":
        user = (
            f"甲方四柱：{pillars_a}。日主：{_localize_elem(dm_a.get('element', ''), 'zh-TW')}（{_localize_yinyang(dm_a.get('yin_yang', ''), 'zh-TW')}）。用神：{_localize_elem(ug_a.get('use_god', ''), 'zh-TW')}。\n"
            f"乙方四柱：{pillars_b}。日主：{_localize_elem(dm_b.get('element', ''), 'zh-TW')}（{_localize_yinyang(dm_b.get('yin_yang', ''), 'zh-TW')}）。用神：{_localize_elem(ug_b.get('use_god', ''), 'zh-TW')}。\n"
            f"合婚總分：{score}/100（{tier}）。\n"
            f"各維度：{dim_summary}。\n\n"
            f"用以下格式回應（每行一個標籤，標籤後加冒號。不要使用數字編號）：\n\n"
            f"比喻：（你們的關係像[歷史名人伴侶]，因為…——一句話類比）\n\n"
            f"互動：（兩人日主五行互動的解讀，相生相剋如何體現在日常相處中，2–3句）\n\n"
            f"生肖：（生肖與夫妻宮的合沖分析及其對感情的影響，2–3句）\n\n"
            f"互補：（兩人用神是否互補，如何利用這一點增進關係，1–2句）\n\n"
            f"做：\n- （溝通方式建議）\n- （約會活動建議）\n- （共同目標建議）\n\n"
            f"避免：\n- （潛在衝突點1及化解方法）\n- （潛在衝突點2及化解方法）\n\n"
            f"250字內。用繁體中文回應。所有標籤名必須用中文。"
        )
    elif language == "zh-CN":
        user = (
            f"甲方四柱：{pillars_a}。日主：{_localize_elem(dm_a.get('element', ''), 'zh-CN')}（{_localize_yinyang(dm_a.get('yin_yang', ''), 'zh-CN')}）。用神：{_localize_elem(ug_a.get('use_god', ''), 'zh-CN')}。\n"
            f"乙方四柱：{pillars_b}。日主：{_localize_elem(dm_b.get('element', ''), 'zh-CN')}（{_localize_yinyang(dm_b.get('yin_yang', ''), 'zh-CN')}）。用神：{_localize_elem(ug_b.get('use_god', ''), 'zh-CN')}。\n"
            f"合婚总分：{score}/100（{tier}）。\n"
            f"各维度：{dim_summary}。\n\n"
            f"用以下格式回应（每行一个标签，标签后加冒号。不要使用数字编号）：\n\n"
            f"比喻：（你们的关系像[历史名人伴侣]，因为…——一句话类比）\n\n"
            f"互动：（两人日主五行互动的解读，相生相克如何体现在日常相处中，2–3句）\n\n"
            f"生肖：（生肖与夫妻宫的合冲分析及其对感情的影响，2–3句）\n\n"
            f"互补：（两人用神是否互补，如何利用这一点增进关系，1–2句）\n\n"
            f"做：\n- （沟通方式建议）\n- （约会活动建议）\n- （共同目标建议）\n\n"
            f"避免：\n- （潜在冲突点1及化解方法）\n- （潜在冲突点2及化解方法）\n\n"
            f"250字内。用简体中文回应。所有标签名必须用中文。"
        )
    elif language == "ko":
        user = (
            f"갑측 사주：{pillars_a}。일주：{_localize_elem(dm_a.get('element', ''), 'ko')}（{_localize_yinyang(dm_a.get('yin_yang', ''), 'ko')}）。용신：{_localize_elem(ug_a.get('use_god', ''), 'ko')}。\n"
            f"을측 사주：{pillars_b}。일주：{_localize_elem(dm_b.get('element', ''), 'ko')}（{_localize_yinyang(dm_b.get('yin_yang', ''), 'ko')}）。용신：{_localize_elem(ug_b.get('use_god', ''), 'ko')}。\n"
            f"궁합 총점：{score}/100（{tier}）。\n"
            f"각 차원：{dim_summary}。\n\n"
            f"다음 형식으로 응답（각 행에 하나의 레이블，레이블 뒤에 콜론。숫자 번호매기기 사용 금지）：\n\n"
            f"비유：（두 사람의 관계는 [역사적 유명 커플]과 같습니다，왜냐하면…——한 문장 비유）\n\n"
            f"상호작용：（두 사람 일주 오행 상호작용 해석，상생상극이 일상에 어떻게 나타나는지，2–3문장）\n\n"
            f"띠：（띠와 부부궁의 합충 분석 및 감정에 미치는 영향，2–3문장）\n\n"
            f"상호보완：（두 사람의 용신이 상호보완적인지，이를 어떻게 활용할지，1–2문장）\n\n"
            f"하세요：\n- （소통 방식 조언）\n- （데이트 활동 조언）\n- （공동 목표 조언）\n\n"
            f"피하세요：\n- （잠재적 갈등점1 및 해소 방법）\n- （잠재적 갈등점2 및 해소 방법）\n\n"
            f"250자 이내。한국어로 응답해 주세요。모든 레이블은 한국어 사용。"
        )
    else:
        user = (
            f"Person A chart: {pillars_a}. Day Master: {dm_a.get('element', '')} ({dm_a.get('yin_yang', '')}). Use God: {ug_a.get('use_god', '')}.\n"
            f"Person B chart: {pillars_b}. Day Master: {dm_b.get('element', '')} ({dm_b.get('yin_yang', '')}). Use God: {ug_b.get('use_god', '')}.\n"
            f"Compatibility score: {score}/100 ({tier}).\n"
            f"Dimensions: {dim_summary}.\n\n"
            f"Respond using EXACTLY this template (one label per line, colon after label):\n\n"
            f"Analogy: (Your relationship resembles [famous historical couple] because... — one-sentence analogy)\n\n"
            f"Interaction: (how both Day Master elements interact in daily life together, 2-3 sentences)\n\n"
            f"Zodiac: (zodiac and Spouse Palace harmony/clash analysis, emotional impact, 2-3 sentences)\n\n"
            f"Complementarity: (whether both Use Gods complement each other, how to leverage, 1-2 sentences)\n\n"
            f"Do:\n- (communication advice)\n- (date activity suggestion)\n- (shared goal suggestion)\n\n"
            f"Avoid:\n- (friction point 1 and resolution)\n- (friction point 2 and resolution)\n\n"
            f"250 words max. Respond in English."
        )

    return (system, user)