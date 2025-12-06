"""
Korean translation for BAZI analysis
"""

import logging
import re

logger = logging.getLogger(__name__)


KOREAN_MAP = {
    # Section titles (longest first)
    "Chart Structure & Strength Analysis": "사주 구조 및 강약 분석",
    "Career & Finance": "직업 및 재물 운",
    "Relationships & Marriage": "관계 및 혼인",
    "Health & Wellness": "건강 및 양생",
    "Personality & Character": "성격 및 품질",
    "Luck Cycles & Timing": "행운 주기 및 시기",
    "Life Guidance & Personal Development": "인생 지도 및 개인 발전",
    "Actionable Suggestions": "실행 가능한 제안",
    
    # Phrases
    "Day Master": "일주",
    "Overall Strength": "전체 강약",
    "Key Dynamics": "핵심 역학",
    
    # Elements
    "Wood": "목",
    "Fire": "화",
    "Earth": "토",
    "Metal": "금",
    "Water": "수",
    
    # Strength
    "Strong": "강함",
    "Weak": "약함",
    "Balanced": "균형",
    
    # Common words (careful with these!)
    "your": "당신의",
    "Your": "당신의",
    "you": "당신",
    "You": "당신",
}


def translate_to_korean(text: str) -> str:
    """
    Translate English to Korean using word-boundary aware replacement
    """
    if not text or len(text) == 0:
        return text
    
    result = text
    
    # Sort by length (longest first) to handle phrases before individual words
    sorted_map = sorted(KOREAN_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    
    for english, korean in sorted_map:
        # Use word boundary regex to avoid partial matches
        # \b matches word boundaries
        pattern = r'\b' + re.escape(english) + r'\b'
        result = re.sub(pattern, korean, result, flags=re.IGNORECASE)
    
    return result