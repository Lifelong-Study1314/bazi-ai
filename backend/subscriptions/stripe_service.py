"""
Stripe integration service.
Handles checkout sessions, customer portal, and webhook events.
"""

import logging
from datetime import datetime, timezone, timedelta

import stripe

from config import get_settings
from auth.base import User, SubscriptionTier
from auth.dependencies import get_auth_provider

logger = logging.getLogger(__name__)


def _init_stripe():
    """Set the Stripe API key from settings."""
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key


async def create_checkout_session(user: User) -> str:
    """
    Create a Stripe Checkout session for the Premium subscription (recurring, card only).
    Returns the checkout URL.
    """
    _init_stripe()
    settings = get_settings()

    customer_id = user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": user.id},
        )
        customer_id = customer.id
        provider = get_auth_provider()
        await provider.update_stripe_customer_id(user.id, customer_id)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        payment_method_types=["card"],
        success_url=f"{settings.frontend_url}?checkout=success",
        cancel_url=f"{settings.frontend_url}?checkout=cancel",
        metadata={"user_id": user.id},
    )
    return session.url


async def create_checkout_session_onetime(user: User) -> str:
    """
    Create a Stripe Checkout session for one-time payment (WeChat Pay, Alipay, card).
    Grants premium for 31 days. Returns the checkout URL.
    """
    _init_stripe()
    settings = get_settings()
    if not settings.stripe_price_id_onetime:
        raise ValueError("STRIPE_PRICE_ID_ONETIME is not configured")

    customer_id = user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": user.id},
        )
        customer_id = customer.id
        provider = get_auth_provider()
        await provider.update_stripe_customer_id(user.id, customer_id)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="payment",
        line_items=[{"price": settings.stripe_price_id_onetime, "quantity": 1}],
        payment_method_types=["wechat_pay", "card"],
        payment_method_options={
            "wechat_pay": {"client": "web"},
        },
        success_url=f"{settings.frontend_url}?checkout=success",
        cancel_url=f"{settings.frontend_url}?checkout=cancel",
        metadata={"user_id": user.id, "onetime": "31"},
    )
    return session.url


async def create_portal_session(customer_id: str) -> str:
    """
    Create a Stripe Customer Portal session for managing subscriptions.
    Returns the portal URL.
    """
    _init_stripe()
    settings = get_settings()

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=settings.frontend_url,
    )
    return session.url


async def handle_webhook(payload: bytes, sig_header: str) -> None:
    """
    Process Stripe webhook events to keep subscription tiers in sync.
    """
    _init_stripe()
    settings = get_settings()
    provider = get_auth_provider()

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error(f"Stripe webhook verification failed: {e}")
        raise ValueError("Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]["object"]
    logger.info(f"Stripe webhook received: {event_type}")

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        customer_id = data.get("customer")
        mode = data.get("mode")
        onetime = data.get("metadata", {}).get("onetime")

        if user_id:
            if mode == "payment" and onetime == "31":
                # One-time purchase: premium for 31 days
                until = (datetime.now(timezone.utc) + timedelta(days=31)).isoformat()
                await provider.update_premium_until(user_id, until)
                if customer_id:
                    await provider.update_stripe_customer_id(user_id, customer_id)
                logger.info(f"User {user_id} granted premium until {until} (one-time)")
            else:
                # Subscription: full premium
                await provider.update_user_tier(user_id, SubscriptionTier.PREMIUM)
                if customer_id:
                    await provider.update_stripe_customer_id(user_id, customer_id)
                logger.info(f"User {user_id} upgraded to PREMIUM via checkout")

    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled — downgrade to free
        customer_id = data.get("customer")
        if customer_id:
            user = await provider.get_user_by_stripe_customer_id(customer_id)
            if user:
                await provider.update_user_tier(user.id, SubscriptionTier.FREE)
                logger.info(f"User {user.id} downgraded to FREE (subscription deleted)")

    elif event_type == "customer.subscription.updated":
        # Subscription status changed
        customer_id = data.get("customer")
        status = data.get("status")
        if customer_id:
            user = await provider.get_user_by_stripe_customer_id(customer_id)
            if user:
                if status in ("active", "trialing"):
                    await provider.update_user_tier(user.id, SubscriptionTier.PREMIUM)
                elif status in ("canceled", "unpaid", "past_due"):
                    await provider.update_user_tier(user.id, SubscriptionTier.FREE)
                logger.info(f"User {user.id} subscription updated: status={status}")

    elif event_type == "invoice.payment_failed":
        customer_id = data.get("customer")
        logger.warning(f"Payment failed for customer {customer_id}")
