# Phase 11 — RLS Security Report

**Date**: 2026-11-26  
**Target Supabase Project**: `tacqsiocsqtffqxuwwta`  
**Status**: 🟡 **ANONYMOUS RLS VERIFIED (9/9 TABLES) / AUTHENTICATED USER A vs USER B ISOLATION BLOCKED**

---

## 1. Clear Status Separation

| Dimension | Category | Details |
| :--- | :--- | :--- |
| **`SUPABASE_ANON_KEY` Configured Locally** | ✅ **VERIFIED** | Configured in `server/.env` (length 46, distinct from `SUPABASE_SERVICE_ROLE_KEY`; never printed in logs or docs). |
| **Anonymous 9-Table RLS (`test_phase11_anon_rls.js`)** | ✅ **PASSED** | Tested using **publishable/anon key ONLY** (never `service_role`). All 8 private tables returned `0` rows on `SELECT` (hiding 14 live `conversations` and 75 live `messages`), rejected `INSERT` with `42501`, and affected `0` rows on `UPDATE`/`DELETE`. `image_templates` allowed public `SELECT` and rejected `INSERT`/`UPDATE`/`DELETE`. |
| **Image Workspace `templates` Bucket** | ✅ **VERIFIED** | `templates (public: true)` unchanged; `GET /api/templates` returns HTTP 200 `{"success":true,"templates":[],"data":[]}`. |
| **Authenticated User A / User B RLS Isolation** | 🔴 **BLOCKED** | Marked **BLOCKED** until Phase 12 because frontend Login/Signup is not implemented and real authenticated user sessions are unavailable. No test results fabricated. |
| **Private Attachment Storage Bucket & Policies** | 🔴 **BLOCKED / NOT IMPLEMENTED** | `service_role` `listBuckets()` shows only `templates (public: true)` — no private `attachments` bucket exists yet in Supabase Storage, and no storage policies are configured for private attachments. |

---

## 2. Anonymous RLS Test Results (`server/tests/test_phase11_anon_rls.js`)

Executed against live project `tacqsiocsqtffqxuwwta` using `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`:

| Table | Live Rows in DB | Anon `SELECT` | Anon `INSERT` | Anon `UPDATE` | Anon `DELETE` | Result |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `profiles` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `conversations` | **14** | **`0` rows** (14 hidden) | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `messages` | **75** | **`0` rows** (75 hidden) | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `message_parts` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `attachments` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `model_usage` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `subscriptions` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `credit_transactions` | 0 | `0` rows | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |
| `image_templates` | 0 | Allowed (`0` rows) | Rejected (`42501`) | `0` rows | `0` rows | ✅ **PASSED** |

---

## 3. Tests Required After Phase 12 Supabase Auth Integration (Currently BLOCKED)

Once real Login/Signup and Supabase Auth sessions are implemented in Phase 12, the following tests must be executed before production launch:

1. **Owner Read/Write Scope**: Authenticated User A can `SELECT`/`INSERT`/`UPDATE`/`DELETE` only User A's `conversations`, `messages`, `message_parts`, `attachments`, and `profiles`.
2. **Cross-User Denial (User B → User A)**: Authenticated User B receives `0` rows on `SELECT` and `0` affected rows / `42501` error on `INSERT`/`UPDATE`/`DELETE` against User A's records across all 8 private tables.
3. **Protected Billing & Usage Tables**: Authenticated User A can `SELECT` only User A's `model_usage`, `subscriptions`, and `credit_transactions`, and is rejected (`42501`) on `INSERT`/`UPDATE`/`DELETE`.
4. **Private Attachment Storage Bucket**: Create private `attachments` bucket (with user approval), apply `storage.objects` RLS (`bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]`), and verify cross-user & anonymous object download/upload denial.
