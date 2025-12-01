"""
Heavenly Stems (天干) and Earthly Branches (地支) definitions and mappings

The foundation of BAZI system. Each of the 10 stems and 12 branches
has associated element, yin/yang, and properties.
"""

from enum import Enum
from typing import Dict, Tuple

# ==================== HEAVENLY STEMS ====================

class HeavenlyStem(Enum):
    """10 Heavenly Stems with their properties"""
    
    # Yang Stems
    JIA = {"name_cn": "甲", "name_pinyin": "Jiǎ", "element": "Wood", "yin_yang": "Yang"}      # 1
    BING = {"name_cn": "丙", "name_pinyin": "Bǐng", "element": "Fire", "yin_yang": "Yang"}    # 3
    WU = {"name_cn": "戊", "name_pinyin": "Wù", "element": "Earth", "yin_yang": "Yang"}       # 5
    GENG = {"name_cn": "庚", "name_pinyin": "Gēng", "element": "Metal", "yin_yang": "Yang"}   # 7
    REN = {"name_cn": "壬", "name_pinyin": "Rén", "element": "Water", "yin_yang": "Yang"}     # 9
    
    # Yin Stems
    YI = {"name_cn": "乙", "name_pinyin": "Yǐ", "element": "Wood", "yin_yang": "Yin"}        # 2
    DING = {"name_cn": "丁", "name_pinyin": "Dīng", "element": "Fire", "yin_yang": "Yin"}    # 4
    JI = {"name_cn": "己", "name_pinyin": "Jǐ", "element": "Earth", "yin_yang": "Yin"}      # 6
    XIN = {"name_cn": "辛", "name_pinyin": "Xīn", "element": "Metal", "yin_yang": "Yin"}     # 8
    GUI = {"name_cn": "癸", "name_pinyin": "Guǐ", "element": "Water", "yin_yang": "Yin"}     # 10


# Stem to index mapping (0-9)
STEM_INDEX = {
    HeavenlyStem.JIA: 0,
    HeavenlyStem.YI: 1,
    HeavenlyStem.BING: 2,
    HeavenlyStem.DING: 3,
    HeavenlyStem.WU: 4,
    HeavenlyStem.JI: 5,
    HeavenlyStem.GENG: 6,
    HeavenlyStem.XIN: 7,
    HeavenlyStem.REN: 8,
    HeavenlyStem.GUI: 9,
}

# Index to stem mapping
INDEX_TO_STEM = {v: k for k, v in STEM_INDEX.items()}

# ==================== EARTHLY BRANCHES ====================

class EarthlyBranch(Enum):
    """12 Earthly Branches with their properties and zodiac animals"""
    
    ZI = {"name_cn": "子", "name_pinyin": "Zǐ", "zodiac": "Rat", "element": "Water", "yin_yang": "Yang"}       # 0
    CHOU = {"name_cn": "丑", "name_pinyin": "Chǒu", "zodiac": "Ox", "element": "Earth", "yin_yang": "Yin"}     # 1
    YIN = {"name_cn": "寅", "name_pinyin": "Yín", "zodiac": "Tiger", "element": "Wood", "yin_yang": "Yang"}    # 2
    MAO = {"name_cn": "卯", "name_pinyin": "Mǎo", "zodiac": "Rabbit", "element": "Wood", "yin_yang": "Yin"}    # 3
    CHEN = {"name_cn": "辰", "name_pinyin": "Chén", "zodiac": "Dragon", "element": "Earth", "yin_yang": "Yang"} # 4
    SI = {"name_cn": "巳", "name_pinyin": "Sì", "zodiac": "Snake", "element": "Fire", "yin_yang": "Yin"}        # 5
    WU_BRANCH = {"name_cn": "午", "name_pinyin": "Wǔ", "zodiac": "Horse", "element": "Fire", "yin_yang": "Yang"} # 6
    WEI = {"name_cn": "未", "name_pinyin": "Wèi", "zodiac": "Goat", "element": "Earth", "yin_yang": "Yin"}      # 7
    SHEN = {"name_cn": "申", "name_pinyin": "Shēn", "zodiac": "Monkey", "element": "Metal", "yin_yang": "Yang"}  # 8
    YOU = {"name_cn": "酉", "name_pinyin": "Yǒu", "zodiac": "Rooster", "element": "Metal", "yin_yang": "Yin"}   # 9
    XU = {"name_cn": "戌", "name_pinyin": "Xū", "zodiac": "Dog", "element": "Earth", "yin_yang": "Yang"}        # 10
    HAI = {"name_cn": "亥", "name_pinyin": "Hài", "zodiac": "Pig", "element": "Water", "yin_yang": "Yin"}       # 11


# Branch to index mapping (0-11)
BRANCH_INDEX = {
    EarthlyBranch.ZI: 0,
    EarthlyBranch.CHOU: 1,
    EarthlyBranch.YIN: 2,
    EarthlyBranch.MAO: 3,
    EarthlyBranch.CHEN: 4,
    EarthlyBranch.SI: 5,
    EarthlyBranch.WU_BRANCH: 6,
    EarthlyBranch.WEI: 7,
    EarthlyBranch.SHEN: 8,
    EarthlyBranch.YOU: 9,
    EarthlyBranch.XU: 10,
    EarthlyBranch.HAI: 11,
}

# Index to branch mapping
INDEX_TO_BRANCH = {v: k for k, v in BRANCH_INDEX.items()}

# ==================== HELPER FUNCTIONS ====================

def get_stem_by_index(index: int) -> HeavenlyStem:
    """Get stem from 0-9 index"""
    return INDEX_TO_STEM.get(index % 10)


def get_branch_by_index(index: int) -> EarthlyBranch:
    """Get branch from 0-11 index"""
    return INDEX_TO_BRANCH.get(index % 12)


def get_stem_element(stem: HeavenlyStem) -> str:
    """Get element of a stem"""
    return stem.value.get("element")


def get_branch_element(branch: EarthlyBranch) -> str:
    """Get element of a branch"""
    return branch.value.get("element")


def get_stem_yin_yang(stem: HeavenlyStem) -> str:
    """Get yin/yang of a stem"""
    return stem.value.get("yin_yang")


def get_branch_yin_yang(branch: EarthlyBranch) -> str:
    """Get yin/yang of a branch"""
    return branch.value.get("yin_yang")


def get_branch_zodiac(branch: EarthlyBranch) -> str:
    """Get zodiac animal of a branch"""
    return branch.value.get("zodiac")


def stem_to_dict(stem: HeavenlyStem) -> Dict:
    """Convert stem to dictionary"""
    return {
        "name_cn": stem.value["name_cn"],
        "name_pinyin": stem.value["name_pinyin"],
        "element": stem.value["element"],
        "yin_yang": stem.value["yin_yang"],
    }


def branch_to_dict(branch: EarthlyBranch) -> Dict:
    """Convert branch to dictionary"""
    return {
        "name_cn": branch.value["name_cn"],
        "name_pinyin": branch.value["name_pinyin"],
        "zodiac": branch.value["zodiac"],
        "element": branch.value["element"],
        "yin_yang": branch.value["yin_yang"],
    }
