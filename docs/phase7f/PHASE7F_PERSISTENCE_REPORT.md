# Phase 7F — Persistence & Restoration Report (`PHASE7F_PERSISTENCE_REPORT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Persistence Matrix (Live vs Graceful Fallback)

| Entity | Live Supabase Status (`2026-11-26`) | Verification Status | Notes |
| :--- | :--- | :--- | :--- |
| **`conversations`** | **Persisted in Live PostgreSQL** | **Verified Live** | Verified via `POST /api/history/conversations` + direct Supabase query (`user_id` matched real Supabase Auth user) |
| **`messages`** | **Persisted in Live PostgreSQL** | **Verified Live** | Verified user + assistant messages persisted in `messages` table (`2` rows linked to `conversation_id`) |
| **`message_parts`** | Table missing (`404` schema cache) | **Fallback Verified** | [messagePartsRepository.js](file:///d:/Ai%20platform/server/src/database/repositories/messagePartsRepository.js) degrades gracefully; deterministic IDs verified in `test_phase6_5_persistence.js` |
| **`attachments`** | Table missing (`404` schema cache) | **Fallback Verified** | [attachmentsRepository.js](file:///d:/Ai%20platform/server/src/database/repositories/attachmentsRepository.js) degrades gracefully (`[]`); metadata persistence verified in `test_phase6_database.js` |
| **`profiles`** | Table missing (`404` schema cache) | **Fallback Verified** | [profilesRepository.js](file:///d:/Ai%20platform/server/src/database/repositories/profilesRepository.js) degrades gracefully; `/api/profile` `GET`/`PUT` verified in `test_phase6_5_persistence.js` |
| **`model_usage`** | Table missing (`404` schema cache) | **Fallback Verified** | [modelUsageRepository.js](file:///d:/Ai%20platform/server/src/database/repositories/modelUsageRepository.js) skips cleanly when table missing; null token/cost fidelity verified in `test_phase6_database.js` |

---

## 2. Refresh, Logout/Re-Login, and Conversation Restoration

Executed live against Express + Supabase Auth + live PostgreSQL (`DEV_BYPASS_AUTH=false`):
1. Created real Supabase Auth user (`User A`), signed in (`signInWithPassword`) to obtain JWT `tokenA1`.
2. Created conversation and saved user + assistant messages; verified rows directly in live `conversations` and `messages` tables.
3. Simulated logout and fresh login (`signInWithPassword`) to obtain new JWT `tokenA2`.
4. Called `GET /api/history/conversations/:id` with `tokenA2` -> returned `HTTP 200` with `messages.length === 2` in chronological order.
5. Cleaned up test conversation and temporary Supabase Auth users after verification.

*(Combined with Phase 7E browser `Page.reload` QA where `/chat-next` restored all `3` assistant messages in the UI via `useAISDKRuntime` + `useChat.setMessages`.)*

---

## 3. Manual Verification Required Post-Migration

After executing [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) in Supabase:
- [ ] Re-test `GET/PUT /api/profile`, `POST /api/history/conversations/:id/messages` (with `parts` and `attachments`), and a real chat completion (`model_usage`), confirming physical rows are written and read from `profiles`, `message_parts`, `attachments`, and `model_usage` with zero `Could not find the table ... in the schema cache` warnings.
