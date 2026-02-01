"""
FastAPI Backend for BAZI AI Analysis

Main entry point for the application
Routes:
- POST /api/analyze - Analyze BAZI chart and return insights (streaming)
- GET /api/health - Health check
"""

import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from models import AnalyzeRequest
from pydantic import BaseModel
from typing import Optional, List, Dict
from bazi_engine.calculator import calculate_bazi
from ai_insights.generator import (
    generate_insights_generator,
    generate_insights_non_stream,
    generate_sections_as_completed,
    generate_sections_parallel,
)
from config import get_settings


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Get settings
settings = get_settings()


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="BAZI AI Analysis - AI-powered Chinese metaphysics analysis",
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== MODELS ====================

class BaziAnalysisRequest(BaseModel):
    """Request body for BAZI analysis"""
    birth_date: str  # Format: "YYYY-MM-DD"
    birth_hour: int  # 0-23
    gender: str      # "male" or "female"
    language: Optional[str] = "en"  # "en", "zh-TW", "zh-CN", "ko"


class BaziChartResponse(BaseModel):
    """Response with BAZI chart calculation"""
    success: bool
    four_pillars: Optional[dict] = None
    day_master: Optional[dict] = None
    elements: Optional[dict] = None
    age_periods: Optional[List[Dict]] = None
    strongest_ten_god: Optional[dict] = None
    annual_luck: Optional[dict] = None
    seasonal_strength: Optional[dict] = None
    deities: Optional[List[Dict]] = None
    error: Optional[str] = None


# ==================== ROUTES ====================

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version
    }


@app.post("/api/analyze")
async def stream_insights(request: AnalyzeRequest):
    """Stream BAZI insights"""
    try:
        # CRITICAL LOGGING
        logger.info("=" * 60)
        logger.info("🔵 INCOMING REQUEST")
        logger.info("=" * 60)
        logger.info(f"birth_date: {request.birth_date}")
        logger.info(f"birth_hour: {request.birth_hour}")
        logger.info(f"gender: {request.gender}")
        logger.info(f"language: {request.language}")
        logger.info(f"language type: {type(request.language)}")
        logger.info(f"language is None: {request.language is None}")
        logger.info(f"language == 'ko': {request.language == 'ko'}")
        logger.info("=" * 60)
        
        # Calculate BAZI chart
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
        )
        
        logger.info(f"✅ BAZI calculation successful")
        
        # Get language, default to "en"
        language = request.language if request.language else "en"
        logger.info(f"🌍 Using language: {language}")
        
        # Create generator
        async def stream_insights_gen():
            try:
                # 1. Send BAZI chart
                chart_message = {'type': 'bazi_chart', 'data': bazi_data}
                logger.debug("Sending BAZI chart...")
                yield f"data: {json.dumps(chart_message)}\n\n"

                # 2. Fire 5 parallel section calls; send each as it completes
                logger.info("🚀 Generating 5 AI sections in parallel...")
                async for section_key, section_content in generate_sections_as_completed(
                    bazi_data, language, stagger_ms=300
                ):
                    section_message = {
                        'type': 'section',
                        'key': section_key,
                        'content': section_content,
                    }
                    if section_content is None:
                        section_message['error'] = 'Generation failed'
                    yield f"data: {json.dumps(section_message)}\n\n"
                    logger.debug(f"Section {section_key} sent")

                # 3. Stream comprehensive Destiny Analysis
                logger.info("🚀 Starting Destiny Analysis stream...")
                chunk_count = 0
                async for chunk in generate_insights_generator(bazi_data, language):
                    chunk_count += 1
                    insight_message = {'type': 'insight', 'text': chunk}
                    yield f"data: {json.dumps(insight_message)}\n\n"
                logger.info(f"✅ Insights streaming complete: {chunk_count} chunks")

                # 4. Send completion
                complete_message = {'type': 'complete'}
                yield f"data: {json.dumps(complete_message)}\n\n"

            except Exception as e:
                logger.error(f"❌ Stream error: {e}", exc_info=True)
                error_message = {'type': 'error', 'message': str(e)}
                yield f"data: {json.dumps(error_message)}\n\n"
        
        return StreamingResponse(
            stream_insights_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Language": language,  # Send language in response header
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Analyze error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-sync", tags=["Analysis"])
async def analyze_sync(request: BaziAnalysisRequest):
    """Non-streaming BAZI analysis (SSE fallback)"""
    try:
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
        )
        language = request.language if request.language else "en"
        sections = await generate_sections_parallel(bazi_data, language)
        insights = await generate_insights_non_stream(bazi_data, language)
        return {
            "bazi_chart": bazi_data,
            "sections": sections,
            "insights": insights,
        }
    except Exception as e:
        logger.error(f"❌ Analyze-sync error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bazi-chart", tags=["Analysis"])
async def get_bazi_chart(request: BaziAnalysisRequest) -> BaziChartResponse:
    """
    Get BAZI chart calculation without AI insights
    """
    
    try:
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
        )
        
        return BaziChartResponse(
            success=bazi_data.get("success", False),
            four_pillars=bazi_data.get("four_pillars"),
            day_master=bazi_data.get("day_master"),
            elements=bazi_data.get("elements"),
            age_periods=bazi_data.get("age_periods"),
            strongest_ten_god=bazi_data.get("strongest_ten_god"),
            annual_luck=bazi_data.get("annual_luck"),
            seasonal_strength=bazi_data.get("seasonal_strength"),
            deities=bazi_data.get("deities"),
            error=bazi_data.get("error")
        )
    
    except Exception as e:
        return BaziChartResponse(
            success=False,
            error=str(e)
        )


# ==================== ROOT ====================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to BAZI AI Analysis API",
        "version": settings.version,
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "analyze": "/api/analyze",
            "chart": "/api/bazi-chart",
        }
    }


@app.options("/{full_path:path}")
async def preflight(full_path: str):
    """Handle CORS preflight requests"""
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )