# Phase 7E — Supabase Migration Review (`PHASE7E_SUPABASE_MIGRATION_REVIEW.md`)

**Migration File**: [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql)  
**Status**: **NOT APPLIED** (awaiting explicit approval)

---

## 1. What the Migration Changes
- Creates 6 new tables: `profiles`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions`.
- Preserves existing tables (`conversations`, `messages`, `image_templates`) via `CREATE TABLE IF NOT EXISTS`.
- Adds composite performance indexes (`CREATE INDEX IF NOT EXISTS`) and enables RLS on all 9 tables.

## 2. Potential Data Impact
- **Zero destructive impact**: No `DROP`, `TRUNCATE`, or destructive `ALTER` statements.
- Existing `conversations` (`user_id IS NULL` rows: `0` in last audit) and `image_templates` remain untouched.

## 3. RLS & Authorization Review
- `profiles`, `conversations`, `messages`, `message_parts`, `attachments`: scoped strictly to `auth.uid()`.
- `model_usage`, `subscriptions`, `credit_transactions`: `SELECT` ONLY for `auth.uid() = user_id`; `INSERT`/`UPDATE`/`DELETE` restricted to backend `service_role`.

## 4. Must Be Verified Before Production Approval
1. Take a Supabase backup snapshot before running `001_clean_schema.sql`.
2. Apply `001_clean_schema.sql` in **staging** Supabase first.
3. Verify live PostgreSQL RLS enforcement using `SUPABASE_ANON_KEY` + two separate authenticated user JWTs.
