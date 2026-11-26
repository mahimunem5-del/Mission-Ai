# Phase 10 — Implementation Plan (`PHASE10_IMPLEMENTATION_PLAN.md`)

**Branch**: `cleanup-backend-restructure`

---

## Planned Optimizations

1. **Backend Rate-Limit Pipelining ([rateLimit.js](file:///d:/Ai%20platform/server/src/middleware/rateLimit.js))**:
   - Pipeline `incr` + `ttl` in a single Upstash Redis HTTP request, issuing `expire` only when `ttl < 0`.
2. **AI SDK v7 Stream Lifecycle & Observability ([uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js))**:
   - Add `STREAM_MAX_DURATION_MS` (`120000ms` default) timeout guard with `AbortController`.
   - Track `activeStreams` via `getActiveStreamCount()` and decrement/clean up all socket listeners + timers in `finally`.
   - Log structured operational metrics (`requestId`, `userId`, `provider`, `requestedModel`, `resolvedModel`, `activeStreams`, `durationMs`, `status`, `errorCategory`) without secrets or raw message contents.
3. **Request Validation ([validate.js](file:///d:/Ai%20platform/server/src/middleware/validate.js))**:
   - Validate `enabledTools` (`Array`, max `20` entries, `^[a-zA-Z0-9_\-]+$` <= `64` chars).
4. **Frontend Performance & Stability ([ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx))**:
   - Extract `React.memo(MessageRow)` to isolate completed Markdown/KaTeX/CodeBlock/Chart renders from composer input state.
   - Add `sendingLockRef` duplicate-submission guard in `handleSend`.
   - Use `'auto'` scroll during streaming and `'smooth'` only on completed/new message boundaries.
5. **Verification**:
   - Controlled concurrent load tests (`10`, `25`, `50`, `100` concurrent requests + `500` burst stress test on non-LLM endpoints and mocked/controlled stream concurrency).
   - Security & failure tests (oversized payloads, invalid tools, rate-limit violations, timeouts, client disconnects, cross-user isolation).
   - Full backend, frontend, TypeScript, Vite build, and live Chromium E2E checks.
