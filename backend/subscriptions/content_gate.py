"""
Content gating logic.
Truncates AI-generated text for free-tier users so the frontend
can show a teaser + blur overlay.

Handles both str and dict section content (e.g. age_periods_timeline
returns a parsed dict).
"""

from .feature_flags import get_features


def _extract_text(content) -> str | None:
    """Normalise section content to a plain string for truncation."""
    if isinstance(content, str):
        return content
    if isinstance(content, dict):
        # age_periods_timeline returns {"overview": ..., "periods": [...]}
        # or {"age_periods_timeline": raw_text}
        if "age_periods_timeline" in content:
            return content["age_periods_timeline"]
        if "overview" in content:
            return content["overview"]
        # Fallback: join all string values
        parts = [v for v in content.values() if isinstance(v, str)]
        return "\n".join(parts) if parts else None
    return None


def gate_content(content, tier: str) -> dict:
    """
    Wrap section content with gating metadata.

    `content` may be a str or a dict (some sections return parsed dicts).

    Returns:
        {
            "text": <original content (str or dict)>,
            "is_locked": bool,
        }
    """
    if not content:
        return {"text": content if content else "", "is_locked": False}

    features = get_features(tier)
    preview_lines = features.get("ai_preview_lines")

    if preview_lines is None:
        # Premium — return everything
        return {"text": content, "is_locked": False}

    # Free — truncate to first N non-empty lines
    text = _extract_text(content)
    if text is None:
        return {"text": content, "is_locked": False}

    lines = text.split("\n")
    non_empty = []
    preview_parts = []
    for line in lines:
        preview_parts.append(line)
        if line.strip():
            non_empty.append(line)
        if len(non_empty) >= preview_lines:
            break

    return {
        "text": "\n".join(preview_parts),
        "is_locked": True,
    }


# Sections that are always fully visible, even for free users
FREE_SECTIONS = {"five_elements"}


def gate_streaming_section(section_key: str, content, tier: str) -> dict:
    """
    Gate a single streamed section event.
    Returns a dict suitable for the SSE section message.
    Sections listed in FREE_SECTIONS are never gated.
    """
    if section_key in FREE_SECTIONS:
        return {
            "type": "section",
            "key": section_key,
            "content": content,
            "is_locked": False,
        }
    gated = gate_content(content, tier)
    return {
        "type": "section",
        "key": section_key,
        "content": gated["text"],
        "is_locked": gated["is_locked"],
    }
