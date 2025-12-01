"""
Five Elements (五行) logic and interactions

Implements element generation/destruction cycles and balance calculations
"""

from typing import Dict, List
from enum import Enum


class Element(Enum):
    """Five Elements"""
    WOOD = "Wood"
    FIRE = "Fire"
    EARTH = "Earth"
    METAL = "Metal"
    WATER = "Water"


# Element generation cycle: Wood → Fire → Earth → Metal → Water → Wood
GENERATION_CYCLE = {
    Element.WOOD: Element.FIRE,      # Wood fuels fire
    Element.FIRE: Element.EARTH,     # Fire creates earth (ash)
    Element.EARTH: Element.METAL,    # Earth bears metal
    Element.METAL: Element.WATER,    # Metal collects water
    Element.WATER: Element.WOOD,     # Water nourishes wood
}

# Element destruction cycle: Wood breaks Earth, Earth dams Water, etc.
DESTRUCTION_CYCLE = {
    Element.WOOD: Element.EARTH,     # Wood breaks earth
    Element.EARTH: Element.WATER,    # Earth dams water
    Element.WATER: Element.FIRE,     # Water extinguishes fire
    Element.FIRE: Element.METAL,     # Fire melts metal
    Element.METAL: Element.WOOD,     # Metal chops wood
}

# Element colors for visualization
ELEMENT_COLORS = {
    Element.WOOD: "#4CAF50",    # Green
    Element.FIRE: "#FF5722",    # Red-Orange
    Element.EARTH: "#F4B183",   # Light Brown
    Element.METAL: "#C0C0C0",   # Silver
    Element.WATER: "#2196F3",   # Blue
}

# Element properties for interpretation
ELEMENT_PROPERTIES = {
    Element.WOOD: {
        "direction": "East",
        "season": "Spring",
        "color": "Green",
        "emotion": "Anger/Assertiveness",
        "organ": "Liver",
        "trait": "Growth, flexibility, creativity",
    },
    Element.FIRE: {
        "direction": "South",
        "season": "Summer",
        "color": "Red",
        "emotion": "Joy/Passion",
        "organ": "Heart",
        "trait": "Passion, transformation, visibility",
    },
    Element.EARTH: {
        "direction": "Center",
        "season": "Late Summer",
        "color": "Yellow",
        "emotion": "Worry/Thoughtfulness",
        "organ": "Spleen",
        "trait": "Stability, grounding, support",
    },
    Element.METAL: {
        "direction": "West",
        "season": "Autumn",
        "color": "Silver/White",
        "emotion": "Grief/Discipline",
        "organ": "Lungs",
        "trait": "Structure, precision, wealth",
    },
    Element.WATER: {
        "direction": "North",
        "season": "Winter",
        "color": "Black/Blue",
        "emotion": "Fear/Intuition",
        "organ": "Kidney",
        "trait": "Adaptability, flow, intelligence",
    },
}


def count_elements(elements_list: List[str]) -> Dict[str, int]:
    """
    Count occurrences of each element in a list
    
    Args:
        elements_list: List of element strings
        
    Returns:
        Dictionary with element counts
        
    Example:
        count_elements(['Wood', 'Fire', 'Wood', 'Water'])
        -> {'Wood': 2, 'Fire': 1, 'Water': 1, 'Earth': 0, 'Metal': 0}
    """
    counts = {elem.value: 0 for elem in Element}
    
    for elem_str in elements_list:
        for elem in Element:
            if elem.value == elem_str:
                counts[elem_str] += 1
                break
    
    return counts


def get_element_balance(element_counts: Dict[str, int]) -> Dict:
    """
    Analyze element balance and determine deficiencies/excesses
    
    Returns:
        {
            "total": int,
            "balance": str,  # "weak", "neutral", "strong"
            "deficient": List[str],
            "abundant": List[str],
            "recommendations": str
        }
    """
    total = sum(element_counts.values())
    
    if total == 0:
        return {
            "total": 0,
            "balance": "insufficient_data",
            "deficient": [],
            "abundant": [],
            "recommendations": "Not enough elements to analyze"
        }
    
    # Find deficient and abundant elements
    avg = total / 5  # Average should be 1.6 per element (8 chars / 5 elements)
    
    deficient = [elem for elem, count in element_counts.items() if count < avg * 0.7]
    abundant = [elem for elem, count in element_counts.items() if count > avg * 1.3]
    
    # Determine balance
    if len(deficient) >= 2:
        balance = "weak"
    elif len(abundant) >= 2:
        balance = "strong"
    else:
        balance = "neutral"
    
    # Generate recommendations
    if deficient:
        recommendations = f"Your chart is missing or weak in: {', '.join(deficient)}. " \
                         f"Consider incorporating these elements in your life (colors, activities, timing)."
    elif abundant:
        recommendations = f"Your chart has excess: {', '.join(abundant)}. " \
                         f"Try to balance with other elements."
    else:
        recommendations = "Your chart has a balanced distribution of elements. Lucky you!"
    
    return {
        "total": total,
        "balance": balance,
        "deficient": deficient,
        "abundant": abundant,
        "recommendations": recommendations
    }


def get_element_relationships(elem1: str, elem2: str) -> str:
    """
    Get relationship between two elements
    
    Returns: "generates", "destroys", "same", "none"
    """
    elem1_obj = None
    elem2_obj = None
    
    for elem in Element:
        if elem.value == elem1:
            elem1_obj = elem
        if elem.value == elem2:
            elem2_obj = elem
    
    if elem1_obj is None or elem2_obj is None:
        return "none"
    
    if elem1_obj == elem2_obj:
        return "same"
    
    if GENERATION_CYCLE.get(elem1_obj) == elem2_obj:
        return "generates"
    
    if DESTRUCTION_CYCLE.get(elem1_obj) == elem2_obj:
        return "destroys"
    
    return "none"


def get_favorable_elements(deficient: List[str], abundant: List[str]) -> List[str]:
    """
    Recommend favorable elements to support balance
    
    If lacking elements, recommend elements that generate them (support)
    If excess elements, recommend elements that destroy them (balance)
    """
    favorable = []
    
    # For deficient elements, add elements that generate them
    for deficient_elem in deficient:
        for generator_elem in Element:
            if GENERATION_CYCLE.get(generator_elem) and \
               GENERATION_CYCLE.get(generator_elem).value == deficient_elem:
                favorable.append(generator_elem.value)
    
    # For abundant elements, add elements that destroy them
    for abundant_elem in abundant:
        for destroyer_elem in Element:
            if DESTRUCTION_CYCLE.get(destroyer_elem) and \
               DESTRUCTION_CYCLE.get(destroyer_elem).value == abundant_elem:
                favorable.append(destroyer_elem.value)
    
    return list(set(favorable))  # Remove duplicates
