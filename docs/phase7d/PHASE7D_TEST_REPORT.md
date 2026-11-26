# Phase 7D — Test Report (`PHASE7D_TEST_REPORT.md`)

---

## 1. Backend AI SDK v7 Real API & Integration Suite (`server/tests/test_phase7d_ai_sdk.js`)
**Result**: **6 passed, 0 failed**
1. Provider registry preserves `requestedModel`, `resolvedModel`, and `provider` identity — **PASSED**
2. Missing and expired tokens rejected with `401` on `/api/chat/ui-stream` — **PASSED**
3. Real `openai/gpt-4o-mini` streaming via OpenRouter AI SDK v7 (`text-delta`, `data-status`, `data-usage`) — **PASSED** (`firstToken=1725ms`, `total=1780ms`)
4. Real `mahi-engine` streaming via `@ai-sdk/openai-compatible` (`text-delta`, `data-status`) — **PASSED**
5. Web search (`4` sources) and Deep Research (`15` sources, `data-status`, `data-sources`) on `/api/chat/ui-stream` — **PASSED**
6. Client `AbortController` cancels upstream AI SDK v7 stream cleanly — **PASSED**

## 2. Backend Regression Suite (`cd server && npm test`, `NODE_ENV=test`)
**Result**: **26 passed, 0 failed** (`tests/runAllTests.js` — legacy `/api/chat/stream`, `/api/chat/compare`, history, rate limiting, Redis cache, secret redaction).

## 3. Frontend Unit Tests (`cd chat-next && npm test`)
**Result**: **3 test files passed, 6 tests passed, 0 failed** (`uiMessageMapper.test.ts`, `historyAndModels.test.ts`, `universalRenderer.test.tsx`).

## 4. Secret Scan of `chat-next/dist`
**Result**: **0 leaked secrets** (`service_role`, `eyJhbGci`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `MAHI_ENGINE_API_KEY`).
