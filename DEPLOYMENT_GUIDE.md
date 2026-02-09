# BAZI AI — Supabase + Payments + Render Deployment Guide

> Full step-by-step instructions to move the application from local/mock
> development to a production-grade setup with Supabase auth, Stripe payments
> (with Alipay / WeChat Pay for mainland China), and Render hosting.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 1 — Supabase Setup](#2-phase-1--supabase-setup)
3. [Phase 2 — Implement SupabaseAuthProvider](#3-phase-2--implement-supabaseauthprovider)
4. [Phase 3 — Payment Platform (Stripe + Alipay/WeChat Pay)](#4-phase-3--payment-platform-stripe--alipaywechat-pay)
5. [Phase 4 — Deploy to Render](#5-phase-4--deploy-to-render)
6. [Phase 5 — Post-Deployment Checklist](#6-phase-5--post-deployment-checklist)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Architecture Overview

### Current (Local Development)
```
Frontend (Vite dev server :5173)
    ↓ fetch /api/*
Backend  (FastAPI :8000)
    ├─ Auth:        MockAuthProvider (SQLite file)
    ├─ Payments:    Stripe scaffold (no live keys)
    ├─ AI:          Azure OpenAI o4-mini
    └─ DB:          SQLite file (backend/data/users.db)
```

### Target (Production)
```
Frontend (Render Static Site — serves dist/)
    ↓ fetch VITE_API_URL/api/*
Backend  (Render Web Service — gunicorn + uvicorn)
    ├─ Auth:        SupabaseAuthProvider (Supabase Postgres)
    ├─ Payments:    Stripe (with Alipay + WeChat Pay enabled)
    ├─ AI:          Azure OpenAI o4-mini (same)
    └─ DB:          Supabase Postgres (managed)
```

---

## 2. Phase 1 — Supabase Setup

### 2.1  Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **"New Project"**.
3. Choose an organization, name it (e.g. `bazi-ai`), set a **database password** (save this!), and pick a region close to your users (e.g. `Southeast Asia (Singapore)` for China-adjacent latency).
4. Wait for the project to finish provisioning (~2 minutes).

### 2.2  Create the `users` Table

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Users table (mirrors the mock SQLite schema)
CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    name            TEXT,
    tier            TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    premium_until   TIMESTAMPTZ,   -- one-time purchase: premium until this time
    birth_date      TEXT,          -- "YYYY-MM-DD"
    birth_hour      INTEGER,       -- 0-23
    gender          TEXT,          -- "male" / "female"
    calendar_type   TEXT,          -- "solar" / "lunar"
    is_leap_month   BOOLEAN DEFAULT FALSE
);

-- Index for fast lookup by email (login) and stripe customer (webhook)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON public.users (stripe_customer_id);
```

If the table already exists, add the one-time premium column (for WeChat/Alipay 31-day access):

```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;
```

### 2.3  Disable Supabase Built-in Auth (We Use Our Own JWT)

Our app manages its own JWT tokens and password hashing (via `python-jose` and `bcrypt`). We use Supabase **only as a Postgres database**, not its built-in Auth service. This keeps our `AuthProvider` interface clean and avoids vendor lock-in.

You do NOT need to configure Supabase Auth providers, email templates, etc.

### 2.4  Get Your Supabase Credentials

From the Supabase Dashboard → **Settings → API**, copy:

| Key | Where to Find | Used For |
|-----|---------------|----------|
| **Project URL** | Settings → API → Project URL | `SUPABASE_URL` env var |
| **`service_role` key** | Settings → API → `service_role` (secret) | `SUPABASE_SERVICE_KEY` env var |

> **IMPORTANT:** Use the `service_role` key (NOT the `anon` key). The service
> role key bypasses Row Level Security and is meant for server-side use only.
> Never expose it to the frontend.

### 2.5  (Optional) Enable Row Level Security

If you want an extra layer of safety:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow the service_role to do everything (our backend uses this)
CREATE POLICY "Service role full access" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

---

## 3. Phase 2 — Implement SupabaseAuthProvider

### 3.1  Install the Python Supabase Client

Add to `backend/requirements.txt`:

```
supabase>=2.0.0
```

Then install:

```bash
cd backend
pip install supabase
```

### 3.2  Create `backend/auth/supabase_provider.py`

Create a new file with the following implementation:

```python
"""
Supabase auth provider — production-grade replacement for MockAuthProvider.
Uses Supabase Postgres as the backing store; manages passwords ourselves
(bcrypt) and issues our own JWTs (python-jose).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

import bcrypt
from supabase import create_client, Client

from .base import AuthProvider, User, SubscriptionTier


class SupabaseAuthProvider(AuthProvider):
    """Supabase-backed authentication provider."""

    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
        self.table = "users"

    # ── lifecycle ──────────────────────────────────────────────

    async def startup(self) -> None:
        """No-op — table is created via Supabase SQL editor / migrations."""
        pass

    # ── helpers ────────────────────────────────────────────────

    @staticmethod
    def _hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def _verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    @staticmethod
    def _row_to_user(row: dict) -> User:
        return User(
            id=str(row["id"]),
            email=row["email"],
            name=row.get("name"),
            tier=SubscriptionTier(row.get("tier", "free")),
            stripe_customer_id=row.get("stripe_customer_id"),
            created_at=row.get("created_at", ""),
            birth_date=row.get("birth_date"),
            birth_hour=row.get("birth_hour"),
            gender=row.get("gender"),
            calendar_type=row.get("calendar_type"),
            is_leap_month=row.get("is_leap_month"),
        )

    # ── AuthProvider interface ─────────────────────────────────

    async def signup(self, email: str, password: str, name: Optional[str] = None) -> User:
        email = email.lower().strip()

        # Check for existing user
        existing = self.client.table(self.table).select("id").eq("email", email).execute()
        if existing.data:
            raise ValueError("An account with this email already exists")

        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        pw_hash = self._hash_password(password)

        self.client.table(self.table).insert({
            "id": user_id,
            "email": email,
            "password_hash": pw_hash,
            "name": name,
            "tier": SubscriptionTier.FREE.value,
            "created_at": now,
        }).execute()

        return User(
            id=user_id, email=email, name=name,
            tier=SubscriptionTier.FREE, created_at=now,
        )

    async def login(self, email: str, password: str) -> User:
        email = email.lower().strip()
        result = self.client.table(self.table).select("*").eq("email", email).execute()

        if not result.data:
            raise ValueError("Invalid email or password")

        row = result.data[0]
        if not self._verify_password(password, row["password_hash"]):
            raise ValueError("Invalid email or password")

        return self._row_to_user(row)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = self.client.table(self.table).select("*").eq("id", user_id).execute()
        if not result.data:
            return None
        return self._row_to_user(result.data[0])

    async def update_user_tier(self, user_id: str, tier) -> User:
        tier_value = tier.value if hasattr(tier, "value") else str(tier)
        self.client.table(self.table).update({"tier": tier_value}).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def update_stripe_customer_id(self, user_id: str, customer_id: str) -> User:
        self.client.table(self.table).update(
            {"stripe_customer_id": customer_id}
        ).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    async def get_user_by_stripe_customer_id(self, customer_id: str) -> Optional[User]:
        result = self.client.table(self.table).select("*").eq(
            "stripe_customer_id", customer_id
        ).execute()
        if not result.data:
            return None
        return self._row_to_user(result.data[0])

    async def update_birth_data(
        self,
        user_id: str,
        birth_date: str,
        birth_hour: int,
        gender: str,
        calendar_type: str = "solar",
        is_leap_month: bool = False,
    ) -> User:
        self.client.table(self.table).update({
            "birth_date": birth_date,
            "birth_hour": birth_hour,
            "gender": gender,
            "calendar_type": calendar_type,
            "is_leap_month": is_leap_month,
        }).eq("id", user_id).execute()
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user
```

### 3.3  Update `backend/config.py` — Add Supabase Config

Add these two fields inside the `Settings` class:

```python
    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_key: str = Field(default="", alias="SUPABASE_SERVICE_KEY")
```

### 3.4  Update `backend/main.py` — Register the New Provider

In the `startup_event()` function, update the provider selection:

```python
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

    # Seed admin account (only for mock provider in dev)
    if provider_name == "mock":
        # ... existing admin seeding code stays here ...
```

### 3.5  Update `.env` for Local Testing with Supabase

```env
# Switch provider
AUTH_PROVIDER=supabase

# Supabase credentials
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...your_service_role_key...

# Keep a strong JWT secret for production
JWT_SECRET=your-random-64-char-secret-here
```

### 3.6  Test Locally

1. Set `AUTH_PROVIDER=supabase` in `backend/.env`
2. Start the backend: `python main.py`
3. Sign up via the frontend — verify the row appears in Supabase Table Editor
4. Log in, run an analysis, check that birth data persists
5. Verify the Daily Forecast auto-loads the saved birth data

---

## 4. Phase 3 — Payment Platform (Stripe + Alipay/WeChat Pay)

### Why Stripe?

For **mainland China users**, the payment platform must support **Alipay (支付宝)** and/or **WeChat Pay (微信支付)**. Stripe supports both as payment methods, and our codebase already has a full Stripe scaffold (checkout, portal, webhooks). This is the fastest path.

> **Alternative:** If you later need a fully China-domestic solution (e.g.
> your business entity is registered in China), consider a direct integration
> with Alipay/WeChat Pay via their merchant APIs. But for an international
> SaaS targeting Chinese users, Stripe + Alipay/WeChat Pay is standard.

### 4.1  Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account.
2. Complete identity verification (required for live payments).
3. From the Dashboard, note your **Secret key** (starts with `sk_live_...` or `sk_test_...`).

### 4.2  Enable Alipay and WeChat Pay

1. In Stripe Dashboard → **Settings → Payment methods**.
2. Enable **Alipay** and **WeChat Pay**.
3. Both are available automatically for Stripe accounts in most countries.
   If you don't see them, check [Stripe's payment method availability](https://stripe.com/docs/payments/payment-methods/overview).

### 4.3  Create a Subscription Price

1. Stripe Dashboard → **Products → Add product**.
2. Name: `BAZI AI Premium` (or your preferred name).
3. Price: Set your monthly/yearly price (e.g. ¥29.9/month or $4.99/month).
4. Click **Save** and copy the **Price ID** (starts with `price_...`).

### 4.4  Update Checkout to Support Alipay/WeChat Pay

Edit `backend/subscriptions/stripe_service.py` — update the `create_checkout_session` function:

```python
session = stripe.checkout.Session.create(
    customer=customer_id,
    mode="subscription",
    line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
    payment_method_types=[
        "card",
        "alipay",
        "wechat_pay",
    ],
    payment_method_options={
        "wechat_pay": {"client": "web"},
    },
    success_url=f"{settings.frontend_url}?checkout=success",
    cancel_url=f"{settings.frontend_url}?checkout=cancel",
    metadata={"user_id": user.id},
)
```

> **Note:** Alipay and WeChat Pay support for *subscriptions* depends on your
> Stripe account region and the customer's location. If subscriptions aren't
> supported, you can fall back to one-time payments with a custom renewal
> flow, or use `mode="payment"` with invoice-based billing.

### 4.5  Set Up Stripe Webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR_BACKEND_URL/api/subscribe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_...`).

### 4.6  Update Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

### 4.7  Test with Stripe CLI (Local)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:8000/api/subscribe/webhook

# In another terminal, trigger a test checkout from the frontend
# Use Stripe test card: 4242 4242 4242 4242
# Use Alipay test: Stripe automatically redirects in test mode
```

---

## 5. Phase 4 — Deploy to Render

You'll deploy **two services** on Render:
1. **Backend** — Web Service (Python/FastAPI)
2. **Frontend** — Static Site (Vite build output)

### 5.1  Prepare the Repository

Make sure your repo has this structure:

```
bazi-ai-product/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── config.py
│   ├── auth/
│   ├── subscriptions/
│   ├── bazi_engine/
│   ├── ai_insights/
│   └── ...
├── src/                   # React frontend source
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── ...
```

**Security already in the codebase (no manual edits needed):**
- **CORS** — Origins are derived from `FRONTEND_URL`. Set `FRONTEND_URL` in Render to your frontend URL; localhost is only allowed when `DEBUG=true` or when the URL contains `localhost`.
- **Admin seeding** — The premium admin account is only created when `AUTH_PROVIDER=mock`. With `AUTH_PROVIDER=supabase` (production), no admin seed runs.
- **JWT secret** — If you use Supabase and leave `JWT_SECRET` unset or set to the default value, the backend **refuses to start** and logs an error. You must set a strong `JWT_SECRET` in Render.

Never commit `backend/.env`. All secrets belong in Render environment variables only.

### 5.2  Pin Dependency Versions

Before deploying, pin all backend dependencies. In your backend venv:

```bash
cd backend
pip freeze > requirements.txt
```

Review the output and keep only what you need (remove dev-only packages).

### 5.3  Deploy the Backend (Render Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**.
2. Connect your Git repository.
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `bazi-ai-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 300` |
| **Instance Type** | Starter or Standard (need enough RAM for AI calls) |

4. Add **Environment Variables** (see [Section 7](#7-environment-variables-reference) for full list):

```
# AI (use one of deepseek or azure)
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_key

# Or for Azure:
# AI_PROVIDER=azure
# AZURE_OPENAI_API_KEY=your_key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_API_VERSION=2024-12-01-preview
# AZURE_OPENAI_DEPLOYMENT=sa-o4-mini

AUTH_PROVIDER=supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...

# Required for production — app will not start with default when using Supabase
JWT_SECRET=<generate via: python3 -c "import secrets; print(secrets.token_hex(32))">

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Must match your Render frontend URL (used for CORS and Stripe redirects)
FRONTEND_URL=https://your-frontend-url.onrender.com
BACKEND_URL=https://bazi-ai-backend.onrender.com

# Production
DEBUG=false
```

5. Click **Create Web Service**. Render will build and deploy.

> **Important:** The `--timeout 300` flag on gunicorn is critical because AI
> generation can take 60-120 seconds. Without it, workers will be killed
> mid-request.

### 5.4  Deploy the Frontend (Render Static Site)

1. Render Dashboard → **New → Static Site**.
2. Connect the same Git repository.
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `bazi-ai-frontend` |
| **Root Directory** | `.` (repo root, where `package.json` lives) |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add **Environment Variable** (build-time):

```
VITE_API_URL=https://bazi-ai-backend.onrender.com
```

> This is a **build-time** variable. Vite bakes it into the JS bundle during
> `npm run build`. If you change the backend URL, you must **re-deploy** the
> frontend.

5. Add a **Rewrite Rule** for SPA routing (if using client-side routing):

   In Render Static Site settings → **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**

6. Click **Create Static Site**.

### 5.5  Update Stripe Webhook URL

After deployment, update the Stripe webhook endpoint to point to your
production backend:

```
https://bazi-ai-backend.onrender.com/api/subscribe/webhook
```

### 5.6  CORS (No Code Change Required)

CORS is already configured in the codebase from `FRONTEND_URL`:
- In production, set `FRONTEND_URL` to your Render frontend URL (e.g. `https://bazi-ai-frontend.onrender.com`). Only that origin is allowed.
- Localhost origins are added only when `DEBUG=true` or when `FRONTEND_URL` contains `localhost`.

Ensure `FRONTEND_URL` in the backend service matches your actual frontend URL exactly (including `https://`, no trailing slash).

---

## 6. Phase 5 — Post-Deployment Checklist

### Security
- [ ] `JWT_SECRET` is a strong random string (64+ chars), NOT the default
- [ ] `SUPABASE_SERVICE_KEY` is only in backend env vars, never in frontend
- [ ] CORS is restricted to your frontend domain
- [ ] `DEBUG=false` in production
- [ ] Stripe webhook secret is set and webhook signature is verified

### Functionality
- [ ] Sign up creates a user in Supabase (check Table Editor)
- [ ] Login returns a valid JWT; `/api/auth/me` works
- [ ] Free user sees 3 analyses/day limit, gated content
- [ ] Premium user sees unlimited analyses, full content
- [ ] Stripe checkout redirects correctly and upgrades user to premium
- [ ] Stripe webhook fires on subscription changes (check Render logs)
- [ ] Alipay / WeChat Pay appears as payment options at checkout
- [ ] Daily Forecast loads birth data from user profile
- [ ] Save Image works for premium users

### Performance
- [ ] Backend responds within 5s for chart calculation (excluding AI)
- [ ] AI streaming doesn't timeout (gunicorn timeout = 300s)
- [ ] Frontend loads within 3s on fast connections (check dist size)

### Monitoring
- [ ] Check Render logs for errors after first few real users
- [ ] Set up Render alerts for service crashes / high error rates
- [ ] Monitor Stripe Dashboard for failed payments

---

## 7. Environment Variables Reference

### Backend (`backend/.env` or Render Environment)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | Yes | `azure` | `azure` or `deepseek` |
| `AZURE_OPENAI_API_KEY` | If azure | `EgBJf2...` | Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | If azure | `https://xxx.openai.azure.com/` | Azure endpoint |
| `AZURE_OPENAI_API_VERSION` | If azure | `2024-12-01-preview` | API version |
| `AZURE_OPENAI_DEPLOYMENT` | If azure | `sa-o4-mini` | Deployment name |
| `AUTH_PROVIDER` | Yes | `supabase` | `mock` (dev) or `supabase` (prod) |
| `SUPABASE_URL` | If supabase | `https://xxx.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | If supabase | `eyJhbG...` | Supabase service_role key |
| `JWT_SECRET` | Yes | `random-64-chars` | Secret for signing JWTs |
| `STRIPE_SECRET_KEY` | For payments | `sk_live_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | `whsec_...` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | For payments | `price_...` | Stripe subscription price ID |
| `FRONTEND_URL` | Yes | `https://bazi-ai.onrender.com` | Frontend URL (for CORS, Stripe redirects) |
| `BACKEND_URL` | Yes | `https://bazi-ai-backend.onrender.com` | Backend URL |
| `MAX_TOKENS` | No | `8192` | Max AI tokens |
| `API_TIMEOUT` | No | `180` | AI call timeout in seconds |
| `DEBUG` | No | `false` | Enable debug mode |

### Frontend (build-time, in Render Static Site env or `.env.local`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `https://bazi-ai-backend.onrender.com` | Backend API URL |

---

## 8. Troubleshooting

### "Auth provider not configured" error
- Check `AUTH_PROVIDER` env var matches `mock` or `supabase`
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly

### "Invalid token" after deploying
- `JWT_SECRET` must be the **same** across all backend instances
- If you changed `JWT_SECRET`, all existing tokens are invalidated — users must re-login

### Stripe checkout doesn't redirect back
- Verify `FRONTEND_URL` is set to the correct production URL (including `https://`)
- Check that the Stripe Price ID exists and is active

### Alipay / WeChat Pay not showing at checkout
- Ensure both are enabled in Stripe Dashboard → Settings → Payment methods
- Alipay/WeChat Pay availability depends on your Stripe account country
- For testing, use Stripe test mode — Alipay test payments auto-approve

### AI analysis hangs / times out on Render
- Increase gunicorn timeout: `--timeout 300` or higher
- Check Azure OpenAI quotas — you may be hitting rate limits
- Monitor Render logs for timeout errors

### Frontend shows old backend URL after changing it
- `VITE_API_URL` is baked in at build time — you must **redeploy** the frontend
- Clear browser cache / hard refresh

### CORS errors in production
- Verify `FRONTEND_URL` in backend env matches the actual frontend domain exactly
- Include the protocol (`https://`) and no trailing slash

### Supabase connection errors
- Verify the `service_role` key (not `anon` key) is used
- Check that the `users` table exists with the correct schema
- Supabase free tier has connection limits — upgrade if needed

---

## Quick Reference — Deployment Commands

```bash
# ── Local development ──
cd backend && .\.venv\Scripts\Activate.ps1 && python main.py
cd .. && npm run dev

# ── Build frontend for production ──
npm run build    # outputs to dist/

# ── Generate strong JWT secret ──
python -c "import secrets; print(secrets.token_hex(32))"

# ── Pin backend dependencies ──
cd backend && pip freeze > requirements.txt

# ── Test Stripe webhooks locally ──
stripe listen --forward-to localhost:8000/api/subscribe/webhook
```

---

*Last updated: 2026-02-08*
