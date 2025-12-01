"""
BAZI Chart Calculator

Core logic for converting birth date/time to BAZI chart
This is the heart of the application
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from .stems_branches import HeavenlyStem, EarthlyBranch, get_stem_by_index, \
                             get_branch_by_index, stem_to_dict, branch_to_dict, \
                             get_stem_element, get_branch_element
from .elements import count_elements, get_element_balance


# BAZI Chart data for years 1900-2100 (simplified version)
# In production, use a proper lunar calendar library like pylunar when available on macOS
# For now, we'll use a calculated approach

GREGORIAN_EPOCH = 1900  # Starting reference year


def get_year_stem_branch(year: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given year
    
    The pattern repeats every 60 years (60 = LCM of 10 stems and 12 branches)
    Year 1900 (庚子) is position 0
    
    Args:
        year: Gregorian calendar year (e.g., 1995)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Calculate position in 60-year cycle
    year_position = (year - GREGORIAN_EPOCH) % 60
    
    # Stem cycles every 10 years
    stem_index = year_position % 10
    # Branch cycles every 12 years
    branch_index = year_position % 12
    
    stem = get_stem_by_index(stem_index)
    branch = get_branch_by_index(branch_index)
    
    return stem, branch


def is_leap_year(year: int) -> bool:
    """Check if a year is a leap year"""
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)


def get_days_in_month(year: int, month: int) -> int:
    """Get number of days in a specific month"""
    days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    if month == 2 and is_leap_year(year):
        return 29
    return days_in_month[month - 1]


def get_day_stem_branch(year: int, month: int, day: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given day
    
    Uses the "day number" calculation from January 1, 1900
    Day 1 was 甲子 (Jiǎ-Zǐ)
    
    Args:
        year: Gregorian calendar year
        month: Month (1-12)
        day: Day (1-31)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Calculate total days from January 1, 1900
    total_days = 0
    
    # Add days for complete years
    for y in range(GREGORIAN_EPOCH, year):
        total_days += 366 if is_leap_year(y) else 365
    
    # Add days for complete months in current year
    for m in range(1, month):
        total_days += get_days_in_month(year, m)
    
    # Add remaining days
    total_days += day
    
    # Day 1 (January 1, 1900) was 甲子 (position 0)
    day_position = (total_days - 1) % 60
    
    stem_index = day_position % 10
    branch_index = day_position % 12
    
    stem = get_stem_by_index(stem_index)
    branch = get_branch_by_index(branch_index)
    
    return stem, branch


def get_month_stem_branch(year: int, month: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given month
    
    The month stem depends on the year stem
    The month branch follows the zodiac: Zǐ (11), Chǒu (12), Yín (1), Mǎo (2)...
    
    Args:
        year: Gregorian calendar year
        month: Month (1-12)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    # Get year stem
    year_stem, _ = get_year_stem_branch(year)
    year_stem_index = (year_stem.value["name_cn"].encode('utf-8'))
    
    # Find year stem in stem list (0-9)
    from .stems_branches import STEM_INDEX
    year_stem_pos = STEM_INDEX.get(year_stem, 0)
    
    # Month stem cycle: depends on year stem
    # Each year, stems shift by 2 (yin-yang pairs)
    # Month 1 (Jan/Feb in solar) = Month 11 in lunar (Zǐ) - actually it's complex
    
    # Simplified: Month stems follow a pattern based on year stem
    # For now, use a basic pattern (this should be enhanced with lunar calendar)
    month_stem_base = year_stem_pos * 2
    month_stem_index = (month_stem_base + (month - 1) % 12) % 10
    
    month_stem = get_stem_by_index(month_stem_index)
    
    # Month branch follows lunar zodiac
    # Solar month 1-2 = lunar 11, 12
    # Solar month 3-4 = lunar 1, 2, etc.
    month_branch_index = (month + 10) % 12  # Converts solar to lunar month branch
    month_branch = get_branch_by_index(month_branch_index)
    
    return month_stem, month_branch


def get_hour_stem_branch(day_stem: HeavenlyStem, hour: int) -> Tuple[HeavenlyStem, EarthlyBranch]:
    """
    Calculate Heavenly Stem and Earthly Branch for a given hour
    
    The hour branch depends on the time (0-23):
    Zǐ (11pm-1am, hour 23-1)
    Chǒu (1am-3am, hour 1-3)
    ... and so on (each 2-hour period)
    
    The hour stem cycles through stems (skip some) based on day stem
    
    Args:
        day_stem: HeavenlyStem of the day
        hour: Hour in 24-hour format (0-23)
        
    Returns:
        (HeavenlyStem, EarthlyBranch)
    """
    from .stems_branches import STEM_INDEX
    
    # Hour branch mapping (2-hour periods)
    # Hour 0-1: Zǐ (11pm-1am)
    # Hour 2-3: Chǒu (1am-3am)
    # Hour 4-5: Yín (3am-5am)
    # ... etc
    hour_for_branch = hour % 24
    
    # Special handling: BAZI uses Chinese traditional hours (12 periods)
    if hour_for_branch >= 23 or hour_for_branch < 1:
        hour_branch_index = 0  # Zǐ
    else:
        hour_branch_index = (hour_for_branch + 1) // 2
        if hour_branch_index > 11:
            hour_branch_index = 11
    
    hour_branch = get_branch_by_index(hour_branch_index)
    
    # Hour stem calculation based on day stem
    day_stem_pos = STEM_INDEX.get(day_stem, 0)
    
    # Each day stem corresponds to a starting hour stem
    # The hour stems follow the pattern based on day stem
    hour_stem_base = (day_stem_pos // 2) * 2  # Determine starting point
    hour_stem_index = (hour_stem_base + hour_branch_index // 2) % 10
    
    hour_stem = get_stem_by_index(hour_stem_index)
    
    return hour_stem, hour_branch


def calculate_bazi(birth_date_str: str, birth_hour: int, gender: str) -> Dict:
    """
    Calculate complete BAZI chart for a person
    
    Args:
        birth_date_str: Birth date as "YYYY-MM-DD"
        birth_hour: Birth hour (0-23)
        gender: "male" or "female"
        
    Returns:
        Complete BAZI chart dictionary
        
    Example:
        calculate_bazi("1990-05-15", 14, "male")
    """
    try:
        # Parse input
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        year = birth_date.year
        month = birth_date.month
        day = birth_date.day
        
        # Calculate four pillars
        year_stem, year_branch = get_year_stem_branch(year)
        month_stem, month_branch = get_month_stem_branch(year, month)
        day_stem, day_branch = get_day_stem_branch(year, month, day)
        hour_stem, hour_branch = get_hour_stem_branch(day_stem, birth_hour)
        
        # Convert to dictionary format
        four_pillars = {
            "year": {
                "stem": stem_to_dict(year_stem),
                "branch": branch_to_dict(year_branch),
            },
            "month": {
                "stem": stem_to_dict(month_stem),
                "branch": branch_to_dict(month_branch),
            },
            "day": {
                "stem": stem_to_dict(day_stem),
                "branch": branch_to_dict(day_branch),
            },
            "hour": {
                "stem": stem_to_dict(hour_stem),
                "branch": branch_to_dict(hour_branch),
            },
        }
        
        # Extract elements from all pillars
        all_elements = []
        for pillar_name in ["year", "month", "day", "hour"]:
            pillar = four_pillars[pillar_name]
            all_elements.append(pillar["stem"]["element"])
            all_elements.append(pillar["branch"]["element"])
        
        # Count and analyze elements
        element_counts = count_elements(all_elements)
        element_analysis = get_element_balance(element_counts)
        
        # Determine day master (core of the chart)
        day_master_stem = four_pillars["day"]["stem"]["name_cn"]
        day_master_element = four_pillars["day"]["stem"]["element"]
        
        return {
            "success": True,
            "input": {
                "birth_date": birth_date_str,
                "birth_hour": birth_hour,
                "gender": gender,
                "birth_hour_name": f"{birth_hour}:00",
            },
            "four_pillars": four_pillars,
            "day_master": {
                "stem_cn": day_master_stem,
                "element": day_master_element,
                "yin_yang": four_pillars["day"]["stem"]["yin_yang"],
            },
            "elements": {
                "counts": element_counts,
                "analysis": element_analysis,
            },
            "all_elements": all_elements,
        }
        
    except ValueError as e:
        return {
            "success": False,
            "error": f"Invalid input: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Calculation error: {str(e)}"
        }
