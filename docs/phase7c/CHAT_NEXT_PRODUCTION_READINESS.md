# `/chat-next` Production Readiness & Go/No-Go Recommendation (`CHAT_NEXT_PRODUCTION_READINESS.md`)

---

## Readiness Checklist

| Area | Status | Notes |
| :--- | :--- | :--- |
| **TypeScript & Vite Production Build** | **Ready** | `tsc -b && vite build` passes with 0 errors. |
| **Frontend Unit & Component Tests** | **Ready** | `chat-next` Vitest: 3 files, 8 tests passed. |
| **Backend Regression Suite** | **Ready** | `server/tests/runAllTests.js`: 26 passed, 0 failed. |
| **Auth, CORS, Secret Redaction** | **Ready** | `401` enforced on missing/expired tokens; 0 secrets in `chat-next/dist`. |
| **Real AI Streaming, Web Search, Deep Research** | **Ready** | Verified live with `openai/gpt-4o-mini` (`1,955 ms` first token). |
| **Supabase `001_clean_schema.sql` Migration** | **Pending** | Must be applied to staging & production Supabase before full `message_parts` / `attachments` / `model_usage` persistence. |
| **Live Browser Visual QA (Chrome)** | **Pending** | Blocked by missing Chrome `DevToolsActivePort` in current environment. |

---

## Go / No-Go Recommendation

- **Recommendation**: **CONDITIONAL GO for `/chat-next` parallel beta**, **NO-GO for replacing `/` (`index.html`) yet**.
- **Conditions to replace `/`**:
  1. Apply [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) to staging & production Supabase and verify live RLS with `SUPABASE_ANON_KEY`.
  2. Complete a 5-minute live browser visual QA pass on `/chat-next` (desktop + mobile) verifying Shiki, KaTeX, Mermaid, Recharts, file upload, and microphone permissions.
