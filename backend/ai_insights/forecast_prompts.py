"""
Daily Wisdom Prompt — small AI call for a personalised motivational sentence.
"""

from typing import Tuple


def get_daily_wisdom_prompt(
    chart: dict,
    daily_data: dict,
    language: str = "en",
) -> Tuple[str, str]:
    """
    Build (system_message, user_prompt) for a tiny AI call (~100 tokens).

    Args:
        chart: result of calculate_bazi()
        daily_data: result of calculate_daily_forecast()
        language: en / zh-TW / zh-CN / ko
    """
    dm_element = chart.get("day_master", {}).get("element", "Wood")
    daily_elem = daily_data.get("daily_pillar", {}).get("stem", {}).get("element", "Wood")
    score = daily_data.get("overall_score", 50)
    mood = daily_data.get("mood", "")
    domains = daily_data.get("domains", {})
    top_domain = max(domains, key=domains.get) if domains else "career"
    use_god = chart.get("use_god", {}).get("use_god", dm_element)

    lang_label = {
        "en": "English",
        "zh-TW": "Traditional Chinese (繁體中文)",
        "zh-CN": "Simplified Chinese (简体中文)",
        "ko": "Korean (한국어)",
    }.get(language, "English")

    system_message = (
        "You are a warm, encouraging BAZI fortune advisor. "
        "Give ONE personalized motivational sentence (max 2 sentences). "
        f"Respond ONLY in {lang_label}. "
        "Do NOT include greetings, titles, or explanations — just the wisdom quote."
    )

    user_prompt = (
        f"Day Master element: {dm_element}\n"
        f"Today's element: {daily_elem}\n"
        f"Use God element: {use_god}\n"
        f"Overall fortune score: {score}/100 ({mood})\n"
        f"Strongest domain today: {top_domain}\n"
        f"\nGive a personalized, poetic daily wisdom quote."
    )

    return system_message, user_prompt
