# Phase 10 — Performance & Reliability Audit (`PHASE10_PERFORMANCE_AUDIT.md`)

**Branch**: `cleanup-backend-restructure`  
**Target**: `/chat-next` + Vercel AI SDK v7 Backend

---

## 1. Baseline Measurements (Before Optimization)

Measured via `phase10_baseline_audit.mjs` on local staging Express server + OpenRouter `openai/gpt-4o-mini`:

| Metric | Baseline Measurement |
| :--- | :--- |
| **OpenRouter `openai/gpt-4o-mini` TTFT** | `1786 ms` |
| **OpenRouter `openai/gpt-4o-mini` Total Stream Time** | `1796 ms` |
| **`/api/models` (10 concurrent)** | `ok: 10/10`, `p50: 14ms`, `p95: 14ms`, `p99: 14ms` |
| **`/api/models` (25 concurrent)** | `ok: 25/25`, `p50: 18ms`, `p95: 19ms`, `p99: 19ms` |
| **`/api/models` (50 concurrent)** | `ok: 50/50`, `p50: 30ms`, `p95: 31ms`, `p99: 32ms` |
| **`/api/models` (100 concurrent)** | `ok: 100/100`, `p50: 53ms`, `p95: 57ms`, `p99: 58ms` |
| **`/api/tools` (50 concurrent)** | `ok: 50/50`, `p50: 16ms`, `p95: 18ms`, `p99: 19ms` |
| **Process Memory (Idle/Baseline)** | `rss: 156 MB`, `heapUsed: 49 MB` |

---

## 2. Identified Bottlenecks & Reliability Gaps

1. **Sequential Redis Round-Trips in Rate Limiter ([rateLimit.js](file:///d:/Ai%20platform/server/src/middleware/rateLimit.js))**:
   - Executed up to 3 sequential Upstash REST calls (`incr` -> `expire` -> `ttl`) per rate-limited request, adding avoidable network latency under concurrent traffic.
2. **Stream Timeout & Listener Cleanup in AI SDK Orchestrator ([uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js))**:
   - Lacked a hard maximum stream execution timeout (`maxDurationMs`) to abort hung upstream provider connections.
   - Attached `req.on('aborted', ...)` and `res.on('close', ...)` listeners without `finally` cleanup.
   - Lacked an `activeStreams` gauge for concurrency observability.
3. **Missing `enabledTools` Input Validation ([validate.js](file:///d:/Ai%20platform/server/src/middleware/validate.js))**:
   - `validateChatRequest` validated `messages`, `model`, `searchMode`, and `systemPrompt`, but did not cap or sanitize `enabledTools` array length/characters.
4. **Frontend Re-Render & Scroll Fighting ([ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx))**:
   - Composer typing or menu toggles re-rendered the entire `universalMessages.map(...)` list instead of memoized message rows.
   - Smooth scrolling ran on every state change rather than immediate `'auto'` during active token streaming.
   - Lacked a synchronous ref lock (`sendingLockRef`) to prevent rapid double-send clicks.
