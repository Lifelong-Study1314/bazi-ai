"""
AI Insights Generation using DeepSeek Streaming
"""

from typing import AsyncGenerator
from openai import AsyncOpenAI
from .prompts import get_analysis_prompt, get_system_message
from config import get_settings
import logging

logger = logging.getLogger(__name__)


class InsightGenerator:
    """Generate BAZI insights using DeepSeek API with streaming"""
    
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url
        )
        self.model = settings.deepseek_model
        self.temperature = settings.deepseek_temperature
        self.max_tokens = settings.max_tokens
    
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
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True
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