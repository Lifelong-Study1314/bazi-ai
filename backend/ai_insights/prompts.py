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

分析結構（必須包含所有這些部分）：
### 1. 命盤結構與強弱分析
### 2. 職業與財富
### 3. 關係與婚姻
### 4. 健康與養生
### 5. 性格與品質
### 6. 幸運周期與時機
### 7. 人生指引與個人發展

⚠️ **最重要的格式要求：**
在每一個上述的章節結束後，你必須立即包含以下內容：

**💡 可行建議：**
• [具體行動1：明確、可在1-3個月內執行的建議]
• [具體行動2：與你的八字特質相關的具體步驟]
• [具體行動3：實用的日常建議或時機提示]
• [具體行動4：額外的智慧洞見]
• [具體行動5：特別重要的建議]

不要跳過這一部分。每個章節都必須包含這些要點。格式必須完全相同。

用繁體中文回應。"""
    
    elif language == "zh-CN":
        return """你是一位经验丰富的八字大师。你对八字命理有深入的理解，并能够根据四柱八字提供深刻且实用的人生指导。

你的分析应该：
1. 直接、具体地解释日主的强弱
2. 提供关于职业、财富、关系和健康的实用建议
3. 解释幸运周期和时机
4. 以同情心和尊重的态度对待
5. 提供可行的、基于五行平衡原则的建议

分析结构（必须包含所有这些部分）：
### 1. 命盘结构与强弱分析
### 2. 职业与财富
### 3. 关系与婚姻
### 4. 健康与养生
### 5. 性格与品质
### 6. 幸运周期与时机
### 7. 人生指引与个人发展

⚠️ **最重要的格式要求：**
在每一个上述的章节结束后，你必须立即包含以下内容：

**💡 可行建议：**
• [具体行动1：明确、可在1-3个月内执行的建议]
• [具体行动2：与你的八字特质相关的具体步骤]
• [具体行动3：实用的日常建议或时机提示]
• [具体行动4：额外的智慧洞见]
• [具体行动5：特别重要的建议]

不要跳过这一部分。每个章节都必须包含这些要点。格式必须完全相同。

用简体中文回应。"""
    
    elif language == "ko":
        return """You are an experienced BAZI master with deep knowledge of Chinese metaphysics and destiny analysis.

Your analysis should:
1. Directly and specifically explain the strength/weakness of the Day Master
2. Provide practical guidance on career, wealth, relationships, and health
3. Explain luck cycles and timing
4. Be compassionate and respectful in tone
5. Offer actionable advice based on Five Element balance principles

Required Analysis Structure (you MUST include all these sections):
### 1. 사주 구조 및 강약 분석 (Chart Structure & Strength Analysis)
### 2. 직업 및 재물 운 (Career & Finance)
### 3. 관계 및 혼인 (Relationships & Marriage)
### 4. 건강 및 양생 (Health & Wellness)
### 5. 성격 및 품질 (Personality & Character)
### 6. 행운 주기 및 시기 (Luck Cycles & Timing)
### 7. 인생 지도 및 개인 발전 (Life Guidance & Personal Development)

⚠️ **CRITICAL FORMAT REQUIREMENT:**
AFTER EACH SECTION ENDS, YOU MUST IMMEDIATELY INCLUDE:

**💡 실행 가능한 제안:**
• [구체적인 행동 1: 명확하고 1-3개월 내에 실행 가능한 제안]
• [구체적인 행동 2: 당신의 사주 특성과 관련된 구체적인 단계]
• [구체적인 행동 3: 실질적인 일상 팁 또는 시기 조언]
• [구체적인 행동 4: 추가적인 지혜 또는 통찰]
• [구체적인 행동 5: 특히 중요한 제안]

DO NOT skip this section. Every section MUST have these bullet points. Format must be exactly as shown.

Respond entirely in Korean (한국어로 전부 응답하세요)."""
    
    else:  # English
        return """You are an experienced BAZI master with deep knowledge of Chinese metaphysics and destiny analysis.

Your analysis should:
1. Directly and specifically explain the strength/weakness of the Day Master
2. Provide practical guidance on career, wealth, relationships, and health
3. Explain luck cycles and timing
4. Be compassionate and respectful in tone
5. Offer actionable advice based on Five Element balance principles

Required Analysis Structure (you MUST include all these sections):
### 1. Chart Structure & Strength Analysis
### 2. Career & Finance
### 3. Relationships & Marriage
### 4. Health & Wellness
### 5. Personality & Character
### 6. Luck Cycles & Timing
### 7. Life Guidance & Personal Development

⚠️ **CRITICAL FORMAT REQUIREMENT:**
AFTER EACH SECTION ENDS, YOU MUST IMMEDIATELY INCLUDE:

**💡 Actionable Suggestions:**
• [Specific action #1: Be concrete and executable within 1-3 months]
• [Specific action #2: A specific step aligned with their BAZI profile]
• [Specific action #3: Practical daily tip or timing advice]
• [Specific action #4: Additional wisdom or insight]
• [Specific action #5: Particularly important recommendation]

DO NOT skip this section. Every section MUST have these bullet points. Format must be exactly as shown.

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
    
    if language == "zh-TW":
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

請按照系統提示中的結構進行分析，並在每個章節後立即包含「可行建議」部分，用符號「•」開始每一行建議。"""
    
    elif language == "zh-CN":
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

请按照系统提示中的结构进行分析，并在每个章节后立即包含「可行建议」部分，用符号「•」开始每一行建议。"""
    
    elif language == "ko":
        return f"""Please provide a comprehensive BAZI analysis for the following chart. Format your entire response in Korean (한국어로 전체 응답을 제공하세요):

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

Please follow the structure in the system prompt exactly. After each section, IMMEDIATELY include the "실행 가능한 제안" (Actionable Suggestions) with bullet points starting with •"""
    
    else:  # English
        return f"""Please provide a comprehensive BAZI analysis for the following chart:

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

Please follow the structure in the system prompt exactly. After each section, IMMEDIATELY include the "Actionable Suggestions" with bullet points starting with •. Do not skip any section."""