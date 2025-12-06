"""
AI Insights Generation using DeepSeek Streaming

Generates comprehensive BAZI analysis using DeepSeek API with streaming
Compatible with OpenAI SDK
"""

from typing import AsyncGenerator
from openai import AsyncOpenAI
from .prompts import get_analysis_prompt, get_system_message
from .translator import translate_to_korean_google, simple_translate_to_korean
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
        
        # For Korean, we ALWAYS request in English then translate
        request_language = "en" if language == "ko" else language
        
        logger.info(f"DEBUG: Generating insights with request_language={request_language}, output_language={language}")
        user_prompt = get_analysis_prompt(bazi_data, request_language)
        system_message = get_system_message(request_language)
        
        logger.info(f"Starting insights generation")
        
        chunk_count = 0
        content_count = 0
        
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
            
            logger.info(f"Stream created, starting iteration")
            
            async for chunk in stream:
                chunk_count += 1
                
                try:
                    content = chunk.choices[0].delta.content
                    
                    if chunk_count <= 5:
                        logger.info(f"Chunk {chunk_count}: content = {repr(content[:50] if content else None)}")
                    
                    # Only yield if not None and not empty string
                    if content:
                        content_count += 1
                        
                        # For Korean, translate; otherwise yield directly
                        if language == "ko":
                            # Use simple translation for speed (async API translation too slow for streaming)
                            translated_chunk = simple_translate_to_korean(content)
                            logger.debug(f"Yielding translated chunk {chunk_count}: {len(translated_chunk)} chars")
                            yield translated_chunk
                        else:
                            logger.debug(f"Yielding chunk {chunk_count}: {len(content)} chars")
                            yield content
                        
                except (AttributeError, IndexError, TypeError) as e:
                    # Log only first error to avoid spam
                    if chunk_count == 1:
                        logger.error(f"Error accessing content: {e}", exc_info=True)
                    continue
                except Exception as e:
                    logger.error(f"Unexpected error on chunk {chunk_count}: {e}", exc_info=True)
                    continue
            
            logger.info(f"Stream complete: {chunk_count} total chunks, {content_count} with content")
            
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