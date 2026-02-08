"""
FastAPI Backend for BAZI AI Analysis

Main entry point for the application
Routes:
- POST /api/analyze - Analyze BAZI chart and return insights (streaming)
- GET /api/health - Health check
"""

import json
import logging
from datetime import date as date_type, datetime as dt_type
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from models import AnalyzeRequest
from pydantic import BaseModel
from typing import Optional, List, Dict
from bazi_engine.calculator import calculate_bazi
from bazi_engine.compatibility import analyze_compatibility
from bazi_engine.daily_forecast import calculate_daily_forecast
from ai_insights.generator import (
    generate_insights_generator,
    generate_insights_non_stream,
    generate_sections_as_completed,
    generate_sections_parallel,
)
from config import get_settings
from auth.router import router as auth_router
from auth.dependencies import set_auth_provider, get_optional_user, get_current_user
from auth.base import User, SubscriptionTier
from subscriptions.router import router as subscriptions_router
from subscriptions.content_gate import gate_content, gate_streaming_section


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


# Configure CORS — restrict to frontend in production; allow localhost for dev
_frontend_origin = (settings.frontend_url or "").rstrip("/")
_cors_origins = [_frontend_origin] if _frontend_origin else []
if settings.debug or "localhost" in (settings.frontend_url or ""):
    _cors_origins.extend(["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"])
_cors_origins = list(dict.fromkeys(o for o in _cors_origins if o))
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins if _cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== AUTH SETUP ====================

# Include routers
app.include_router(auth_router)
app.include_router(subscriptions_router)


@app.on_event("startup")
async def startup_event():
    provider_name = settings.auth_provider
    if provider_name == "mock":
        from auth.mock_provider import MockAuthProvider
        provider = MockAuthProvider()
    elif provider_name == "supabase":
        from auth.supabase_provider import SupabaseAuthProvider
        provider = SupabaseAuthProvider(
            url=settings.supabase_url,
            key=settings.supabase_service_key,
        )
    else:
        raise ValueError(f"Unknown auth provider: {provider_name}")
    await provider.startup()
    set_auth_provider(provider)
    logger.info(f"Auth provider initialised: {provider_name}")

    # Seed a premium admin account only for mock provider (local dev)
    if provider_name == "mock":
        ADMIN_EMAIL = "admin@bazi.ai"
        ADMIN_PASSWORD = "admin123"
        try:
            await provider.signup(ADMIN_EMAIL, ADMIN_PASSWORD, name="Admin")
            user = await provider.login(ADMIN_EMAIL, ADMIN_PASSWORD)
            await provider.update_user_tier(user.id, "premium")
            logger.info(f"Seeded premium admin account: {ADMIN_EMAIL}")
        except ValueError:
            try:
                user = await provider.login(ADMIN_EMAIL, ADMIN_PASSWORD)
                if user.tier.value != "premium":
                    await provider.update_user_tier(user.id, "premium")
                    logger.info(f"Upgraded existing admin to premium: {ADMIN_EMAIL}")
                else:
                    logger.info(f"Premium admin account already exists: {ADMIN_EMAIL}")
            except ValueError:
                logger.warning("Admin account exists but password may have changed")

    # Production safety: reject default JWT secret when using Supabase
    if provider_name == "supabase" and (
        not settings.jwt_secret or settings.jwt_secret == "bazi-dev-secret-change-in-production"
    ):
        logger.error(
            "SECURITY: JWT_SECRET must be set to a strong random value in production. "
            "Do not use the default. Set JWT_SECRET in Render environment variables."
        )
        raise ValueError("JWT_SECRET must be changed for production (Supabase auth)")


# ==================== VALIDATION ====================

def validate_birth_input(
    birth_date: str,
    birth_hour: int,
    gender: str,
    calendar_type: str = "solar",
):
    """
    Validate common birth input fields.  Raises HTTPException(400) with a
    human-readable message on the first error found.  This is called *before*
    the BAZI engine so that bad data never reaches the calculator.
    """
    # --- birth_date format ---
    try:
        parsed = dt_type.strptime(birth_date, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid birth date format: '{birth_date}'. Expected YYYY-MM-DD.",
        )

    # --- year range (1900-2100) ---
    if parsed.year < 1900 or parsed.year > 2100:
        raise HTTPException(
            status_code=400,
            detail=f"Birth year must be between 1900 and 2100. Got {parsed.year}.",
        )

    # --- no future dates (solar only; lunar dates are pre-conversion) ---
    if calendar_type == "solar" and parsed > date_type.today():
        raise HTTPException(
            status_code=400,
            detail="Birth date cannot be in the future.",
        )

    # --- birth_hour ---
    if birth_hour is None or not (0 <= birth_hour <= 23):
        raise HTTPException(
            status_code=400,
            detail=f"Birth hour must be between 0 and 23. Got {birth_hour}.",
        )

    # --- gender ---
    if gender not in ("male", "female"):
        raise HTTPException(
            status_code=400,
            detail=f"Gender must be 'male' or 'female'. Got '{gender}'.",
        )

    # --- calendar_type ---
    if calendar_type not in ("solar", "lunar"):
        raise HTTPException(
            status_code=400,
            detail=f"Calendar type must be 'solar' or 'lunar'. Got '{calendar_type}'.",
        )


# ==================== MODELS ====================

class BaziAnalysisRequest(BaseModel):
    """Request body for BAZI analysis"""
    birth_date: str  # Format: "YYYY-MM-DD"
    birth_hour: int  # 0-23
    gender: str      # "male" or "female"
    language: Optional[str] = "en"  # "en", "zh-TW", "zh-CN", "ko"
    calendar_type: Optional[str] = "solar"  # "solar" or "lunar"
    is_leap_month: Optional[bool] = False  # Only relevant when calendar_type="lunar"


class PersonInput(BaseModel):
    """Input for one person in compatibility analysis"""
    birth_date: str  # "YYYY-MM-DD"
    birth_hour: int  # 0-23
    gender: str      # "male" or "female"
    calendar_type: Optional[str] = "solar"
    is_leap_month: Optional[bool] = False


class CompatibilityRequest(BaseModel):
    """Request body for compatibility analysis"""
    person_a: PersonInput
    person_b: PersonInput
    language: Optional[str] = "en"


class DailyForecastRequest(BaseModel):
    """Request body for daily forecast.
    Birth fields are optional — if omitted, the endpoint falls back to the
    authenticated user's saved profile data."""
    birth_date: Optional[str] = None     # "YYYY-MM-DD"
    birth_hour: Optional[int] = None     # 0-23
    gender: Optional[str] = None         # "male" or "female"
    language: Optional[str] = "en"
    calendar_type: Optional[str] = "solar"
    is_leap_month: Optional[bool] = False
    target_date: Optional[str] = None    # "YYYY-MM-DD", defaults to today


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
    use_god: Optional[dict] = None
    pillar_interactions: Optional[dict] = None
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
async def stream_insights(request: AnalyzeRequest, http_request: Request):
    """Stream BAZI insights (with content gating for free users)"""
    # Resolve user (anonymous = free tier)
    user = await get_optional_user(http_request)
    tier = user.tier.value if user else "free"

    # Rate limiting
    from subscriptions.rate_limiter import rate_limiter
    rate_key = user.id if user else (http_request.client.host if http_request.client else "unknown")
    if not rate_limiter.check(rate_key, tier):
        usage = rate_limiter.get_usage(rate_key, tier)
        return JSONResponse(status_code=429, content={
            "error": "rate_limited",
            "used": usage["used"],
            "limit": usage["limit"],
            "remaining": 0,
        })
    rate_limiter.increment(rate_key)

    try:
        # Validate inputs before any calculation
        validate_birth_input(
            request.birth_date, request.birth_hour, request.gender,
            calendar_type=request.calendar_type or "solar",
        )

        logger.info("=" * 60)
        logger.info("INCOMING REQUEST")
        logger.info("=" * 60)
        logger.info(f"birth_date: {request.birth_date}")
        logger.info(f"birth_hour: {request.birth_hour}")
        logger.info(f"gender: {request.gender}")
        logger.info(f"language: {request.language}")
        logger.info(f"user_tier: {tier}")
        logger.info("=" * 60)
        
        # Calculate BAZI chart
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
            calendar_type=request.calendar_type or "solar",
            is_leap_month=request.is_leap_month or False,
        )
        
        logger.info("BAZI calculation successful")

        # Auto-save birth data to user profile (fire-and-forget)
        if user:
            try:
                from auth.dependencies import get_auth_provider
                provider = get_auth_provider()
                if provider:
                    import asyncio
                    asyncio.ensure_future(provider.update_birth_data(
                        user_id=user.id,
                        birth_date=request.birth_date,
                        birth_hour=request.birth_hour,
                        gender=request.gender,
                        calendar_type=request.calendar_type or "solar",
                        is_leap_month=request.is_leap_month or False,
                    ))
            except Exception as e:
                logger.warning(f"Failed to auto-save birth data: {e}")
        
        # Get language, default to "en"
        language = request.language if request.language else "en"
        logger.info(f"Using language: {language}")
        
        # Create generator
        async def stream_insights_gen():
            try:
                # 1. Send BAZI chart (always full — chart data is free)
                chart_message = {'type': 'bazi_chart', 'data': bazi_data}
                yield f"data: {json.dumps(chart_message)}\n\n"

                # 2. Fire parallel section calls; gate each before sending
                logger.info("Generating AI sections in parallel...")
                async for section_key, section_content in generate_sections_as_completed(
                    bazi_data, language, stagger_ms=300
                ):
                    try:
                        if section_content is None:
                            section_message = {
                                'type': 'section',
                                'key': section_key,
                                'content': None,
                                'is_locked': False,
                                'error': 'Generation failed',
                            }
                        else:
                            section_message = gate_streaming_section(section_key, section_content, tier)
                    except Exception as gate_err:
                        logger.error(f"Gating error for {section_key}: {gate_err}", exc_info=True)
                        section_message = {
                            'type': 'section',
                            'key': section_key,
                            'content': section_content if isinstance(section_content, (str, dict)) else str(section_content),
                            'is_locked': False,
                            'error': 'Gating failed',
                        }
                    yield f"data: {json.dumps(section_message)}\n\n"

                # 3. Stream comprehensive Destiny Analysis (gated)
                logger.info("Starting Destiny Analysis stream...")
                chunk_count = 0
                if tier == "premium":
                    async for chunk in generate_insights_generator(bazi_data, language):
                        chunk_count += 1
                        yield f"data: {json.dumps({'type': 'insight', 'text': chunk})}\n\n"
                    logger.info(f"Insights streaming complete: {chunk_count} chunks")
                else:
                    # Free: skip the expensive AI call entirely — send locked signal immediately
                    yield f"data: {json.dumps({'type': 'insight_locked', 'preview': ''})}\n\n"
                    logger.info("Insights skipped for free tier (locked)")

                # 4. Send completion
                yield f"data: {json.dumps({'type': 'complete'})}\n\n"

            except Exception as e:
                logger.error(f"Stream error: {e}", exc_info=True)
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_insights_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Language": language,
            }
        )
        
    except Exception as e:
        logger.error(f"Analyze error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-sync", tags=["Analysis"])
async def analyze_sync(request: BaziAnalysisRequest, http_request: Request):
    """Non-streaming BAZI analysis (SSE fallback) — with content gating"""
    user = await get_optional_user(http_request)
    tier = user.tier.value if user else "free"

    from subscriptions.rate_limiter import rate_limiter
    rate_key = user.id if user else (http_request.client.host if http_request.client else "unknown")
    if not rate_limiter.check(rate_key, tier):
        usage = rate_limiter.get_usage(rate_key, tier)
        return JSONResponse(status_code=429, content={
            "error": "rate_limited",
            "used": usage["used"],
            "limit": usage["limit"],
            "remaining": 0,
        })
    rate_limiter.increment(rate_key)

    try:
        validate_birth_input(
            request.birth_date, request.birth_hour, request.gender,
            calendar_type=request.calendar_type or "solar",
        )
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
            calendar_type=request.calendar_type or "solar",
            is_leap_month=request.is_leap_month or False,
        )
        language = request.language if request.language else "en"
        sections_raw = await generate_sections_parallel(bazi_data, language)
        insights_raw = await generate_insights_non_stream(bazi_data, language)

        # Gate each section (some sections are always free)
        from subscriptions.content_gate import FREE_SECTIONS
        gated_sections = {}
        for key, text in sections_raw.items():
            if key in FREE_SECTIONS:
                gated_sections[key] = {"text": text, "is_locked": False}
            else:
                gated_sections[key] = gate_content(text, tier)

        # Gate insights
        gated_insights = gate_content(insights_raw, tier)

        return {
            "bazi_chart": bazi_data,
            "sections": gated_sections,
            "insights": gated_insights,
        }
    except Exception as e:
        logger.error(f"Analyze-sync error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bazi-chart", tags=["Analysis"])
async def get_bazi_chart(request: BaziAnalysisRequest) -> BaziChartResponse:
    """
    Get BAZI chart calculation without AI insights
    """
    
    try:
        validate_birth_input(
            request.birth_date, request.birth_hour, request.gender,
            calendar_type=request.calendar_type or "solar",
        )
        bazi_data = calculate_bazi(
            request.birth_date,
            request.birth_hour,
            request.gender,
            request.language,
            calendar_type=request.calendar_type or "solar",
            is_leap_month=request.is_leap_month or False,
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
            use_god=bazi_data.get("use_god"),
            pillar_interactions=bazi_data.get("pillar_interactions"),
            error=bazi_data.get("error")
        )
    
    except Exception as e:
        return BaziChartResponse(
            success=False,
            error=str(e)
        )


@app.post("/api/compatibility", tags=["Analysis"])
async def compatibility_analysis(request: CompatibilityRequest, http_request: Request):
    """
    Compare two BAZI charts and return compatibility analysis with AI insights.
    Content-gated for free users.
    """
    user = await get_optional_user(http_request)
    tier = user.tier.value if user else "free"

    from subscriptions.rate_limiter import rate_limiter
    rate_key = user.id if user else (http_request.client.host if http_request.client else "unknown")
    if not rate_limiter.check(rate_key, tier):
        usage = rate_limiter.get_usage(rate_key, tier)
        return JSONResponse(status_code=429, content={
            "error": "rate_limited",
            "used": usage["used"],
            "limit": usage["limit"],
            "remaining": 0,
        })
    rate_limiter.increment(rate_key)

    try:
        lang = request.language or "en"

        # Validate both inputs
        validate_birth_input(
            request.person_a.birth_date, request.person_a.birth_hour,
            request.person_a.gender,
            calendar_type=request.person_a.calendar_type or "solar",
        )
        validate_birth_input(
            request.person_b.birth_date, request.person_b.birth_hour,
            request.person_b.gender,
            calendar_type=request.person_b.calendar_type or "solar",
        )

        # Calculate both charts
        chart_a = calculate_bazi(
            request.person_a.birth_date,
            request.person_a.birth_hour,
            request.person_a.gender,
            lang,
            calendar_type=request.person_a.calendar_type or "solar",
            is_leap_month=request.person_a.is_leap_month or False,
        )
        if not chart_a.get("success"):
            raise HTTPException(status_code=400, detail=f"Person A chart error: {chart_a.get('error')}")

        chart_b = calculate_bazi(
            request.person_b.birth_date,
            request.person_b.birth_hour,
            request.person_b.gender,
            lang,
            calendar_type=request.person_b.calendar_type or "solar",
            is_leap_month=request.person_b.is_leap_month or False,
        )
        if not chart_b.get("success"):
            raise HTTPException(status_code=400, detail=f"Person B chart error: {chart_b.get('error')}")

        # Run compatibility analysis
        compat = analyze_compatibility(chart_a, chart_b, lang)

        # Generate AI insight for compatibility
        from ai_insights.prompts import get_compatibility_prompt
        from ai_insights.generator import InsightGenerator

        gen = InsightGenerator()
        system_msg, user_prompt = get_compatibility_prompt(chart_a, chart_b, compat, lang)
        try:
            stream = await gen.client.chat.completions.create(
                **gen._build_completion_params(system_msg, user_prompt)
            )
            ai_text = ""
            async for chunk in stream:
                try:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        ai_text += delta.content
                except (IndexError, AttributeError):
                    pass
        except Exception as ai_err:
            logger.error(f"Compatibility AI error: {ai_err}")
            ai_text = ""

        # Gate AI insight for free users
        gated_insight = gate_content(ai_text, tier)

        return {
            "success": True,
            "compatibility": compat,
            "ai_insight": gated_insight["text"],
            "ai_insight_locked": gated_insight["is_locked"],
            "chart_a": chart_a,
            "chart_b": chart_b,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Compatibility error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DAILY FORECAST ====================

@app.post("/api/daily-forecast", tags=["Forecast"])
async def daily_forecast(request: DailyForecastRequest, http_request: Request):
    """
    Compute daily & weekly mini-forecast for a given birth chart.
    Content-gated: free users see a teaser; premium users see everything.
    """
    user = await get_optional_user(http_request)
    tier = user.tier.value if user else "free"

    # Rate limiting — shares the same daily bucket as other analyses
    from subscriptions.rate_limiter import rate_limiter
    rate_key = user.id if user else (http_request.client.host if http_request.client else "unknown")
    if not rate_limiter.check(rate_key, tier):
        usage = rate_limiter.get_usage(rate_key, tier)
        return JSONResponse(status_code=429, content={
            "error": "rate_limited",
            "used": usage["used"],
            "limit": usage["limit"],
            "remaining": 0,
        })
    rate_limiter.increment(rate_key)

    try:
        lang = request.language or "en"

        # Resolve birth data: prefer request body, fall back to user profile
        bd = request.birth_date
        bh = request.birth_hour
        gd = request.gender
        ct = request.calendar_type or "solar"
        lm = request.is_leap_month or False

        if (bd is None or bh is None or gd is None) and user:
            # Fill missing fields from user profile
            bd = bd or user.birth_date
            bh = bh if bh is not None else user.birth_hour
            gd = gd or user.gender
            ct = ct or user.calendar_type or "solar"
            lm = lm or user.is_leap_month or False

        if not bd or bh is None or not gd:
            raise HTTPException(
                status_code=400,
                detail="Birth data is required. Please provide birth_date, birth_hour, and gender, or save your birth data to your profile first.",
            )

        # Validate resolved birth data
        validate_birth_input(bd, bh, gd, calendar_type=ct)

        # Calculate natal BAZI chart
        chart = calculate_bazi(bd, bh, gd, lang, calendar_type=ct, is_leap_month=lm)
        if not chart.get("success"):
            raise HTTPException(status_code=400, detail=f"Chart error: {chart.get('error')}")

        # Parse target_date
        from datetime import date as date_cls
        if request.target_date:
            from datetime import datetime as dt
            td = dt.strptime(request.target_date, "%Y-%m-%d").date()
        else:
            td = date_cls.today()

        # Calculate daily forecast (pure Python — fast)
        forecast = calculate_daily_forecast(chart, language=lang, target_date=td)

        # Small AI call for Daily Wisdom (premium only; free gets locked)
        wisdom_text = ""
        wisdom_locked = False
        from subscriptions.feature_flags import get_features
        features = get_features(tier)

        if features.get("mini_forecasts"):
            # Premium: make a small non-streaming AI call for the wisdom quote
            try:
                from ai_insights.forecast_prompts import get_daily_wisdom_prompt
                from ai_insights.generator import InsightGenerator
                import asyncio

                gen = InsightGenerator()
                sys_msg, u_prompt = get_daily_wisdom_prompt(chart, forecast, lang)

                # For Azure reasoning models (o4-mini, o3-mini, o1), use
                # "developer" role instead of "system" — the system role is
                # ignored / unsupported by these models.
                msg_role = "developer" if gen.provider == "azure" else "system"

                # Build params manually — non-streaming for reliability
                call_params = {
                    "model": gen.model,
                    "messages": [
                        {"role": msg_role, "content": sys_msg},
                        {"role": "user", "content": u_prompt},
                    ],
                    "stream": False,
                }
                if gen.provider == "azure":
                    # Reasoning models: use max_tokens (OpenAI client param).
                    call_params["max_tokens"] = 2000
                    call_params["reasoning_effort"] = "low"
                else:
                    call_params["temperature"] = gen.temperature
                    call_params["max_tokens"] = 150

                response = await asyncio.wait_for(
                    gen.client.chat.completions.create(**call_params),
                    timeout=30,
                )

                # Extract content — reasoning models may place text in
                # different fields depending on SDK version / API version.
                wisdom_text = ""
                if response.choices:
                    choice = response.choices[0]
                    msg = choice.message
                    logger.info(f"Wisdom finish_reason={choice.finish_reason}, "
                                f"content={repr(msg.content)[:120] if msg else 'NO MSG'}")
                    # Try standard content first
                    if msg and msg.content:
                        wisdom_text = msg.content
                    # Some SDK versions expose output_text or refusal
                    elif msg and hasattr(msg, "refusal") and msg.refusal:
                        logger.warning(f"Wisdom AI refusal: {msg.refusal}")
                    # Last resort: check for any string attribute
                    if not wisdom_text and msg:
                        for attr in ("content", "reasoning_content"):
                            val = getattr(msg, attr, None)
                            if val and isinstance(val, str) and val.strip():
                                wisdom_text = val
                                break
                logger.info(f"Wisdom text final: {repr(wisdom_text[:100]) if wisdom_text else 'EMPTY'}")
            except Exception as ai_err:
                logger.error(f"Daily wisdom AI error: {ai_err}", exc_info=True)
                wisdom_text = ""
        else:
            wisdom_locked = True

        # Gate domain scores for free users (show only overall + top domain)
        domains_locked = not features.get("mini_forecasts", False)

        # Build response
        response = {
            "success": True,
            **forecast,
            "wisdom": wisdom_text.strip(),
            "wisdom_locked": wisdom_locked,
            "domains_locked": domains_locked,
        }

        # For free users: send ALL data so the frontend can display full charts
        # as a teaser (visual lure). The frontend LockedOverlay handles the
        # blur + upgrade CTA. We only gate the AI wisdom text server-side.

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Daily forecast error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
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