import logging
import re

logger = logging.getLogger(__name__)

def simple_translate_to_korean(text: str) -> str:
    """
    Simple Korean translation using dictionary replacement
    Handles key BAZI terms and common phrases
    """
    if not text:
        return text
    
    logger.debug(f"TRANSLATOR INPUT: {text[:100]}...")
    
    # Comprehensive BAZI term translation dictionary
    translation_map = {
        # Section titles
        "Chart Structure & Strength Analysis": "사주 구조 및 강약 분석",
        "Career & Finance": "직업 및 재물 운",
        "Relationships & Marriage": "관계 및 혼인",
        "Health & Wellness": "건강 및 양생",
        "Personality & Character": "성격 및 품질",
        "Luck Cycles & Timing": "행운 주기 및 시기",
        "Life Guidance & Personal Development": "인생 지도 및 개인 발전",
        "Actionable Suggestions": "실행 가능한 제안",
        
        # Common phrases - THESE SHOULD MATCH
        "Day Master": "일주",
        "is weak": "는 약합니다",
        "is strong": "는 강합니다",
        "Your": "당신의",
        "your": "당신의",
        "You": "당신",
        "you": "당신",
        
        # Elements
        "Wood": "목",
        "Fire": "화",
        "Earth": "토",
        "Metal": "금",
        "Water": "수",
    }
    
    result = text
    replaced_count = 0
    
    # Replace longer phrases first to avoid conflicts
    sorted_translations = sorted(translation_map.items(), key=lambda x: len(x[0]), reverse=True)
    
    for english, korean in sorted_translations:
        # Simple string replacement (not regex for now)
        if english in result:
            old_result = result
            result = result.replace(english, korean)
            if result != old_result:
                replaced_count += 1
                logger.debug(f"  Replaced '{english}' -> '{korean}'")
    
    logger.debug(f"TRANSLATOR OUTPUT: {result[:100]}... (replaced {replaced_count} terms)")
    return result