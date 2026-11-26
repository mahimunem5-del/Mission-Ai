# Phase 11 — Billing & Credit System Status

**Date**: 2026-11-26  
**Status**: 🔴 NOT ACTIVE — Requires migration execution

---

## 1. Overview

The billing and credit system is architecturally designed but not yet active because the required database tables are missing from production Supabase.

---

## 2. Database Dependencies

| Table | Purpose | Present in DB |
|-------|---------|--------------|
| `model_usage` | Token telemetry, cost tracking per request | ❌ Missing |
| `subscriptions` | User plan tier (free/pro/max/enterprise) | ❌ Missing |
| `credit_transactions` | Credit debit/credit history | ❌ Missing |

**All 3 tables** will be created by executing `001_clean_schema.sql`.

---

## 3. What Happens With Missing Tables

The backend handles missing tables gracefully:

```
[WARN] modelUsageRepository.recordModelUsage skipped/warn: TypeError: fetch failed
```

- Requests are still processed and AI responses are still delivered
- Token usage is computed but **not persisted** (silently dropped)
- No user-visible error occurs
- No crash or service interruption

---

## 4. `model_usage` Schema

```sql
CREATE TABLE IF NOT EXISTS model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    request_id TEXT,
    provider TEXT NOT NULL,
    requested_model TEXT,
    resolved_model TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'chat',
    input_tokens INTEGER DEFAULT NULL,   -- NULL if provider omits
    output_tokens INTEGER DEFAULT NULL,  -- NULL if provider omits
    total_tokens INTEGER DEFAULT NULL,   -- NULL if provider omits
    api_cost_usd NUMERIC(12, 8) DEFAULT NULL,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
```

> [!NOTE]
> `input_tokens`, `output_tokens`, `total_tokens`, and `api_cost_usd` are **nullable**. The backend never invents token counts — if OpenRouter or Mahi Engine omits them, they are stored as NULL. This was validated in Phase 6 test suite: "Usage persistence payload never invents tokens or cost when omitted" ✅ PASSED.

---

## 5. `subscriptions` Schema

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL DEFAULT 'free'
        CHECK (plan_tier IN ('free', 'pro', 'max', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
```

**RLS**: Users can only SELECT their own row. INSERT/UPDATE/DELETE restricted to service-role (Stripe webhooks, admin).

---

## 6. What Becomes Active After Migration

| Feature | Activation trigger |
|---------|-------------------|
| Token usage recording | `model_usage` table created |
| `/api/usage` endpoint (user usage history) | `model_usage` table created |
| Subscription status endpoint | `subscriptions` table created |
| Credit balance endpoint | `credit_transactions` table created |

---

## 7. What Still Needs Building (Future Phase)

| Item | Status |
|------|--------|
| Stripe/billing provider integration | ❌ Not started |
| Credit deduction on AI request | ❌ Not started |
| Subscription tier enforcement | ❌ Not started |
| Usage dashboard in `/chat-next` frontend | ❌ Not started |
| Free tier limits (message count, token limits) | ❌ Not started |

**Billing is infrastructure-ready (schema + RLS designed) but not functionally active.** The tables are foundational for a future billing integration phase.
