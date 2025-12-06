"""
Korean translation for BAZI analysis
Simple term-by-term replacement
"""

import logging

logger = logging.getLogger(__name__)


# Comprehensive translation dictionary
KOREAN_MAP = {
    # Section titles
    "Chart Structure & Strength Analysis": "사주 구조 및 강약 분석",
    "Career & Finance": "직업 및 재물 운",
    "Relationships & Marriage": "관계 및 혼인",
    "Health & Wellness": "건강 및 양생",
    "Personality & Character": "성격 및 품질",
    "Luck Cycles & Timing": "행운 주기 및 시기",
    "Life Guidance & Personal Development": "인생 지도 및 개인 발전",
    "Actionable Suggestions": "실행 가능한 제안",
    
    # Common single words
    "Day Master": "일주",
    "Day": "날",
    "Master": "주",
    "Season": "계절",
    "Support": "지지",
    "Opposition": "대항",
    "Conclusion": "결론",
    "Overall": "전체",
    "Strength": "강약",
    "Analysis": "분석",
    
    # Elements
    "Wood": "목",
    "Fire": "화",
    "Earth": "토",
    "Metal": "금",
    "Water": "수",
    "Yang": "양",
    "Yin": "음",
    
    # Strength descriptors
    "Strong": "강함",
    "Weak": "약함",
    "Balanced": "균형",
    "Neutral": "중립",
    
    # Common words
    "The": "그",
    "Your": "당신의",
    "You": "당신",
    "Chart": "사주",
    "Analysis": "분석",
    "Insights": "통찰",
}


def translate_to_korean(text: str) -> str:
    """
    Translate English text to Korean using simple replacements
    """
    if not text or len(text) == 0:
        return text
    
    result = text
    
    # Replace terms (longer first to avoid partial matches)
    sorted_map = sorted(KOREAN_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    
    for english, korean in sorted_map:
        result = result.replace(english, korean)
    
    return result