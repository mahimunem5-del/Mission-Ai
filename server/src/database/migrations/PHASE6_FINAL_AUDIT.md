# Phase 6 Final Pre-Migration Audit (`PHASE6_FINAL_AUDIT.md`)

**Branch**: `cleanup-backend-restructure`  
**Audit Type**: Read-only pre-migration audit (zero SQL executed against production, zero data modified).

---

## 1. Existing Data Audit

Inspected live Supabase via `getSupabaseClient()` (`conversations`, `messages`, `image_templates`):

| Table | Live Row Count | `user_id IS NULL` Rows | Notes |
| :--- | :--- | :--- | :--- |
| `conversations` | 0 | 0 | Schema: `id, title, model_id, mode, project_id, user_id, created_at, updated_at` |
| `messages` | 0 | N/A | Schema: `id, conversation_id, role, content, type, metadata, created_at` |
| `image_templates` | 0 | N/A | Preserved untouched |
| `profiles`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions` | Not yet created | N/A | Pending `001_clean_schema.sql` |

**Safe Recovery Strategy (if unowned rows appear before migration)**:
- `001_clean_schema.sql` does not force `ALTER TABLE conversations ALTER COLUMN user_id SET NOT NULL` and does not auto-assign ownership.
- Any `user_id IS NULL` rows remain intact in the database and hidden from `auth.uid() = user_id` RLS policies until explicitly claimed or archived by an administrator.

---

## 2. Schema Compatibility & Execution Order

- **Existing Tables (`conversations`, `messages`, `image_templates`)**:
  - `001_clean_schema.sql` uses `CREATE TABLE IF NOT EXISTS`, so existing tables and rows are untouched.
  - Note: Existing `conversations.user_id` in live DB was created without an `auth.users(id)` foreign key (`schema.sql`), and `CREATE TABLE IF NOT EXISTS` will preserve that non-destructively.
- **New Tables (`profiles`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions`)**:
  - Dependency order is valid: `profiles` -> `conversations` -> `messages` -> `message_parts` -> `attachments` -> `model_usage` -> `subscriptions` -> `credit_transactions` -> `image_templates`.
  - Policy names on `conversations` and `messages` match `schema.sql` and use `DROP POLICY IF EXISTS` + `CREATE POLICY`, avoiding policy conflicts.
  - **Dev Bypass FK Caveat**: `attachments.user_id`, `profiles.id`, `subscriptions.user_id`, and `credit_transactions.user_id` reference `auth.users(id)`. In local dev with `DEV_BYPASS_AUTH=true` (`00000000-0000-0000-0000-000000000000`), inserting into `attachments` will fail FK validation unless a real Supabase Auth user is used (`usageService.js` already skips DB persistence for the dev bypass UUID).

---

## 3. RLS Verification

- **Verified in `001_clean_schema.sql`**:
  - `ENABLE ROW LEVEL SECURITY` on all 9 tables.
  - `profiles`, `conversations`, `messages`, `message_parts`, `attachments`: scoped to `auth.uid()`.
  - `model_usage`, `subscriptions`, `credit_transactions`: `SELECT` ONLY for `auth.uid() = user_id` (no `INSERT`/`UPDATE`/`DELETE` policies for normal users; server writes via `service_role`).
  - `image_templates`: public `SELECT` only; writes restricted to server `service_role`.
- **Verified at API/Application Layer**:
  - `historyController.js` + `requireAuth` + `conversationsRepository` tested with two distinct user JWTs (`userA` vs `userB`); cross-user `GET` and `POST .../messages` return `404`.
- **NOT Yet Verified (Blocker)**:
  - Live PostgreSQL RLS enforcement using `SUPABASE_ANON_KEY` + two separate Supabase Auth user JWTs could **not** be executed because `001_clean_schema.sql` has not been applied to live Supabase and `SUPABASE_ANON_KEY` is not configured in `server/.env`.

---

## 4. Runtime Persistence Verification

### Connected Repository Methods
- `conversationsRepository`: `listByUser`, `findByIdForUser`, `upsertForUser`, `deleteForUser` (`historyController.js`)
- `messagesRepository`: `createMessage` (`historyController.js`)
- `messagePartsRepository`: `saveMessageParts` (`historyController.js`)
- `attachmentsRepository`: `createAttachment` (`historyController.js`)
- `modelUsageRepository`: `recordModelUsage` (`usageService.js` <- `aiOrchestrator.js`)

### Implemented but Not Yet Connected to Runtime Routes
- `profilesRepository.getProfileById`, `profilesRepository.upsertProfile` (no `/api/profile` route yet)
- `messagesRepository.listByConversation` (`dbService.getConversationById` queries `messages` directly)
- `messagePartsRepository.listPartsByMessage` (`getConversationById` does not yet hydrate `message_parts` on restore)
- `attachmentsRepository.listAttachmentsByUser` (no `/api/attachments` route yet)
- `modelUsageRepository.listUsageByUser` (no `/api/usage` route yet)

### Stream Interruption & Error Safety
- `POST /api/chat/stream` does not write partial assistant rows mid-stream. Client aborts trigger `AbortController` via `sseStream.js` without persisting incomplete assistant messages.

---

## 5. Migration Safety & Rollback

- **Backup Requirement**: Take a Supabase automated backup / `pg_dump` snapshot before executing `001_clean_schema.sql`.
- **Expected Changes**: Creates 6 new tables (`profiles`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions`), 8 indexes, and idempotent RLS policies.
- **Rollback Limitations**: Dropping newly created tables (`DROP TABLE IF EXISTS credit_transactions, subscriptions, model_usage, attachments, message_parts, profiles;`) is clean if no production traffic has written to them; after production writes begin, rollback would lose data in those 6 tables.

---

## 6. Remaining Blockers & Production Migration Checklist

### Remaining Blockers
1. `001_clean_schema.sql` has not yet been applied to staging/production Supabase.
2. Live Supabase RLS verification with `SUPABASE_ANON_KEY` and two real Supabase Auth test users has not yet been executed.
3. `message_parts` hydration on conversation restore (`getConversationById`) is not yet wired.

### Production Migration Checklist
- [ ] Export/verify Supabase backup before running migration.
- [ ] Run `server/src/database/migrations/001_clean_schema.sql` in **staging** Supabase SQL Editor first.
- [ ] Verify all 9 tables, indexes, and RLS policies exist in staging.
- [ ] Test cross-user read/write rejection and billing/usage write rejection using `SUPABASE_ANON_KEY` + two real Supabase Auth user JWTs.
- [ ] Run `server/src/database/migrations/001_clean_schema.sql` in **production** Supabase SQL Editor.
- [ ] Verify `GET /api/health` reports `database.connected: true` and `NODE_ENV=production` with `DEV_BYPASS_AUTH` unset/`false`.
