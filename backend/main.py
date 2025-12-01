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
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from models import AnalyzeRequest  # ← ADD THIS LINE
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
    allow_origins=[
        "https://yellow-mud-0496da91e.3.azurestaticapps.net",  # ← Your frontend URL
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://20.184.149.72:8000"
    ],
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
    language: Optional[str] = "en"  # "en", "zh-TW", "zh-CN"


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
        logging.info(f"Analyze request: {request.birth_date}, {request.birth_hour}")
        
        # Calculate BAZI chart
        bazi_data = calculate_bazi(  # ✅ Your existing function
            request.birth_date,
            request.birth_hour,
            request.gender
        )
        
        logging.info(f"BAZI calculation successful")
        logging.info(f"Request language parameter: {request.language}")
        logging.info(f"Request data: birth_date={request.birth_date}, hour={request.birth_hour}, gender={request.gender}, language={request.language}")
        
        # Create generator
        async def stream_insights_gen():
            try:
                # First send BAZI chart as proper JSON
                chart_message = {
                    'type': 'bazi_chart',
                    'data': bazi_data
                }
                logging.debug(f"Sending BAZI chart: {json.dumps(chart_message)[:100]}...")
                yield f"data: {json.dumps(chart_message)}\n\n"
                
                # Then stream insights
                chunk_count = 0
                async for chunk in generate_insights_generator(bazi_data, request.language):
                    chunk_count += 1
                    insight_message = {
                        'type': 'insight',
                        'text': chunk
                    }
                    logging.debug(f"Sending insight chunk {chunk_count}: {len(chunk)} chars")
                    yield f"data: {json.dumps(insight_message)}\n\n"
                
                logging.info(f"Insights streaming complete: {chunk_count} chunks")
                
                # Send completion message
                complete_message = {'type': 'complete'}
                yield f"data: {json.dumps(complete_message)}\n\n"
                
            except Exception as e:
                logging.error(f"Stream error: {e}", exc_info=True)
                error_message = {
                    'type': 'error',
                    'message': str(e)
                }
                yield f"data: {json.dumps(error_message)}\n\n"
        
        return StreamingResponse(
            stream_insights_gen(),
            media_type="text/event-stream",
        )
        
    except Exception as e:
        logging.error(f"Analyze error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/bazi-chart", tags=["Analysis"])
async def get_bazi_chart(request: BaziAnalysisRequest) -> BaziChartResponse:
    """
    Get BAZI chart calculation without AI insights
    
    Useful for debugging or when you only need the chart
    
    Returns:
        BaziChartResponse with four pillars and element analysis
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


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
