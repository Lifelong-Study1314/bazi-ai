"""
Subscription API routes: checkout, portal, webhook, status.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Request

from auth.base import User
from auth.dependencies import get_current_user
from .stripe_service import create_checkout_session, create_checkout_session_onetime, create_portal_session, handle_webhook
from .feature_flags import get_features_for_user, get_effective_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/subscribe", tags=["Subscription"])


@router.post("/checkout")
async def checkout(user: User = Depends(get_current_user)):
    """Create a Stripe Checkout session (subscription, card) and return the URL."""
    try:
        url = await create_checkout_session(user)
        return {"url": url}
    except Exception as e:
        logger.error(f"Checkout error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not create checkout session: {e}")


@router.post("/checkout-onetime")
async def checkout_onetime(user: User = Depends(get_current_user)):
    """Create a Stripe Checkout session (one-time, WeChat/Alipay/card) — premium for 31 days."""
    try:
        url = await create_checkout_session_onetime(user)
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout onetime error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not create checkout session: {e}")


@router.post("/portal")
async def portal(user: User = Depends(get_current_user)):
    """Create a Stripe Customer Portal session and return the URL."""
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No subscription found. Subscribe first.")
    try:
        url = await create_portal_session(user.stripe_customer_id)
        return {"url": url}
    except Exception as e:
        logger.error(f"Portal error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not create portal session: {e}")


@router.post("/webhook")
async def webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        await handle_webhook(payload, sig_header)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok"}


@router.get("/status")
async def status(user: User = Depends(get_current_user)):
    """Return the current user's subscription status and feature flags (effective tier = subscription or premium_until)."""
    effective = get_effective_tier(user)
    features = get_features_for_user(user)
    return {
        "tier": effective,
        "features": features,
        "stripe_customer_id": user.stripe_customer_id,
        "premium_until": user.premium_until,
    }
