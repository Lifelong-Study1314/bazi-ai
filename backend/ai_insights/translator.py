import logging
import aiohttp
from typing import Optional

logger = logging.getLogger(__name__)

async def translate_to_korean_google(text: str) -> str:
    """
    Translate English text to Korean using Google Translate API
    Falls back to simple dictionary if API fails
    """
    if not text or len(text.strip()) == 0:
        return text
    
    try:
        # Using free Google Translate API endpoint
        url = "https://translate.googleapis.com/translate_a/element.js"
        
        async with aiohttp.ClientSession() as session:
            params = {
                'client': 'gtx',
            }
            
            # Alternative approach: use google-cloud-translate or similar
            # For now, use the simple translation service
            translate_url = f"https://api.mymemory.translated.net/get?q={text}&langpair=en|ko"
            
            async with session.get(translate_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('responseStatus') == 200:
                        translated = data.get('responseData', {}).get('translatedText', '')
                        if translated and translated != text:
                            logger.debug(f"Translated: {text[:50]}... -> {translated[:50]}...")
                            return translated
    except Exception as e:
        logger.warning(f"Translation API error: {e}, falling back to dictionary")
    
    # Fallback to simple dictionary replacement
    return simple_translate_to_korean(text)


def simple_translate_to_korean(text: str) -> str:
    """
    Simple Korean translation using dictionary replacement
    Handles key BAZI terms and common phrases
    """
    if not text:
        return text
    
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
        
        # Day Master titles
        "Day Master": "일주(일간)",
        "Season": "계절",
        "Strength Assessment": "강약 평가",
        "Overall Assessment": "전체 평가",
        "Support": "지지",
        "Opposition": "대항",
        "Conclusion": "결론",
        "Five Elements": "오행",
        "Root Support": "근 지지",
        
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
        "Neutral": "중립적",
        "severely cold": "극도로 차가운",
        
        # Common phrases
        "is weak": "는 약합니다",
        "is strong": "는 강합니다",
        "lack of": "부족",
        "lack": "부족",
        "absence of": "없음",
        "your": "당신의",
        "you": "당신",
        "your chart": "당신의 사주",
        "your Day Master": "당신의 일주",
        "you have": "당신은 가지고 있습니다",
        "abundance of": "풍부한",
        "the presence of": "의 존재",
        "excess of": "초과",
    }
    
    result = text
    
    # Replace longer phrases first to avoid conflicts
    sorted_translations = sorted(translation_map.items(), key=lambda x: len(x[0]), reverse=True)
    
    for english, korean in sorted_translations:
        # Case-insensitive replacement
        import re
        result = re.sub(r'\b' + re.escape(english) + r'\b', korean, result, flags=re.IGNORECASE)
    
    return result