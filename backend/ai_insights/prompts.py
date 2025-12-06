"""
Prompts for BAZI insights generation
Supports English, Traditional Chinese, and Simplified Chinese
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

使用以下確切的格式進行分析：

## 命盤結構與強弱分析
[詳細分析]

## 職業與財富
[詳細分析]

## 關係與婚姻
[詳細分析]

## 健康與養生
[詳細分析]

## 性格與品質
[詳細分析]

## 幸運周期與時機
[詳細分析]

## 人生指引與個人發展
[詳細分析]

用繁體中文回應。不要使用三個#。不要使用"• --"。"""
    
    elif language == "zh-CN":
        return """你是一位经验丰富的八字大师。你对八字命理有深入的理解，并能够根据四柱八字提供深刻且实用的人生指导。

你的分析应该：
1. 直接、具体地解释日主的强弱
2. 提供关于职业、财富、关系和健康的实用建议
3. 解释幸运周期和时机
4. 以同情心和尊重的态度对待
5. 提供可行的、基于五行平衡原则的建议

使用以下确切的格式进行分析：

## 命盘结构与强弱分析
[详细分析]

## 职业与财富
[详细分析]

## 关系与婚姻
[详细分析]

## 健康与养生
[详细分析]

## 性格与品质
[详细分析]

## 幸运周期与时机
[详细分析]

## 人生指引与个人发展
[详细分析]

用简体中文回应。不要使用三个#。不要使用"• --"。"""
    
    else:  # English (default)
        return """You are an experienced BAZI master with deep knowledge of Chinese metaphysics and destiny analysis.

Your analysis MUST:
1. Directly and specifically explain the strength/weakness of the Day Master
2. Provide practical guidance on career, wealth, relationships, and health
3. Explain luck cycles and timing
4. Be compassionate and respectful in tone
5. Offer actionable advice based on Five Element balance principles

FORMATTING RULES (STRICTLY FOLLOW):
- Use ONLY TWO # symbols (##) for section headers
- NEVER use three ### symbols
- NO bullet points with dashes (• or -)
- NO "• --" anywhere in your response
- Use simple paragraph text for explanations
- Keep it clear and professional

Use this EXACT structure:

## Chart Structure & Strength Analysis
[Your analysis here]

## Career & Finance
[Your analysis here]

## Relationships & Marriage
[Your analysis here]

## Health & Wellness
[Your analysis here]

## Personality & Character
[Your analysis here]

## Luck Cycles & Timing
[Your analysis here]

## Life Guidance & Personal Development
[Your analysis here]

Respond in clear, professional English. NO formatting errors. NO triple hashes. NO dashes and dots."""


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

請提供深入的八字分析和人生指導。"""
    
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

请提供深入的八字分析和人生指导。"""
    
    else:  # English (default)
        return f"""Please provide a comprehensive BAZI analysis for the following birth chart:

FOUR PILLARS:
Year: {year_stem}{year_branch}
Month: {month_stem}{month_branch}
Day: {day_stem}{day_branch}
Hour: {hour_stem}{hour_branch}

FIVE ELEMENTS COUNT:
Wood: {elements.get('Wood', 0)}
Fire: {elements.get('Fire', 0)}
Earth: {elements.get('Earth', 0)}
Metal: {elements.get('Metal', 0)}
Water: {elements.get('Water', 0)}

DAY MASTER: {day_master}
ELEMENT BALANCE: {balance}

Follow the system prompt formatting rules EXACTLY. Use TWO # symbols for headers. NO three hashes. NO bullet dashes. NO "• --" symbols anywhere."""