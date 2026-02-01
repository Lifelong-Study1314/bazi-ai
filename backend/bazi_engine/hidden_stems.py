"""
Hidden Heavenly Stems (藏干) in Earthly Branches

Each Earthly Branch contains 1-3 Hidden Heavenly Stems representing
internal, hidden aspects beneath surface manifestations.
Standard mapping per Wikibooks/Imperial Harvest.
"""

from typing import Dict, List
from .stems_branches import (
    EarthlyBranch,
    HeavenlyStem,
    stem_to_dict,
    BRANCH_INDEX,
)

# Branch -> Hidden Stems mapping (藏干)
# Order: primary, secondary, tertiary (where applicable)
BRANCH_HIDDEN_STEMS: Dict[EarthlyBranch, List[HeavenlyStem]] = {
    EarthlyBranch.ZI: [HeavenlyStem.REN],                           # 子: 壬
    EarthlyBranch.CHOU: [HeavenlyStem.JI, HeavenlyStem.GUI, HeavenlyStem.XIN],   # 丑: 己癸辛
    EarthlyBranch.YIN: [HeavenlyStem.WU, HeavenlyStem.JIA, HeavenlyStem.BING],   # 寅: 戊甲丙
    EarthlyBranch.MAO: [HeavenlyStem.YI],                          # 卯: 乙
    EarthlyBranch.CHEN: [HeavenlyStem.WU, HeavenlyStem.YI, HeavenlyStem.GUI],   # 辰: 戊乙癸
    EarthlyBranch.SI: [HeavenlyStem.GENG, HeavenlyStem.BING, HeavenlyStem.WU],  # 巳: 庚丙戊
    EarthlyBranch.WU_BRANCH: [HeavenlyStem.DING, HeavenlyStem.JI],              # 午: 丁己
    EarthlyBranch.WEI: [HeavenlyStem.JI, HeavenlyStem.DING, HeavenlyStem.YI],   # 未: 己丁乙
    EarthlyBranch.SHEN: [HeavenlyStem.WU, HeavenlyStem.GENG, HeavenlyStem.REN],  # 申: 戊庚壬
    EarthlyBranch.YOU: [HeavenlyStem.XIN],                         # 酉: 辛
    EarthlyBranch.XU: [HeavenlyStem.XIN, HeavenlyStem.DING, HeavenlyStem.WU],   # 戌: 辛丁戊
    EarthlyBranch.HAI: [HeavenlyStem.REN, HeavenlyStem.JIA],      # 亥: 壬甲
}

# Map branch name_cn to EarthlyBranch for lookup from dict
BRANCH_NAME_TO_ENUM = {
    "子": EarthlyBranch.ZI,
    "丑": EarthlyBranch.CHOU,
    "寅": EarthlyBranch.YIN,
    "卯": EarthlyBranch.MAO,
    "辰": EarthlyBranch.CHEN,
    "巳": EarthlyBranch.SI,
    "午": EarthlyBranch.WU_BRANCH,
    "未": EarthlyBranch.WEI,
    "申": EarthlyBranch.SHEN,
    "酉": EarthlyBranch.YOU,
    "戌": EarthlyBranch.XU,
    "亥": EarthlyBranch.HAI,
}


def get_hidden_stems(branch: EarthlyBranch) -> List[Dict]:
    """
    Get hidden heavenly stems for an earthly branch.

    Args:
        branch: EarthlyBranch enum

    Returns:
        List of stem dicts (name_cn, name_pinyin, element, yin_yang)
    """
    stems = BRANCH_HIDDEN_STEMS.get(branch, [])
    return [stem_to_dict(s) for s in stems]


def annotate_four_pillars_with_hidden_stems(four_pillars: Dict) -> Dict:
    """
    Add hidden_stems to each branch in four_pillars.
    Mutates four_pillars in place and returns it.

    Args:
        four_pillars: Dict with year/month/day/hour, each having stem and branch (dicts)

    Returns:
        The same four_pillars dict (mutated)
    """
    for pillar_name in ["year", "month", "day", "hour"]:
        pillar = four_pillars.get(pillar_name, {})
        branch_dict = pillar.get("branch")
        if not branch_dict:
            continue
        name_cn = branch_dict.get("name_cn")
        branch_enum = BRANCH_NAME_TO_ENUM.get(name_cn)
        if branch_enum is not None:
            branch_dict["hidden_stems"] = get_hidden_stems(branch_enum)
    return four_pillars
