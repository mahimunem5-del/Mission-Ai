# Phase 6.5 — Complete Persistence & Conversation Restoration Report

**Branch**: `cleanup-backend-restructure`

---

## 1. Files Changed

- **Repositories & DB**:
  - `server/src/database/repositories/conversationsRepository.js` — Added `hydrateConversationForUser(id, userId)` using batch queries (no N+1).
  - `server/src/database/repositories/messagePartsRepository.js` — Added deterministic part IDs (`deterministicPartId(messageId, partIndex)`) and batch `listPartsByMessageIds(messageIds)`.
  - `server/src/database/repositories/attachmentsRepository.js` — Added batch `listAttachmentsByConversation(conversationId, userId)`.
  - `server/src/db/dbService.js` — Added `{ includeMessages = true }` option to `getConversationById` so `hydrateConversationForUser` avoids duplicate message queries.
- **Controllers & Routes**:
  - `server/src/controllers/profileController.js` & `server/src/routes/profile.js` — `GET /api/profile`, `PUT /api/profile` (`profilesRepository.getProfileById`, `profilesRepository.upsertProfile`).
  - `server/src/controllers/attachmentsController.js` & `server/src/routes/attachments.js` — `GET /api/attachments` (`attachmentsRepository.listAttachmentsByUser`).
  - `server/src/controllers/usageController.js` & `server/src/routes/usage.js` — `GET /api/usage` (`modelUsageRepository.listUsageByUser`).
  - `server/src/controllers/historyController.js` & `server/src/routes/history.js` — Added `GET /api/history/conversations/:id/messages/:messageId/parts` (`messagePartsRepository.listPartsByMessage`).
  - `server/src/index.js` — Mounted `/api/profile`, `/api/attachments`, and `/api/usage` behind `requireAuth` + `generalRateLimiter`.
- **Tests**:
  - `server/tests/test_phase6_5_persistence.js` — Added end-to-end Phase 6.5 persistence, restoration, deduplication, and cross-user isolation tests.

---

## 2. Runtime Methods Connected

| Repository Method | Runtime Endpoint / Service |
| :--- | :--- |
| `profilesRepository.getProfileById` | `GET /api/profile` |
| `profilesRepository.upsertProfile` | `PUT /api/profile` |
| `messagesRepository.listByConversation` | `conversationsRepository.findByIdForUser` -> `GET /api/history/conversations/:id` |
| `messagePartsRepository.listPartsByMessage` | `GET /api/history/conversations/:id/messages/:messageId/parts` |
| `messagePartsRepository.listPartsByMessageIds` | `conversationsRepository.findByIdForUser` -> `GET /api/history/conversations/:id` |
| `attachmentsRepository.listAttachmentsByUser` | `GET /api/attachments` |
| `attachmentsRepository.listAttachmentsByConversation` | `conversationsRepository.findByIdForUser` -> `GET /api/history/conversations/:id` |
| `modelUsageRepository.listUsageByUser` | `GET /api/usage` |

---

## 3. Conversation Restoration Behavior

1. `conversationsRepository.findByIdForUser(id, userId)` first verifies conversation ownership via `getConversationById(id, userId, { includeMessages: false })`. If not found or not owned, returns `null` immediately.
2. Executes 3 flat queries (zero N+1):
   - `messagesRepository.listByConversation(conv.id)` (ordered `created_at ASC`)
   - `messagePartsRepository.listPartsByMessageIds(messageIds)` (ordered `part_index ASC`)
   - `attachmentsRepository.listAttachmentsByConversation(conv.id, userId)` (ordered `created_at ASC`)
3. Groups `parts` and `attachments` by `message_id` in memory, preserving original `role`, `content`, `type`, `metadata` (including `status: 'interrupted'` / `'failed'`), and timestamps.
4. Gracefully returns `parts: []` / `attachments: []` if `message_parts` or `attachments` tables are not yet migrated or if attachments are deleted.

---

## 4. Test Results (Executed After Final Edits)

- `node tests/test_cleanup_security.js`: **4 passed, 0 failed**
- `node tests/test_post_cleanup_architecture.js`: **7 passed, 0 failed**
- `node tests/test_phase6_database.js`: **3 passed, 0 failed**
- `node tests/test_phase6_5_persistence.js`: **2 passed, 0 failed**
- `npm test` (`tests/runAllTests.js`, `NODE_ENV=test`): **26 passed, 0 failed**

---

## 5. Remaining Database Migration Blockers

1. `server/src/database/migrations/001_clean_schema.sql` has **not yet been applied** to live Supabase (per strict instruction). Until applied, `profiles`, `message_parts`, `attachments`, and `model_usage` operate in graceful fallback mode.
2. Live PostgreSQL RLS verification using `SUPABASE_ANON_KEY` + two real Supabase Auth test users remains pending until `001_clean_schema.sql` is applied in staging.
