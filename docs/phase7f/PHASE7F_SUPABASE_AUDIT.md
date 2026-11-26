# Phase 7F — Supabase Migration Audit (`PHASE7F_SUPABASE_AUDIT.md`)

**Branch**: `cleanup-backend-restructure`  
**Migration File**: [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql)  
**Migration Execution Status**: **NOT APPLIED** (Requires manual execution in Supabase Dashboard SQL Editor — no `DATABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `supabase` CLI, or `psql` is available in this environment)

---

## 1. Live Supabase Schema Inspection (`2026-11-26`)

Inspected live Supabase project via `@supabase/supabase-js` (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`):

| Table | Live Status | Live Row Count | Notes |
| :--- | :--- | :--- | :--- |
| `conversations` | **EXISTS** (`HTTP 206`) | `5` (`user_id IS NULL`: `0`) | Created from legacy [schema.sql](file:///d:/Ai%20platform/server/src/db/schema.sql) |
| `messages` | **EXISTS** (`HTTP 206`) | `39` | Created from legacy [schema.sql](file:///d:/Ai%20platform/server/src/db/schema.sql) |
| `image_templates` | **EXISTS** (`HTTP 200`) | `0` | Frozen Image Workspace table; preserved |
| `profiles` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.profiles' in the schema cache` |
| `message_parts` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.message_parts' in the schema cache` |
| `attachments` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.attachments' in the schema cache` |
| `model_usage` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.model_usage' in the schema cache` |
| `subscriptions` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.subscriptions' in the schema cache` |
| `credit_transactions` | **MISSING** (`HTTP 404`) | N/A | `Could not find the table 'public.credit_transactions' in the schema cache` |

**Storage Buckets**:
- `[{"id":"templates","name":"templates","public":true}]` — Used by [templateService.js](file:///d:/Ai%20platform/server/src/services/templateService.js) for `image_templates`. No chat attachments Storage bucket exists yet.

---

## 2. Migration Compatibility & Safety Review

- **Non-Destructive & Repeatable**:
  - Uses `CREATE TABLE IF NOT EXISTS` for all 9 tables and `CREATE INDEX IF NOT EXISTS` for all 8 indexes.
  - Contains **zero** `DROP TABLE`, `TRUNCATE`, or destructive `ALTER` statements.
  - RLS policies use `DROP POLICY IF EXISTS` followed by `CREATE POLICY`, making the script idempotent on re-run.
- **Preservation of Existing Data**:
  - Existing `conversations` (`5` rows, `0` with `user_id IS NULL`), `messages` (`39` rows), and `image_templates` (`0` rows) are preserved untouched.
  - Note: Existing `conversations.user_id` in live DB was created without an `auth.users(id)` FK (`schema.sql`), and `CREATE TABLE IF NOT EXISTS` preserves that non-destructively.
- **Dependency Order**:
  - Valid execution order: `profiles` -> `conversations` -> `messages` -> `message_parts` -> `attachments` -> `model_usage` -> `subscriptions` -> `credit_transactions` -> `image_templates`.
- **Minor Caveat**:
  - `DEV_BYPASS_AUTH=true` uses synthetic user ID `00000000-0000-0000-0000-000000000000`, which does not exist in `auth.users(id)` and will fail FK constraints on `profiles`, `attachments`, `subscriptions`, and `credit_transactions` if tested locally with `DEV_BYPASS_AUTH=true` (production blocks `DEV_BYPASS_AUTH=true` at startup).

---

## 3. Exact SQL Execution Instructions (Supabase Dashboard)

1. **Create Backup Snapshot**:
   - Open Supabase Dashboard -> **Database** -> **Backups** and confirm/trigger a pre-migration snapshot.
2. **Run in Staging First (Recommended), Then Production**:
   - Open Supabase Dashboard -> **SQL Editor** -> **New query**.
   - Copy the full contents of [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) and execute it.
3. **Verify Post-Migration Schema**:
   Run this verification query in the SQL Editor:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN (
       'profiles', 'conversations', 'messages', 'message_parts',
       'attachments', 'model_usage', 'subscriptions', 'credit_transactions', 'image_templates'
     )
   ORDER BY tablename;
   ```
   Confirm all 9 tables appear with `rowsecurity = true`.
4. **Configure `SUPABASE_ANON_KEY`**:
   - Add `SUPABASE_ANON_KEY` to staging/verification environment (kept separate from `SUPABASE_SERVICE_ROLE_KEY`) and execute the live PostgreSQL RLS verification tests documented in [PHASE7F_RLS_SECURITY_REPORT.md](file:///d:/Ai%20platform/docs/phase7f/PHASE7F_RLS_SECURITY_REPORT.md).
