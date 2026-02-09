# BAZI AI Product — Improvement Roadmap

> Last updated: 2026-02-06

---

## Completed Features

| # | Feature | Status |
|---|---------|--------|
| 3 | Animated Chart Reveal | Done — cards flip in, progress labels per section |
| 14 | Lunar Calendar Conversion | Done — solar/lunar toggle with leap month support |
| 4 | Use God / Avoid God (用神 / 忌神) | Done — multi-language, actionable advice |
| 2 | Compatibility Analysis (合婚) | Done — 5-dimension scoring, AI insight, historical analogy |
| 15 | Pillar Interactions (合沖刑害) | Done — SVG arcs, color-coded, full Three Harmonies/Six Harms/Punishments |
| — | Theme-Aligned Icons | Done — all icons in gold/dark palette |
| — | Rich Text Formatting | Done — bold, color, bullets across all AI sections |
| — | Strict Language Localization | Done — EN/TW/CN/KO, no cross-language leakage |
| — | Consistent AI Output Format | Done — prompt templates enforce structure per section |
| — | Auth System (Mock Provider) | Done — signup/login, JWT, abstract provider for future Supabase |
| — | Subscription & Content Gating | Done — free tier (3/day, preview), premium (unlimited, full) |
| — | Rate Limiting with Friendly UI | Done — localized "daily limit reached" card with upgrade CTA |
| — | Stripe Integration (Scaffold) | Done — checkout, portal, webhook endpoints ready |
| — | Premium Admin Account | Done — seeded on startup for testing |

---

## Priority 1 — High-Impact User Features

### 1. PDF Export & Social Sharing
**Why:** The single most requested feature in fortune-telling apps. Users want to save, print, and share their reading. Now gated behind Premium — a strong conversion driver.
**Scope:**
- Generate a beautifully styled PDF from chart + all sections
- Include BAZI chart grid, element wheel graphic, and formatted AI text
- Add a "Share" button that creates a shareable image card (Open Graph-friendly)
- Consider jsPDF or Puppeteer-based server-side rendering
**Effort:** Medium-Large

### 2. History & Saved Readings
**Why:** Currently, a page refresh loses everything. Saved readings give users a reason to create an account and return. Premium-gated.
**Scope:**
- Store completed analyses per user (backend: new `readings` table)
- Dashboard view: list past readings with date, name, quick summary
- Click to re-open a saved reading (no re-generation cost)
- Free users: see last 1 reading; Premium: unlimited history
**Effort:** Medium

### 3. Monthly/Weekly Mini-Forecasts
**Why:** The app only shows annual forecasts. A recurring short forecast gives users a reason to come back weekly — critical for retention and Premium conversion.
**Scope:**
- New AI prompt: "This month's BAZI forecast" (~100 words)
- Dashboard card or push notification hook
- Premium-only; free users see a teaser
**Effort:** Medium

### 4. Input Validation & Error Resilience
**Why:** No validation for future dates, impossible dates, or out-of-range hours. Bad input can crash the backend. Missing error boundaries on the frontend mean one broken section can blank the whole page.
**Scope:**
- Backend: validate date range (1900–2100), hour (0–23), no future dates
- Frontend: React Error Boundaries around each section card
- Frontend: retry button on failed individual sections
- Frontend: proper timeout UX (instead of infinite spinner)
**Effort:** Small-Medium

### 5. Caching (AI Response & Chart)
**Why:** Same birth data recalculates and re-calls the AI every time. A cache makes repeat queries instant and saves significant Azure API cost.
**Scope:**
- Backend: hash(birth_date + hour + gender + language) as cache key
- In-memory LRU cache for BAZI chart calculations (instant)
- Redis or file-based cache for AI section outputs (TTL: 24h)
- Cache-hit indicator in response for debugging
**Effort:** Small-Medium

---

## Priority 2 — UX Polish & Engagement

### 6. Onboarding & Contextual Tooltips
**Why:** First-time users don't know what BAZI is, what the Four Pillars mean, or how to read the chart. A guided intro dramatically reduces bounce rate.
**Scope:**
- Welcome modal or 3-step intro carousel on first visit
- Hover/tap tooltips on chart terms: "Day Master = your core self", "Heavenly Stem = external energy"
- "How to read this chart" expandable section
- LocalStorage flag to show only once
**Effort:** Medium

### 7. Interactive Element Wheel
**Why:** The SVG pentagon is beautiful but static. Making it interactive makes users explore and understand the Five Elements — a key "aha" moment.
**Scope:**
- Click/hover a node to highlight its generation and destruction arrows
- Pulse glow on dominant element, dim on missing elements
- Animated arrows showing cycle direction
- Tooltip with element meaning and life implications
**Effort:** Medium

### 8. Celebration on Completion
**Why:** When all 10 sections finish, there's no fanfare. A brief confetti/particle animation signals "your reading is ready" and feels premium.
**Scope:**
- Trigger on `analysisComplete` state change
- Lightweight canvas particle animation (2-3 seconds)
- Respect `prefers-reduced-motion`
- Skip if user scrolled past the trigger point
**Effort:** Small

### 9. Typewriter Effect for AI Insights
**Why:** The comprehensive insights section loads as a blob. A typewriter animation makes it feel like a master is revealing your destiny live.
**Scope:**
- Character-by-character or word-by-word reveal on the Destiny Analysis section
- Configurable speed, skip button
- Only for Premium users (free users see locked preview)
**Effort:** Small

### 10. Light Mode Toggle
**Why:** Older demographics (core BAZI users) often prefer light backgrounds. Previously attempted but reverted due to file issues.
**Scope:**
- CSS custom properties for light palette
- Toggle in header next to language selector
- Persist preference in localStorage
- Ensure all components honor the theme (SVGs, borders, shadows)
**Effort:** Medium

---

## Priority 3 — Backend Hardening & Production Readiness

### 11. Pin All Dependency Versions
**Why:** `openai`, `lunardate`, `python-jose`, `bcrypt`, `aiosqlite`, `stripe` are unpinned. A breaking update could silently break production.
**Scope:** Run `pip freeze` and pin exact versions in `requirements.txt`.
**Effort:** Tiny

### 12. Restrict CORS & Security Headers
**Why:** CORS currently allows `*` (all origins). In production, this should be locked to the frontend domain. Add security headers (CSP, HSTS, X-Frame-Options).
**Scope:** Environment-conditional CORS config; add middleware for security headers.
**Effort:** Small

### 13. Auth Hardening
**Why:** Auth endpoints have no rate limiting (brute force risk). No email verification. No password reset. JWT secret is weak by default.
**Scope:**
- Rate limit `/api/auth/login` (5 attempts/minute)
- Email verification flow (send link, verify token)
- Password reset flow (forgot password → email → reset)
- Enforce strong JWT secret in production
- Add refresh token mechanism
**Effort:** Medium-Large

### 14. Supabase Migration
**Why:** The mock SQLite provider is for development only. Supabase provides production-grade auth, Postgres, and real-time features out of the box. The abstract `AuthProvider` interface makes this a clean swap.
**Scope:**
- Implement `SupabaseAuthProvider` (signup, login, get_user, update_tier)
- Migrate `users` table schema to Supabase
- Update config to switch providers via env var
- Test all auth flows end-to-end
**Effort:** Medium

### 15. Redis for Rate Limiting & Caching
**Why:** In-memory rate limiter resets on server restart and doesn't work across multiple instances. Redis provides persistent, distributed state.
**Scope:**
- Replace `RateLimiter` dict with Redis counters (TTL = 24h)
- Optionally use Redis for AI response caching (#5)
- Add Redis connection config to `.env`
**Effort:** Medium

### 16. More Deities (神煞)
**Why:** Only 2 deities are implemented (Tian Yi Gui Ren, Peach Blossom). Traditional readings include 10-20+. Each adds a story element users love.
**Scope:**
- Add: Wen Chang (文昌), Yi Ma (驛馬), Hua Gai (華蓋), Lu Shen (祿神), Yang Ren (羊刃), etc.
- Include in chart data and AI prompt context
- Add deity cards in ResultsDisplay
**Effort:** Medium

### 17. BAZI Calculation Accuracy Review
**Why:** Month/hour stem calculations are simplified. Age period starting age is fixed at 8 (traditionally varies by gender and year). A domain expert review ensures credibility.
**Scope:**
- Compare engine output against known BAZI references
- Fix month stem lookup (should use year stem cycle, not simplified)
- Fix hour stem lookup
- Calculate dynamic age period start
**Effort:** Medium

### 18. Comprehensive Testing
**Why:** No tests exist. Any refactor risks silent regressions. AI output parsing is especially fragile.
**Scope:**
- Backend: pytest for BAZI engine (calculator, elements, compatibility)
- Backend: pytest for auth flows (signup, login, JWT)
- Backend: pytest for content gating logic
- Frontend: Vitest + React Testing Library for key components
- E2E: Playwright for critical user journeys
**Effort:** Large

---

## Quick Wins (Low Effort, High Polish)

| What | Where | Effort |
|------|-------|--------|
| Retry button on failed sections | ResultsDisplay.jsx | Small |
| Date range validation (no future dates) | InputForm.jsx | Tiny |
| Persist language preference | LanguageSelector.jsx | Tiny |
| Pin dependency versions | requirements.txt | Tiny |
| Add `prefers-reduced-motion` to new animations | globals.css | Tiny |
| Extract translation strings to shared i18n file | Multiple components | Small |
| Add print stylesheet for chart | globals.css | Small |
| Keyboard navigation for UserMenu dropdown | UserMenu.jsx | Small |
| Password strength indicator | AuthModal.jsx | Small |
| Loading state on "Subscribe Now" button | PricingModal.jsx | Tiny |

---

## Architecture Notes

### Current Stack
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** FastAPI (Python 3.12) + Azure OpenAI (o4-mini)
- **Auth:** Abstract provider → Mock SQLite (dev) → Supabase (planned)
- **Payments:** Stripe (scaffold ready, needs live keys)
- **Database:** SQLite file (dev) → Postgres via Supabase (planned)

### Code Health Observations
- `App.jsx` (445 lines) and `ResultsDisplay.jsx` (565 lines) are large — consider splitting
- `useAnalysisBazi.js` (267 lines) handles too many concerns — consider splitting streaming, state, and fallback logic
- Translation strings are scattered across components — a shared i18n file would reduce duplication
- No TypeScript — adding it would improve maintainability as the codebase grows
- No error boundaries — one broken component can blank the page
- `axios` is imported but mostly unused (native `fetch` used instead) — remove or consolidate
