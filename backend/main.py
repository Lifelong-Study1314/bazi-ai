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
from typing import Optional
from bazi_engine.calculator import calculate_bazi
from ai_insights.generator import generate_insights_generator
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
            request.gender
        )
        
        logger.info(f"✅ BAZI calculation successful")
        
        # Get language, default to "en"
        language = request.language if request.language else "en"
        logger.info(f"🌍 Using language: {language}")
        
        # Create generator
        async def stream_insights_gen():
            try:
                # First send BAZI chart as proper JSON
                chart_message = {
                    'type': 'bazi_chart',
                    'data': bazi_data
                }
                logger.debug(f"Sending BAZI chart...")
                yield f"data: {json.dumps(chart_message)}\n\n"
                
                # Then stream insights
                logger.info(f"🚀 Starting insights generation with language={language}")
                chunk_count = 0
                
                async for chunk in generate_insights_generator(bazi_data, language):
                    chunk_count += 1
                    insight_message = {
                        'type': 'insight',
                        'text': chunk
                    }
                    
                    if chunk_count <= 3:
                        logger.info(f"📨 Chunk {chunk_count}: {len(chunk)} chars")
                        if "사주" in chunk or "금" in chunk:
                            logger.info(f"  ✨ Korean detected in chunk!")
                    
                    yield f"data: {json.dumps(insight_message)}\n\n"
                
                logger.info(f"✅ Insights streaming complete: {chunk_count} chunks")
                
                # Send completion message
                complete_message = {'type': 'complete'}
                yield f"data: {json.dumps(complete_message)}\n\n"
                
            except Exception as e:
                logger.error(f"❌ Stream error: {e}", exc_info=True)
                error_message = {
                    'type': 'error',
                    'message': str(e)
                }
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


@app.post("/api/bazi-chart", tags=["Analysis"])
async def get_bazi_chart(request: BaziAnalysisRequest) -> BaziChartResponse:
    """
    Get BAZI chart calculation without AI insights
    """
    
    try:
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender
        )
        
        return BaziChartResponse(
            success=bazi_data.get("success", False),
            four_pillars=bazi_data.get("four_pillars"),
            day_master=bazi_data.get("day_master"),
            elements=bazi_data.get("elements"),
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