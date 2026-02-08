"""
Natal Pillar Interactions (命局合沖刑害)

Analyzes all interactions among the Four Pillars of the natal chart:
  - Six Combinations (六合) — harmonious branch pairs
  - Three Harmonies (三合) — powerful trios of branches
  - Six Clashes (六沖) — conflicting branch pairs
  - Six Harms (六害) — subtle undermining pairs
  - Three Punishments (三刑) — karmic challenge groups
  - Heavenly Stem Combinations (天干合) — stem affinity pairs
  - Self-Punishment (自刑) — branches that punish themselves when doubled

Each interaction is returned with:
  pillar_a, pillar_b (and optionally pillar_c for trios),
  type, polarity (+/-/neutral), and multi-language labels.
"""

from typing import Dict, List

# ---- Branch index table ----
BRANCH_NAME_TO_IDX = {
    "子": 0, "丑": 1, "寅": 2, "卯": 3, "辰": 4, "巳": 5,
    "午": 6, "未": 7, "申": 8, "酉": 9, "戌": 10, "亥": 11,
}

# ---- Stem index table ----
STEM_NAME_TO_IDX = {
    "甲": 0, "乙": 1, "丙": 2, "丁": 3, "戊": 4,
    "己": 5, "庚": 6, "辛": 7, "壬": 8, "癸": 9,
}

# =============== Branch interaction tables ===============

# Six Combinations (六合) — harmonious pairs
SIX_COMBINATIONS = {
    frozenset({0, 1}):   {"result": "Earth", "cn": "子丑合土"},
    frozenset({2, 11}):  {"result": "Wood",  "cn": "寅亥合木"},
    frozenset({3, 10}):  {"result": "Fire",  "cn": "卯戌合火"},
    frozenset({4, 9}):   {"result": "Metal", "cn": "辰酉合金"},
    frozenset({5, 8}):   {"result": "Water", "cn": "巳申合水"},
    frozenset({6, 7}):   {"result": "Fire",  "cn": "午未合火"},
}

# Three Harmonies (三合) — powerful trios
THREE_HARMONIES = {
    frozenset({8, 0, 4}):  {"result": "Water", "cn": "申子辰合水局"},
    frozenset({11, 3, 7}): {"result": "Wood",  "cn": "亥卯未合木局"},
    frozenset({2, 6, 10}): {"result": "Fire",  "cn": "寅午戌合火局"},
    frozenset({5, 9, 1}):  {"result": "Metal", "cn": "巳酉丑合金局"},
}

# Six Clashes (六沖) — conflicting pairs (6 apart)
SIX_CLASHES = {
    frozenset({0, 6}):  "子午沖",
    frozenset({1, 7}):  "丑未沖",
    frozenset({2, 8}):  "寅申沖",
    frozenset({3, 9}):  "卯酉沖",
    frozenset({4, 10}): "辰戌沖",
    frozenset({5, 11}): "巳亥沖",
}

# Six Harms (六害) — subtle friction pairs
SIX_HARMS = {
    frozenset({0, 7}):  "子未害",
    frozenset({1, 6}):  "丑午害",
    frozenset({2, 5}):  "寅巳害",
    frozenset({3, 4}):  "卯辰害",
    frozenset({8, 11}): "申亥害",
    frozenset({9, 10}): "酉戌害",
}

# Three Punishments (三刑)
# Group punishments (need at least 2 of 3 present)
THREE_PUNISHMENT_GROUPS = [
    {"indices": frozenset({2, 5, 8}),  "cn": "寅巳申三刑", "type": "ungrateful",
     "label_en": "Ungrateful Punishment", "label_tw": "無恩之刑", "label_cn": "无恩之刑", "label_ko": "무은지형(無恩之刑)"},
    {"indices": frozenset({1, 7, 10}), "cn": "丑未戌三刑", "type": "bullying",
     "label_en": "Bullying Punishment", "label_tw": "恃勢之刑", "label_cn": "恃势之刑", "label_ko": "시세지형(恃勢之刑)"},
]

# Pair punishments
PAIR_PUNISHMENTS = {
    frozenset({0, 3}): {"cn": "子卯刑", "type": "rude",
     "label_en": "Rude Punishment", "label_tw": "無禮之刑", "label_cn": "无礼之刑", "label_ko": "무례지형(無禮之刑)"},
}

# Self-punishment branches (when the same branch appears twice)
SELF_PUNISHMENT = {0, 6, 9, 11}  # 子午酉亥

# =============== Stem combination table ===============
# Heavenly Stem Combinations (天干合)
STEM_COMBINATIONS = {
    frozenset({0, 5}): {"result": "Earth", "cn": "甲己合土"},
    frozenset({1, 6}): {"result": "Metal", "cn": "乙庚合金"},
    frozenset({2, 7}): {"result": "Water", "cn": "丙辛合水"},
    frozenset({3, 8}): {"result": "Wood", "cn": "丁壬合木"},
    frozenset({4, 9}): {"result": "Fire",  "cn": "戊癸合火"},
}

# =============== Localized labels ===============

INTERACTION_TYPE_LABELS = {
    "six_combination": {
        "en": "Six Combination", "zh-TW": "六合", "zh-CN": "六合", "ko": "육합(六合)",
    },
    "three_harmony": {
        "en": "Three Harmony", "zh-TW": "三合", "zh-CN": "三合", "ko": "삼합(三合)",
    },
    "six_clash": {
        "en": "Six Clash", "zh-TW": "六沖", "zh-CN": "六冲", "ko": "육충(六沖)",
    },
    "six_harm": {
        "en": "Six Harm", "zh-TW": "六害", "zh-CN": "六害", "ko": "육해(六害)",
    },
    "three_punishment": {
        "en": "Three Punishment", "zh-TW": "三刑", "zh-CN": "三刑", "ko": "삼형(三刑)",
    },
    "self_punishment": {
        "en": "Self Punishment", "zh-TW": "自刑", "zh-CN": "自刑", "ko": "자형(自刑)",
    },
    "stem_combination": {
        "en": "Stem Combination", "zh-TW": "天干合", "zh-CN": "天干合", "ko": "천간합(天干合)",
    },
}

PILLAR_NAMES = {
    "year":  {"en": "Year",  "zh-TW": "年柱", "zh-CN": "年柱", "ko": "년주"},
    "month": {"en": "Month", "zh-TW": "月柱", "zh-CN": "月柱", "ko": "월주"},
    "day":   {"en": "Day",   "zh-TW": "日柱", "zh-CN": "日柱", "ko": "일주"},
    "hour":  {"en": "Hour",  "zh-TW": "時柱", "zh-CN": "时柱", "ko": "시주"},
}

POLARITY_LABELS = {
    "positive": {"en": "Harmonious", "zh-TW": "吉", "zh-CN": "吉", "ko": "길"},
    "negative": {"en": "Challenging", "zh-TW": "凶", "zh-CN": "凶", "ko": "흉"},
    "neutral":  {"en": "Neutral", "zh-TW": "中", "zh-CN": "中", "ko": "중"},
}


# =============== Analysis ===============

def _extract_branches(four_pillars: Dict) -> Dict[str, int]:
    """Return {pillar_name: branch_index} for each pillar."""
    result = {}
    for pn in ["year", "month", "day", "hour"]:
        name_cn = four_pillars.get(pn, {}).get("branch", {}).get("name_cn", "")
        idx = BRANCH_NAME_TO_IDX.get(name_cn, -1)
        if idx >= 0:
            result[pn] = idx
    return result


def _extract_stems(four_pillars: Dict) -> Dict[str, int]:
    """Return {pillar_name: stem_index} for each pillar."""
    result = {}
    for pn in ["year", "month", "day", "hour"]:
        name_cn = four_pillars.get(pn, {}).get("stem", {}).get("name_cn", "")
        idx = STEM_NAME_TO_IDX.get(name_cn, -1)
        if idx >= 0:
            result[pn] = idx
    return result


def _branch_cn(idx: int) -> str:
    """Get Chinese name from branch index."""
    for name, i in BRANCH_NAME_TO_IDX.items():
        if i == idx:
            return name
    return ""


def _stem_cn(idx: int) -> str:
    """Get Chinese name from stem index."""
    for name, i in STEM_NAME_TO_IDX.items():
        if i == idx:
            return name
    return ""


def analyze_pillar_interactions(four_pillars: Dict, language: str = "en") -> Dict:
    """
    Find all interactions among the natal Four Pillars.

    Returns:
      {
        "interactions": [
          {
            "type": "six_clash",
            "type_label": "Six Clash (六沖)",
            "pillars": ["year", "day"],
            "branches": "子午",
            "detail_cn": "子午沖",
            "polarity": "negative",
            "polarity_label": "Challenging",
            "description_en": "...",
            "description_zh_tw": "...",
            "description_zh_cn": "...",
            "description_ko": "...",
          },
          ...
        ],
        "summary": { "positive": N, "negative": N, "total": N }
      }
    """
    lang = language if language in ("en", "zh-TW", "zh-CN", "ko") else "en"
    branches = _extract_branches(four_pillars)
    stems = _extract_stems(four_pillars)

    pillar_keys = ["year", "month", "day", "hour"]
    interactions = []

    # --- Branch pair interactions ---
    for i in range(len(pillar_keys)):
        for j in range(i + 1, len(pillar_keys)):
            pn_a, pn_b = pillar_keys[i], pillar_keys[j]
            if pn_a not in branches or pn_b not in branches:
                continue
            idx_a, idx_b = branches[pn_a], branches[pn_b]
            pair = frozenset({idx_a, idx_b})
            br_a, br_b = _branch_cn(idx_a), _branch_cn(idx_b)

            pa_label = PILLAR_NAMES[pn_a].get(lang, pn_a)
            pb_label = PILLAR_NAMES[pn_b].get(lang, pn_b)

            # Six Combination
            if pair in SIX_COMBINATIONS:
                info = SIX_COMBINATIONS[pair]
                interactions.append(_make_interaction(
                    itype="six_combination", polarity="positive",
                    pillars=[pn_a, pn_b], branches=f"{br_a}{br_b}",
                    detail_cn=info["cn"], lang=lang,
                    pa_label=pa_label, pb_label=pb_label,
                    extra=info["result"],
                ))

            # Six Clash
            if pair in SIX_CLASHES:
                interactions.append(_make_interaction(
                    itype="six_clash", polarity="negative",
                    pillars=[pn_a, pn_b], branches=f"{br_a}{br_b}",
                    detail_cn=SIX_CLASHES[pair], lang=lang,
                    pa_label=pa_label, pb_label=pb_label,
                ))

            # Six Harm
            if pair in SIX_HARMS:
                interactions.append(_make_interaction(
                    itype="six_harm", polarity="negative",
                    pillars=[pn_a, pn_b], branches=f"{br_a}{br_b}",
                    detail_cn=SIX_HARMS[pair], lang=lang,
                    pa_label=pa_label, pb_label=pb_label,
                ))

            # Pair Punishment (子卯)
            if pair in PAIR_PUNISHMENTS:
                info = PAIR_PUNISHMENTS[pair]
                interactions.append(_make_interaction(
                    itype="three_punishment", polarity="negative",
                    pillars=[pn_a, pn_b], branches=f"{br_a}{br_b}",
                    detail_cn=info["cn"], lang=lang,
                    pa_label=pa_label, pb_label=pb_label,
                    extra_label=info.get(f"label_{_lang_key(lang)}", info["label_en"]),
                ))

            # Self-punishment (same branch in two pillars)
            if idx_a == idx_b and idx_a in SELF_PUNISHMENT:
                interactions.append(_make_interaction(
                    itype="self_punishment", polarity="negative",
                    pillars=[pn_a, pn_b], branches=f"{br_a}{br_b}",
                    detail_cn=f"{br_a}自刑", lang=lang,
                    pa_label=pa_label, pb_label=pb_label,
                ))

    # --- Three Harmonies (need 3 branches present) ---
    branch_set = set(branches.values())
    for trio_set, info in THREE_HARMONIES.items():
        present = []
        for pn in pillar_keys:
            if pn in branches and branches[pn] in trio_set:
                present.append(pn)
        if len(present) >= 3:
            br_names = "".join(_branch_cn(branches[p]) for p in present[:3])
            interactions.append({
                "type": "three_harmony",
                "type_label": INTERACTION_TYPE_LABELS["three_harmony"].get(lang, ""),
                "pillars": present[:3],
                "branches": br_names,
                "detail_cn": info["cn"],
                "polarity": "positive",
                "polarity_label": POLARITY_LABELS["positive"].get(lang, ""),
                "description": _desc_three_harmony(present[:3], info, lang),
            })
        # Also check partial (2 of 3) — note as a "partial" three harmony
        elif len(present) == 2:
            br_names = "".join(_branch_cn(branches[p]) for p in present)
            pa_label = PILLAR_NAMES[present[0]].get(lang, present[0])
            pb_label = PILLAR_NAMES[present[1]].get(lang, present[1])
            interactions.append({
                "type": "three_harmony",
                "type_label": INTERACTION_TYPE_LABELS["three_harmony"].get(lang, ""),
                "pillars": present,
                "branches": br_names,
                "detail_cn": info["cn"] + "（半合）",
                "polarity": "positive",
                "polarity_label": POLARITY_LABELS["positive"].get(lang, ""),
                "description": _desc_partial_three_harmony(present, info, lang),
                "partial": True,
            })

    # --- Three Punishment groups (need at least 2 of 3) ---
    for group in THREE_PUNISHMENT_GROUPS:
        present = []
        for pn in pillar_keys:
            if pn in branches and branches[pn] in group["indices"]:
                present.append(pn)
        if len(present) >= 2:
            br_names = "".join(_branch_cn(branches[p]) for p in present)
            sub_label = group.get(f"label_{_lang_key(lang)}", group["label_en"])
            interactions.append({
                "type": "three_punishment",
                "type_label": INTERACTION_TYPE_LABELS["three_punishment"].get(lang, ""),
                "pillars": present,
                "branches": br_names,
                "detail_cn": group["cn"] + (""  if len(present) >= 3 else "（部分）"),
                "polarity": "negative",
                "polarity_label": POLARITY_LABELS["negative"].get(lang, ""),
                "description": _desc_punishment(present, group, lang, len(present) >= 3),
                "sub_label": sub_label,
            })

    # --- Stem Combinations ---
    for i in range(len(pillar_keys)):
        for j in range(i + 1, len(pillar_keys)):
            pn_a, pn_b = pillar_keys[i], pillar_keys[j]
            if pn_a not in stems or pn_b not in stems:
                continue
            pair = frozenset({stems[pn_a], stems[pn_b]})
            if pair in STEM_COMBINATIONS:
                info = STEM_COMBINATIONS[pair]
                sa, sb = _stem_cn(stems[pn_a]), _stem_cn(stems[pn_b])
                pa_label = PILLAR_NAMES[pn_a].get(lang, pn_a)
                pb_label = PILLAR_NAMES[pn_b].get(lang, pn_b)
                interactions.append({
                    "type": "stem_combination",
                    "type_label": INTERACTION_TYPE_LABELS["stem_combination"].get(lang, ""),
                    "pillars": [pn_a, pn_b],
                    "branches": f"{sa}{sb}",
                    "detail_cn": info["cn"],
                    "polarity": "positive",
                    "polarity_label": POLARITY_LABELS["positive"].get(lang, ""),
                    "description": _desc_stem_combo(pn_a, pn_b, sa, sb, info, lang),
                })

    pos = sum(1 for i in interactions if i["polarity"] == "positive")
    neg = sum(1 for i in interactions if i["polarity"] == "negative")

    return {
        "interactions": interactions,
        "summary": {
            "positive": pos,
            "negative": neg,
            "total": len(interactions),
        },
    }


# =============== Description builders ===============

def _lang_key(lang: str) -> str:
    return {"zh-TW": "tw", "zh-CN": "cn", "ko": "ko"}.get(lang, "en")


def _make_interaction(itype, polarity, pillars, branches, detail_cn, lang,
                      pa_label, pb_label, extra="", extra_label=""):
    desc = _desc_pair(itype, pa_label, pb_label, branches, extra, extra_label, lang)
    return {
        "type": itype,
        "type_label": INTERACTION_TYPE_LABELS[itype].get(lang, ""),
        "pillars": pillars,
        "branches": branches,
        "detail_cn": detail_cn,
        "polarity": polarity,
        "polarity_label": POLARITY_LABELS[polarity].get(lang, ""),
        "description": desc,
    }


def _desc_pair(itype, pa, pb, branches, extra, extra_label, lang):
    if lang == "zh-TW":
        if itype == "six_combination":
            return f"{pa}與{pb}地支{branches}六合，合化{extra}，主和諧融洽。"
        if itype == "six_clash":
            return f"{pa}與{pb}地支{branches}六沖，主動盪變化，需注意衝突與轉變。"
        if itype == "six_harm":
            return f"{pa}與{pb}地支{branches}六害，暗中有損，留意人際暗流。"
        if itype == "three_punishment":
            return f"{pa}與{pb}地支{branches}構成{extra_label}，主磨練考驗。"
        if itype == "self_punishment":
            return f"{pa}與{pb}地支相同構成自刑，主內心矛盾與自我消耗。"
    elif lang == "zh-CN":
        if itype == "six_combination":
            return f"{pa}与{pb}地支{branches}六合，合化{extra}，主和谐融洽。"
        if itype == "six_clash":
            return f"{pa}与{pb}地支{branches}六冲，主动荡变化，需注意冲突与转变。"
        if itype == "six_harm":
            return f"{pa}与{pb}地支{branches}六害，暗中有损，留意人际暗流。"
        if itype == "three_punishment":
            return f"{pa}与{pb}地支{branches}构成{extra_label}，主磨练考验。"
        if itype == "self_punishment":
            return f"{pa}与{pb}地支相同构成自刑，主内心矛盾与自我消耗。"
    elif lang == "ko":
        if itype == "six_combination":
            return f"{pa}와 {pb} 지지 {branches} 육합, {extra}로 합화, 조화와 화합을 의미합니다."
        if itype == "six_clash":
            return f"{pa}와 {pb} 지지 {branches} 육충, 변동과 충돌에 주의가 필요합니다."
        if itype == "six_harm":
            return f"{pa}와 {pb} 지지 {branches} 육해, 은밀한 손해가 있으니 대인관계에 유의하세요."
        if itype == "three_punishment":
            return f"{pa}와 {pb} 지지 {branches}로 {extra_label} 구성, 시련과 단련을 의미합니다."
        if itype == "self_punishment":
            return f"{pa}와 {pb} 같은 지지로 자형 구성, 내면의 갈등과 자기 소모에 주의하세요."
    # English
    if itype == "six_combination":
        return f"{pa} and {pb} branches ({branches}) form a Six Combination, merging into {extra}. This indicates natural harmony and mutual support."
    if itype == "six_clash":
        return f"{pa} and {pb} branches ({branches}) form a Six Clash. Expect tension, change, and the need for adaptability in this life area."
    if itype == "six_harm":
        return f"{pa} and {pb} branches ({branches}) form a Six Harm. Watch for hidden friction and subtle undermining in related matters."
    if itype == "three_punishment":
        return f"{pa} and {pb} branches ({branches}) form a {extra_label}. This brings karmic tests and growth through adversity."
    if itype == "self_punishment":
        return f"{pa} and {pb} share the same branch ({branches}), forming a Self-Punishment. This suggests inner conflict and self-sabotaging tendencies."
    return ""


def _desc_three_harmony(pillars, info, lang):
    names = {"en": [PILLAR_NAMES[p]["en"] for p in pillars],
             "zh-TW": [PILLAR_NAMES[p]["zh-TW"] for p in pillars],
             "zh-CN": [PILLAR_NAMES[p]["zh-CN"] for p in pillars],
             "ko": [PILLAR_NAMES[p]["ko"] for p in pillars]}
    n = names.get(lang, names["en"])
    result = info["result"]
    if lang == "zh-TW":
        return f"{'、'.join(n)}地支構成三合{result}局，力量強大，主人生中{result}五行能量顯著增強。"
    if lang == "zh-CN":
        return f"{'、'.join(n)}地支构成三合{result}局，力量强大，主人生中{result}五行能量显著增强。"
    if lang == "ko":
        return f"{', '.join(n)} 지지가 삼합 {result}국을 구성, 강력한 힘으로 {result} 오행 에너지가 크게 증강됩니다."
    return f"{', '.join(n)} branches form a Three Harmony {result} frame. This is a powerful configuration that greatly amplifies {result} energy in your life."


def _desc_partial_three_harmony(pillars, info, lang):
    names = {"en": [PILLAR_NAMES[p]["en"] for p in pillars],
             "zh-TW": [PILLAR_NAMES[p]["zh-TW"] for p in pillars],
             "zh-CN": [PILLAR_NAMES[p]["zh-CN"] for p in pillars],
             "ko": [PILLAR_NAMES[p]["ko"] for p in pillars]}
    n = names.get(lang, names["en"])
    result = info["result"]
    if lang == "zh-TW":
        return f"{'、'.join(n)}地支構成三合{result}局的半合，{result}五行能量有一定增強。"
    if lang == "zh-CN":
        return f"{'、'.join(n)}地支构成三合{result}局的半合，{result}五行能量有一定增强。"
    if lang == "ko":
        return f"{', '.join(n)} 지지가 삼합 {result}국의 반합을 구성, {result} 오행 에너지가 어느 정도 증강됩니다."
    return f"{', '.join(n)} branches form a partial Three Harmony toward {result}. The {result} element has moderate additional influence."


def _desc_punishment(pillars, group, lang, is_full):
    names = {"en": [PILLAR_NAMES[p]["en"] for p in pillars],
             "zh-TW": [PILLAR_NAMES[p]["zh-TW"] for p in pillars],
             "zh-CN": [PILLAR_NAMES[p]["zh-CN"] for p in pillars],
             "ko": [PILLAR_NAMES[p]["ko"] for p in pillars]}
    n = names.get(lang, names["en"])
    sub = group.get(f"label_{_lang_key(lang)}", group["label_en"])
    qualifier = "" if is_full else (" (partial)" if lang == "en" else "（部分）" if lang in ("zh-TW", "zh-CN") else " (부분)")
    if lang == "zh-TW":
        return f"{'、'.join(n)}地支構成{sub}{qualifier}，主考驗磨練，需耐心化解。"
    if lang == "zh-CN":
        return f"{'、'.join(n)}地支构成{sub}{qualifier}，主考验磨练，需耐心化解。"
    if lang == "ko":
        return f"{', '.join(n)} 지지가 {sub}{qualifier}를 구성, 시련과 단련을 의미하며 인내심으로 극복해야 합니다."
    return f"{', '.join(n)} branches form a {sub}{qualifier}. This indicates karmic challenges that require patience and conscious effort to navigate."


def _desc_stem_combo(pn_a, pn_b, sa, sb, info, lang):
    pa = PILLAR_NAMES[pn_a].get(lang, pn_a)
    pb = PILLAR_NAMES[pn_b].get(lang, pn_b)
    result = info["result"]
    if lang == "zh-TW":
        return f"{pa}與{pb}天干{sa}{sb}合化{result}，主此兩柱所代表的人生領域互有助益。"
    if lang == "zh-CN":
        return f"{pa}与{pb}天干{sa}{sb}合化{result}，主此两柱所代表的人生领域互有助益。"
    if lang == "ko":
        return f"{pa}와 {pb} 천간 {sa}{sb}가 {result}로 합화, 이 두 주가 나타내는 인생 영역이 서로 도움을 줍니다."
    return f"{pa} and {pb} stems ({sa}{sb}) combine into {result}. The life areas represented by these two pillars support and enhance each other."
