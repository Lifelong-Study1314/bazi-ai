"""
AI Insights Generation using DeepSeek Streaming
"""

import asyncio
import re
from typing import AsyncGenerator
from openai import AsyncOpenAI, AsyncAzureOpenAI
from .prompts import (
    get_analysis_prompt,
    get_system_message,
    get_five_elements_prompt,
    get_ten_gods_prompt,
    get_seasonal_strength_prompt,
    get_annual_forecast_prompt,
    get_age_period_prompt,
    get_age_periods_timeline_prompt,
    get_use_god_prompt,
    get_pillar_interactions_prompt,
)
from config import get_settings
import logging

logger = logging.getLogger(__name__)

SECTION_PROMPTS = {
    "five_elements": get_five_elements_prompt,
    "ten_gods": get_ten_gods_prompt,
    "seasonal_strength": get_seasonal_strength_prompt,
    "use_god": get_use_god_prompt,
    "pillar_interactions": get_pillar_interactions_prompt,
    "annual_forecast": get_annual_forecast_prompt,
    "current_age_period": get_age_period_prompt,
    "age_periods_timeline": get_age_periods_timeline_prompt,
}


def parse_age_periods_timeline_response(raw: str) -> dict[str, str]:
    """
    Parse AI response into {journey_overview: "...", age_X_Y: "content", ...}.
    Expects: JOURNEY OVERVIEW first (~150 words), then ### Age X–Y blocks.
    """
    if not raw or not raw.strip():
        return {}
    out: dict[str, str] = {}
    # Match ### Age X–Y or ### 年齡 X–Y 歲 or ### 年龄 X–Y 岁 or ### 나이 X–Y세
    pattern = re.compile(
        r"###\s*(?:Age|年齡|年龄|나이)\s*(\d+)\s*[–\-]\s*(\d+)(?:\s*歲|\s*岁|\s*세)?",
        re.IGNORECASE,
    )
    matches = list(pattern.finditer(raw))
    if not matches:
        # Fallback: treat whole response as single block
        out["age_periods_timeline"] = raw.strip()
        return out

    # Extract journey_overview: everything before the first ### Age X–Y
    first_match = matches[0]
    overview_block = raw[: first_match.start()].strip()
    if overview_block:
        # Strip redundant header lines (--- JOURNEY OVERVIEW ---, etc.)
        lines = overview_block.split("\n")
        stripped_lines = []
        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue
            # Skip lines that look like format headers
            if re.match(r"^---.*---\s*$", trimmed):
                continue
            # Skip standalone header lines (e.g. "JOURNEY OVERVIEW" or "人生旅程總覽" or "인생 여정 개요")
            if re.match(
                r"^(JOURNEY\s*OVERVIEW|人生旅程總覽|人生旅程总览|인생\s*여정\s*개요)",
                trimmed,
                re.IGNORECASE,
            ) and len(trimmed) < 120:
                continue
            stripped_lines.append(line)
        cleaned = "\n".join(stripped_lines).strip()
        if cleaned:
            out["journey_overview"] = cleaned

    # Extract per-period content
    for i, m in enumerate(matches):
        start_age = m.group(1)
        end_age = m.group(2)
        key = f"age_{start_age}_{end_age}"
        start_pos = m.end()
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        block = raw[start_pos:end_pos].strip()
        out[key] = block
    return out


class InsightGenerator:
    """Generate BAZI insights using DeepSeek API with streaming"""
    
    def __init__(self):
        settings = get_settings()
        self.provider = (settings.ai_provider or "deepseek").lower().strip()
        if self.provider == "azure":
            self.client = AsyncAzureOpenAI(
                api_key=settings.azure_api_key,
                azure_endpoint=settings.azure_endpoint,
                api_version=settings.azure_api_version,
                timeout=float(settings.api_timeout),
            )
            self.model = settings.azure_deployment
            self.temperature = settings.openai_temperature
        else:
            self.client = AsyncOpenAI(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
                timeout=float(settings.api_timeout),
            )
            self.model = settings.deepseek_model
            self.temperature = settings.deepseek_temperature
        self.max_tokens = settings.max_tokens

    def _build_completion_params(self, system_message: str, user_prompt: str) -> dict:
        params = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt},
            ],
            "stream": True,
        }
        # OpenAI client (OpenAI + Azure) uses max_tokens for chat.completions.create
        params["max_tokens"] = self.max_tokens
        if self.provider != "azure":
            params["temperature"] = self.temperature
        return params
    
    async def generate_insights_stream(
        self, 
        bazi_data: dict, 
        language: str = "en"
    ) -> AsyncGenerator[str, None]:
        """Generate BAZI insights with streaming response"""
        
        user_prompt = get_analysis_prompt(bazi_data, language)
        system_message = get_system_message(language)
        
        try:
            stream = await self.client.chat.completions.create(
                **self._build_completion_params(system_message, user_prompt)
            )
            
            async for chunk in stream:
                try:
                    content = chunk.choices[0].delta.content
                    
                    if content and len(content) > 0:
                        yield content
                        
                except (AttributeError, IndexError, TypeError):
                    continue
                except Exception as e:
                    logger.error(f"Chunk error: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            yield f"\n\nError: {str(e)}"


async def generate_insights_generator(
    bazi_data: dict, 
    language: str = "en"
) -> AsyncGenerator[str, None]:
    """Factory function to create insight generator"""
    
    generator = InsightGenerator()
    async for chunk in generator.generate_insights_stream(bazi_data, language):
        yield chunk


async def generate_insights_non_stream(
    bazi_data: dict, 
    language: str = "en"
) -> str:
    """Generate full insights without streaming (for SSE fallback)"""
    full_text = ""
    async for chunk in generate_insights_generator(bazi_data, language):
        full_text += chunk
    return full_text


async def generate_section_non_stream(
    bazi_data: dict,
    section_key: str,
    language: str = "en",
) -> str | dict[str, str] | None:
    """Generate a single section (non-streaming). Returns full text, parsed dict, or None on error."""
    prompt_fn = SECTION_PROMPTS.get(section_key)
    if not prompt_fn:
        logger.error(f"Unknown section key: {section_key}")
        return None
    system_msg, user_prompt = prompt_fn(bazi_data, language)
    gen = InsightGenerator()
    try:
        stream = await gen.client.chat.completions.create(
            **gen._build_completion_params(system_msg, user_prompt)
        )
        full_text = ""
        async for chunk in stream:
            try:
                content = chunk.choices[0].delta.content
                if content and len(content) > 0:
                    full_text += content
            except (AttributeError, IndexError, TypeError):
                continue
        raw = full_text.strip() if full_text else None
        if raw is None:
            return None
        if section_key == "age_periods_timeline":
            parsed = parse_age_periods_timeline_response(raw)
            return parsed if parsed else {"age_periods_timeline": raw}
        return raw
    except Exception as e:
        logger.error(f"Section {section_key} error: {e}", exc_info=True)
        return None


async def generate_sections_parallel(
    bazi_data: dict,
    language: str = "en",
    stagger_ms: int = 150,
) -> dict[str, str | None]:
    """Run 5 section calls in parallel with optional stagger. Returns {key: content or None}."""
    out: dict[str, str | None] = {}
    async for key, content in generate_sections_as_completed(bazi_data, language, stagger_ms):
        out[key] = content
    return out


async def generate_sections_as_completed(
    bazi_data: dict,
    language: str = "en",
    stagger_ms: int = 150,
):
    """Async generator yielding (key, content) as each section completes. For SSE streaming."""
    keys = list(SECTION_PROMPTS.keys())

    async def _gen_with_stagger(key: str, delay: float) -> tuple[str, str | None]:
        await asyncio.sleep(delay)
        try:
            content = await asyncio.wait_for(
                generate_section_non_stream(bazi_data, key, language),
                timeout=90,  # 90-second timeout per section
            )
        except asyncio.TimeoutError:
            logger.warning(f"Section {key} timed out (attempt 1)")
            content = None
        if content is None:
            try:
                content = await asyncio.wait_for(
                    generate_section_non_stream(bazi_data, key, language),
                    timeout=90,
                )
            except asyncio.TimeoutError:
                logger.warning(f"Section {key} timed out (attempt 2)")
                content = None
        return (key, content)

    tasks = [asyncio.create_task(_gen_with_stagger(k, i * stagger_ms / 1000.0)) for i, k in enumerate(keys)]
    try:
        for coro in asyncio.as_completed(tasks):
            try:
                key, content = await coro
                yield (key, content)
            except Exception as e:
                logger.error(f"Section task error: {e}", exc_info=True)
    finally:
        for t in tasks:
            if not t.done():
                t.cancel()