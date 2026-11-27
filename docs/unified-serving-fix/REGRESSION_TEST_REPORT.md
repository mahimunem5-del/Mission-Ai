# Regression Test Report — Unified Serving Fix

**Date**: 2026-11-26  
**Environment**: Local Development (`http://127.0.0.1:5003`) — *Staging: Not Configured; Production: Not Deployed*  

---

## 1. Test Execution Summary

| Suite / Command | Result | Details |
| :--- | :---: | :--- |
| **Frontend Vitest** (`npm --prefix chat-next test`) | ✅ **PASS** | 3 test files, **8 / 8 tests passed** (`historyAndModels.test.ts`, `uiMessageMapper.test.ts`, `universalRenderer.test.tsx`). |
| **TypeScript & Vite Production Build** (`npm --prefix chat-next run build`) | ✅ **PASS** | `tsc -b && vite build` succeeded cleanly in `20.02s`, producing `chat-next/dist/`. |
| **AI SDK v7 Streaming Tests** (`node server/tests/test_phase7d_ai_sdk.js`) | ✅ **PASS** | **6 / 6 passed, 0 failed** (verifies `/api/chat/ui-stream`, tool calling, web search, deep research, and abort handling). |
| **Legacy Backend Runner** (`npm --prefix server test`) | ⚠️ **20 PASS / 6 FAIL** | All 6 failures (`3–5`, `6`, `7`, `8`, `12`, `29`) are legacy test assertions against the intentionally removed `POST /api/chat/stream` endpoint (which now returns `404`). All active endpoints (`/api/health`, `/api/chat/compare`, `/api/history/conversations`, `/api/conversations`, rate limiter, cache, router) passed. |
| **Chromium E2E** (`http://127.0.0.1:5003`) | ✅ **PASS** | `/`, `/slides`, `/projects`, `/library`, `/vectorize`, `/create/svg/vectorize`, `#new-chat-btn`, browser refresh, `/api/templates` (`200`), and `/nonexistent-unknown-route` (`404`) all passed with **0 console errors** and **0 failed `/api/` calls**. |
