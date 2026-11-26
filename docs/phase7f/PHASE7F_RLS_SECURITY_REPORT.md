# Phase 7F — PostgreSQL RLS & Security Report (`PHASE7F_RLS_SECURITY_REPORT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Summary of Verification Scope

This report strictly separates **tests actually executed in Phase 7F** from **database-level RLS tests that require manual execution** after [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) is applied and `SUPABASE_ANON_KEY` is configured.

---

## 2. Executed & Verified Security Checks

1. **Static Policy Audit of `001_clean_schema.sql`** — **VERIFIED**:
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` present for all 9 tables.
   - `profiles`: `SELECT`, `INSERT`, `UPDATE` scoped to `auth.uid() = id`.
   - `conversations`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` scoped to `auth.uid() = user_id`.
   - `messages`: `SELECT`, `INSERT`, `DELETE` scoped via parent `conversations.user_id = auth.uid()`.
   - `message_parts`: `SELECT`, `INSERT` scoped via `messages -> conversations.user_id = auth.uid()`.
   - `attachments`: `FOR ALL` scoped to `auth.uid() = user_id`.
   - `model_usage`, `subscriptions`, `credit_transactions`: `SELECT` ONLY for `auth.uid() = user_id`; no `INSERT`/`UPDATE`/`DELETE` policies for normal users (mutations restricted to backend `service_role`).
   - `image_templates`: public `SELECT` (`USING (true)`); writes restricted to `service_role`.

2. **Live API / Application-Layer Isolation (`User A` vs `User B` Real Supabase Auth JWTs)** — **VERIFIED**:
   - Created two real temporary Supabase Auth accounts via `supabase.auth.admin.createUser`, signed both in via `signInWithPassword`, and ran with `DEV_BYPASS_AUTH=false`:
     - Unauthenticated `GET /api/history/conversations` -> `401`.
     - Cross-user `GET /api/history/conversations/:id` (`User B` requesting `User A`'s conversation) -> `404`.
     - Cross-user `DELETE /api/history/conversations/:id` leaves `User A`'s conversation intact in Supabase via `.eq('user_id', userId)`. *(Minor API consistency note: [historyController.js](file:///d:/Ai%20platform/server/src/controllers/historyController.js#L133-L145) returns `200 { success: true, deleted: true }` when 0 rows match instead of `404`.)*
   - Also verified in `test_phase6_5_persistence.js`: unauthenticated `/api/profile`, `/api/attachments`, `/api/usage` return `401`, and cross-user `/api/history/conversations/:id/messages/:messageId/parts` returns `404`.

3. **Live PostgREST Owner JWT Check (Pre-Migration)** — **VERIFIED (CONFIRMS MIGRATION NEEDED)**:
   - Queried live `conversations` via PostgREST using `User A`'s real Supabase Auth JWT (`Authorization: Bearer <tokenA>`).
   - Observed result: `HTTP 200, rows=0` even for `User A`'s own conversation (`user_id = userAId`).
   - **Conclusion**: `conversations` currently has RLS enabled in live Supabase **without** the `001_clean_schema.sql` `SELECT` policy active for `authenticated` users. Backend operations currently succeed only via `SUPABASE_SERVICE_ROLE_KEY` + application-layer `user_id` filtering.

4. **Supabase Storage Policy Check** — **VERIFIED**:
   - Live bucket `templates` is `public: true` (for `image_templates` only).
   - Chat `attachments` currently persist metadata only (`attachments` table); no user attachment Storage bucket is used yet, so no private user Storage bucket exposure exists.

---

## 3. Tests Requiring Manual Execution (After Migration + `SUPABASE_ANON_KEY`)

Because `001_clean_schema.sql` has not been applied to live Supabase and `SUPABASE_ANON_KEY` is not set in `server/.env`, **full database-level PostgreSQL RLS verification across all 9 tables is NOT YET COMPLETE** and must be executed manually in staging/production after applying `001_clean_schema.sql`:

- [ ] **Anonymous (`anon`) Access Test**: Using `SUPABASE_ANON_KEY` with no user JWT, verify `SELECT`/`INSERT`/`UPDATE`/`DELETE` on `profiles`, `conversations`, `messages`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions` return `0` rows or `401`/`42501` rejection, while `image_templates` `SELECT` is allowed.
- [ ] **Owner CRUD Test (`User A` JWT + `SUPABASE_ANON_KEY`)**: Verify `User A` can `SELECT`/`INSERT`/`UPDATE`/`DELETE` own `profiles`, `conversations`, `messages`, `message_parts`, and `attachments`.
- [ ] **Cross-User Isolation Test (`User B` JWT + `SUPABASE_ANON_KEY`)**: Verify `User B` gets `0` rows on `SELECT`/`UPDATE`/`DELETE` and `42501` RLS rejection on `INSERT` targeting `User A`'s `user_id` or `conversation_id`.
- [ ] **Billing & Usage Write Protection Test (`User A` JWT + `SUPABASE_ANON_KEY`)**: Verify `User A` can `SELECT` own rows in `model_usage`, `subscriptions`, `credit_transactions`, and receives `42501` RLS rejection on `INSERT`/`UPDATE`/`DELETE`.
