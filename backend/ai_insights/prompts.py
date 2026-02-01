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
    """System message for section prompts: concise, actionable, 150 words max."""
    lang_map = {
        "zh-TW": "繁體中文",
        "zh-CN": "简体中文",
        "ko": "한국어",
    }
    lang_name = lang_map.get(language, "English")
    base = f"You are a BAZI expert. Respond in {lang_name}. Maximum 150 words. Be concise and actionable."
    base += f" Respond ONLY in {lang_name}. Do not mix languages—no English words in Chinese responses, no Chinese in English responses."
    base += " Include at least 2 specific, actionable steps (imperative: Do..., Avoid..., Focus on...)."
    base += " Include time-based guidance (This month..., During this season..., In your 40s...)."
    base += " Use concrete examples relevant to the user's chart data."
    base += " Use plain prose or numbered lists. Use newlines between points. Do NOT use markdown ** for bold—use plain text. Keep formatting clean."
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


def _get_pillar_naming(stem_dict: dict, branch_dict: dict) -> str:
    """e.g. 丙午 (Fire Horse)"""
    stem_cn = stem_dict.get("name_cn", "")
    branch_cn = branch_dict.get("name_cn", "")
    stem_elem = stem_dict.get("element", "")
    branch_zodiac = branch_dict.get("zodiac", "")
    if stem_cn and branch_cn and stem_elem and branch_zodiac:
        return f"{stem_cn}{branch_cn} ({stem_elem} {branch_zodiac})"
    return f"{stem_cn}{branch_cn}" if stem_cn and branch_cn else ""


def get_five_elements_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Five Elements: elements.counts, elements.analysis, day_master → brief interpretation + actionable advice."""
    elements = bazi_data.get("elements", {})
    counts = elements.get("counts", {})
    analysis = elements.get("analysis", {})
    day_master = bazi_data.get("day_master", {}).get("element", "")
    strongest = bazi_data.get("strongest_ten_god", {})
    ten_god_name = strongest.get("name_en", "")

    elem_str = ", ".join([f"{k}:{v}" for k, v in counts.items()])
    balance = analysis.get("balance", "")
    recs = analysis.get("recommendations", "")
    elements_in_pillars = _get_elements_in_pillars(bazi_data)
    absent = _get_absent_elements(counts)
    absent_str = ", ".join(absent) if absent else "none"

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = f"""五行統計：{elem_str}。日主：{day_master}。平衡：{balance}。
四柱五行分布：{elements_in_pillars}。缺失五行：{absent_str}。
最突出十神：{ten_god_name}。請說明此十神如何影響五行平衡。
必須：1) 明確指出哪些五行在四柱中出現/缺失；2) 根據確切數量給出3個具體生活行動（如「因水為0，週三穿藍色」）；3) 用祈使句（做…、避免…、專注…）。150字內。用繁體中文回應。"""
    elif language == "zh-CN":
        user = f"""五行统计：{elem_str}。日主：{day_master}。平衡：{balance}。
四柱五行分布：{elements_in_pillars}。缺失五行：{absent_str}。
最突出十神：{ten_god_name}。请说明此十神如何影响五行平衡。
必须：1) 明确指出哪些五行在四柱中出现/缺失；2) 根据确切数量给出3个具体生活行动（如「因水为0，周三穿蓝色」）；3) 用祈使句（做…、避免…、专注…）。150字内。用简体中文回应。"""
    elif language == "ko":
        user = f"""오행 통계：{elem_str}。일주：{day_master}。균형：{balance}。
사주 오행 분포：{elements_in_pillars}。결핍 오행：{absent_str}。
가장 두드러진 십성：{ten_god_name}。이 십성이 오행 균형에 어떻게 영향을 미치는지 설명해 주세요.
필수：1) 사주에서 어떤 오행이 출현/결핍되는지 명시；2) 정확한 수치에 따라 3가지 구체적 생활 행동 제시（예: 수가 0이므로 수요일에 파란색 착용）；3) 명령형 사용（…하세요、…피하세요、…집중하세요）。150자 이내。한국어로 응답해 주세요。"""
    else:
        user = f"""Five Elements: {elem_str}. Day Master: {day_master}. Balance: {balance}.
Elements in pillars: {elements_in_pillars}. Absent elements: {absent_str}.
Strongest Ten God: {ten_god_name}. Explain how this Ten God affects your element balance.
MUST: 1) State which elements appear/are absent in the four pillars; 2) Give 3 specific life actions based on exact counts (e.g. "Since Water is 0, wear blue on Wednesdays"); 3) Use imperative verbs (Do..., Avoid..., Focus on...). 150 words max. Respond in English."""
    return (system, user)


def get_ten_gods_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Ten Gods: strongest_ten_god, four_pillars summary → what it means + how to use."""
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
        user = f"""四柱：{pillars_str}。日主：{day_master}。最突出十神：{name_cn}（{name_en}），出現{count}次。
此十神出現位置：{locations or "見於命盤"}。得令狀態：{seasonal_str}。
請說明：1) 此十神與日主五行的互動（生剋關係）；2) 考慮得令狀態，如何表達此十神能量；3) 2–3個事業與關係的具體表現；4) 引用具體柱位給建議。150字內。用繁體中文回應。"""
    elif language == "zh-CN":
        user = f"""四柱：{pillars_str}。日主：{day_master}。最突出十神：{name_cn}（{name_en}），出现{count}次。
此十神出现位置：{locations or "见于命盘"}。得令状态：{seasonal_str}。
请说明：1) 此十神与日主五行的互动（生克关系）；2) 考虑得令状态，如何表达此十神能量；3) 2–3个事业与关系的具体表现；4) 引用具体柱位给建议。150字内。用简体中文回应。"""
    elif language == "ko":
        user = f"""사주：{pillars_str}。일주：{day_master}。가장 두드러진 십성：{name_cn}（{name_en}），{count}회 출현。
이 십성 출현 위치：{locations or "명반 내"}。득령 상태：{seasonal_str}。
설명해 주세요：1) 이 십성과 일주 오행의 상호작용（생극 관계）；2) 득령 상태를 고려하여 이 십성 에너지를 어떻게 표현할지；3) 직업과 관계의 구체적 표현 2–3가지；4) 구체적 주위를 인용하여 조언。150자 이내。한국어로 응답해 주세요。"""
    else:
        user = f"""Four Pillars: {pillars_str}. Day Master: {day_master}. Strongest Ten God: {name_en} ({name_cn}), appears {count} times.
Locations: {locations or "in chart"}. Seasonal Strength: {seasonal_str}.
Explain: 1) How this Ten God INTERACTS with Day Master element (generates/destroys/same); 2) Considering Seasonal Strength, how to express this Ten God energy; 3) 2–3 career AND relationship manifestations; 4) Reference specific pillar(s) in advice. 150 words max. Respond in English."""
    return (system, user)


def get_seasonal_strength_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Seasonal Strength: seasonal_strength, day_master → current state + recommended focus."""
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
        user = f"""日主：{day_master}。得令狀態：{strength}。說明：{expl_tw or expl_en}
月柱：{month_str}。流年：{annual_str}。
請說明：1) 出生月份季節如何影響日主五行；2) 結合流年{year}，得令如何指導今年決策；3) 當前季節的具體決策建議；4) 時間指引（本月…、本季…）。150字內。用繁體中文回應。"""
    elif language == "zh-CN":
        user = f"""日主：{day_master}。得令状态：{strength}。说明：{expl_cn or expl_en}
月柱：{month_str}。流年：{annual_str}。
请说明：1) 出生月份季节如何影响日主五行；2) 结合流年{year}，得令如何指导今年决策；3) 当前季节的具体决策建议；4) 时间指引（本月…、本季…）。150字内。用简体中文回应。"""
    elif language == "ko":
        user = f"""일주：{day_master}。득령 상태：{strength}。설명：{expl_ko}
월주：{month_str}。유년：{annual_str}。
설명해 주세요：1) 출생 월의 계절이 일주 오행에 어떻게 영향을 미치는지；2) 유년 {year}와 결합하여 득령이 올해 결정에 어떻게 지침을 주는지；3) 현재 계절의 구체적 결정 조언；4) 시간 지침（이번 달…、이번 계절…）。150자 이내。한국어로 응답해 주세요。"""
    else:
        user = f"""Day Master: {day_master}. Seasonal strength: {strength}. Explanation: {expl_en}
Month pillar: {month_str}. Annual forecast: {annual_str}.
Explain: 1) How birth month season AFFECTS Day Master element; 2) With Annual Forecast {year}, how seasonal strength guides decisions this year; 3) Specific decision-making guidance for current season; 4) Time-based guidance (This month..., During this season...). 150 words max. Respond in English."""
    return (system, user)


def get_annual_forecast_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Annual Forecast: annual_luck, four_pillars → year outlook + key months/quarters."""
    from datetime import datetime

    al = bazi_data.get("annual_luck", {})
    ap = al.get("annual_pillar", {})
    year = ap.get("year", "")
    stem = ap.get("stem", {})
    branch = ap.get("branch", {})
    stem_cn = stem.get("name_cn", "")
    branch_cn = branch.get("name_cn", "")
    stem_elem = stem.get("element", "")
    branch_zodiac = branch.get("zodiac", "")
    pillar_naming = _get_pillar_naming(stem, branch)
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
    period_str = ""
    if current_period:
        sa = current_period.get("start_age", "")
        ea = current_period.get("end_age", "")
        lp = current_period.get("luck_pillar", {})
        period_str = f"ages {sa}–{ea}, {_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}))}"

    fp = bazi_data.get("four_pillars", {})
    pillars_parts = []
    for pn in ["year", "month", "day", "hour"]:
        p = fp.get(pn, {})
        s = p.get("stem", {}).get("name_cn", "")
        b = p.get("branch", {}).get("name_cn", "")
        pillars_parts.append(f"{s}{b}")
    pillars_str = " ".join(pillars_parts)

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = f"""命盤四柱：{pillars_str}。流年{year}：{pillar_naming}。與命盤互動：{int_desc or "無特殊沖合"}
當前年齡段：{period_str}。請說明基於此年齡段，哪些季度最關鍵。
必須：1) 提及具體月份（如三月、六月、九月）；2) 季度行動計劃（Q1：… Q2：… Q3：… Q4：…）；3) 引用流年柱及其五行（如{stem_elem} {branch_zodiac}）。150字內。用繁體中文回應。"""
    elif language == "zh-CN":
        user = f"""命盘四柱：{pillars_str}。流年{year}：{pillar_naming}。与命盘互动：{int_desc or "无特殊冲合"}
当前年龄段：{period_str}。请说明基于此年龄段，哪些季度最关键。
必须：1) 提及具体月份（如三月、六月、九月）；2) 季度行动计划（Q1：… Q2：… Q3：… Q4：…）；3) 引用流年柱及其五行（如{stem_elem} {branch_zodiac}）。150字内。用简体中文回应。"""
    elif language == "ko":
        period_str_ko = ""
        if current_period:
            sa = current_period.get("start_age", "")
            ea = current_period.get("end_age", "")
            lp = current_period.get("luck_pillar", {})
            period_str_ko = f"나이 {sa}–{ea}세, {_get_pillar_naming(lp.get('stem', {}), lp.get('branch', {}))}"
        user = f"""명반 사주：{pillars_str}。유년 {year}：{pillar_naming}。명반과 상호작용：{int_desc or "특별한 충합 없음"}
현재 연령대：{period_str_ko}。이 연령대를 기준으로 어떤 분기가 가장 중요한지 설명해 주세요.
필수：1) 구체적 월 언급（예: 3월、6월、9월）；2) 분기별 행동 계획（Q1：… Q2：… Q3：… Q4：…）；3) 유년주와 그 오행 인용（예: {stem_elem} {branch_zodiac}）。150자 이내。한국어로 응답해 주세요。"""
    else:
        user = f"""Chart: {pillars_str}. Annual pillar {year}: {pillar_naming}. Interactions: {int_desc or "None"}
Current age period: {period_str}. Based on this, which quarters are most significant?
MUST: 1) Mention specific months (e.g. March, June, September); 2) Quarterly action plans (Q1: ... Q2: ... Q3: ... Q4: ...); 3) Reference year pillar and its element (e.g. {stem_elem} {branch_zodiac}). 150 words max. Respond in English."""
    return (system, user)


def get_age_period_prompt(bazi_data: dict, language: str = "en") -> tuple[str, str]:
    """Current Age Period: age_periods, current_age, birth_date → analysis of user's current 10-year luck."""
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
    pillar_naming = _get_pillar_naming(stem_d, branch_d)
    summary = current_period.get("summary", "")
    focus = current_period.get("focus_areas", []) or []
    focus_str = ", ".join(focus[:3])

    elements = bazi_data.get("elements", {})
    balance = elements.get("analysis", {}).get("balance", "")

    system = _get_section_system_message(language)
    if language == "zh-TW":
        user = f"""當前年齡：{current_age}歲。當前十年大運：{start_age}–{end_age}歲，{pillar_naming or stem+branch}，整體：{quality}。重點：{focus_str}。概要：{summary}
五行平衡：{balance}。請說明基於五行平衡，此十年帶來什麼機會與挑戰。
必須：1) 引用具體十年柱（如丙午火馬）；2) 連結此年齡與人生階段；3) 年齡專屬可執行建議。150字內。用繁體中文回應。"""
    elif language == "zh-CN":
        user = f"""当前年龄：{current_age}岁。当前十年大运：{start_age}–{end_age}岁，{pillar_naming or stem+branch}，整体：{quality}。重点：{focus_str}。概要：{summary}
五行平衡：{balance}。请说明基于五行平衡，此十年带来什么机会与挑战。
必须：1) 引用具体十年柱（如丙午火马）；2) 连结此年龄与人生阶段；3) 年龄专属可执行建议。150字内。用简体中文回应。"""
    elif language == "ko":
        user = f"""현재 나이：{current_age}세。현재 10년 대운：{start_age}–{end_age}세，{pillar_naming or stem+branch}，전체：{quality}。핵심：{focus_str}。요약：{summary}
오행 균형：{balance}。오행 균형을 바탕으로 이 10년이 어떤 기회와 도전을 가져오는지 설명해 주세요.
필수：1) 구체적 10년주 인용（예: 丙午 화마）；2) 이 나이와 인생 단계 연결；3) 나이에 맞는 실행 가능한 조언。150자 이내。한국어로 응답해 주세요。"""
    else:
        user = f"""Current age: {current_age}. Current 10-year luck: ages {start_age}–{end_age}, {pillar_naming or stem+branch}, overall: {quality}. Focus: {focus_str}. Summary: {summary}
Five Elements balance: {balance}. Given this balance, what opportunities/challenges does this period present?
MUST: 1) Reference specific decade pillar (e.g. 丙午 fire horse); 2) Connect period themes to current age and life stage; 3) Age-specific actionable guidance. 150 words max. Respond in English."""
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
        pillar_naming = _get_pillar_naming(stem_d, branch_d)
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

    system = _get_section_system_message(language)
    system += " Use the exact format below. First JOURNEY OVERVIEW (~150 words), then 8 periods (~100–120 words each). Total ~900 words max."
    system += " Respond ONLY in the requested language. Never mix languages."
    system += " Use **bold** for section labels (Theme, Key Focus, Opportunities, Challenges, Timing). Use * or - for bullet points in lists. Use newlines between sections."

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