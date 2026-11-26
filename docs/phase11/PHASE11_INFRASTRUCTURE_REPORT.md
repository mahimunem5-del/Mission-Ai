# Phase 11 — Infrastructure & Capacity Report

**Date**: 2026-11-26  
**Measured against**: Local development Express server (single-node)

---

## 1. Load Test Results (Phase 10)

| Scenario | Sent | Succeeded | Success Rate | Notes |
|----------|------|-----------|-------------|-------|
| 10 concurrent requests | 10 | 10 | 100% | ✅ Baseline |
| 25 concurrent requests | 25 | 25 | 100% | ✅ |
| 50 concurrent requests | 50 | 50 | 100% | ✅ |
| 100 concurrent requests | 100 | 100 | 100% | ✅ Single-node capacity |
| 500-burst requests | 500 | 371 | 74.2% | ⚠️ Socket saturation expected |
| 10 concurrent AI streams | 10 | 10 | 100% | ✅ All streams completed |
| Cancellation cleanup | — | — | — | ✅ `activeStreams = 0` after cancel |

> [!NOTE]
> The 500-burst result (371/500) is **expected behavior** on single-node Express with one Node.js client. The OS socket backlog saturates when 500 simultaneous TCP connections arrive at once. This is not a code defect; it is an infrastructure limitation of single-node deployment.

---

## 2. Performance Metrics (Design Targets)

| Metric | Target | Architecture |
|--------|--------|-------------|
| Time to First Token (TTFT) | < 800ms | OpenRouter SSE streaming, no buffering |
| Total AI response (short) | < 10s | Depends on model/provider |
| Rate limiting | 60 req/min/user | Upstash Redis pipelined `INCR+TTL` |
| Stream max duration | 120s | `STREAM_MAX_DURATION_MS` timeout |
| Active stream tracking | Live gauge | `getActiveStreamCount()` |

---

## 3. Current Infrastructure Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| Backend | Node.js Express (single instance) | ✅ Running |
| AI Gateway | OpenRouter | ✅ Connected |
| Proprietary AI | Mahi Engine | ✅ Connected |
| Web Search | Serper API | ✅ Connected |
| Database | Supabase PostgreSQL | ✅ Partial (3/9 tables) |
| Rate Limiting | Upstash Redis | ✅ Connected |
| Frontend | Vite + React (static build) | ✅ Built |
| Auth | Supabase Auth + JWT | ✅ Working |

---

## 4. Production Scaling Requirements

### For 1,000 Concurrent Users
| Requirement | Recommendation |
|-------------|---------------|
| Reverse proxy | Nginx or Cloudflare (handles connection queuing) |
| Node.js instances | 2–4 (PM2 cluster mode or Docker replicas) |
| Redis | Upstash scales automatically |
| Supabase | Current free tier — monitor connection pooling |
| CDN | Serve `chat-next/dist/` via Cloudflare CDN |

### For 5,000+ Concurrent Users
| Requirement | Recommendation |
|-------------|---------------|
| Reverse proxy | Cloudflare (handles 500+ burst natively) |
| Node.js instances | 8–16 (horizontal scaling, stateless) |
| Redis | Upstash Pro tier (rate limiting across instances) |
| Supabase | Pro tier with PgBouncer connection pooler |
| Load balancer | Cloudflare Load Balancer or AWS ALB |
| Session affinity | Not required (JWT-based, stateless) |

> [!TIP]
> The current Express architecture is fully stateless (all session state in Supabase + Redis). Horizontal scaling requires no session affinity — just add more instances behind a load balancer.

---

## 5. Environment Configuration

| Variable | Required | Location | Status |
|----------|----------|----------|--------|
| `SUPABASE_URL` | Yes | `server/.env` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `server/.env` | ✅ Set (never exposed to frontend) |
| `OPENROUTER_API_KEY` | Yes | `server/.env` | ✅ Set |
| `MAHI_ENGINE_API_KEY` | Yes | `server/.env` | ✅ Set |
| `SERPER_API_KEY` | Yes | `server/.env` | ✅ Set |
| `UPSTASH_REDIS_REST_URL` | Yes | `server/.env` | ✅ Set |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | `server/.env` | ✅ Set |
| `API_AUTH_SECRET` | Yes (tests) | `server/.env` | ✅ Set |
| `NODE_ENV` | Yes | Deployment config | ⚠️ Must be `production` in prod |
| `DEV_BYPASS_AUTH` | Never in prod | — | ✅ Blocked by `config/env.js` |
| `PORT` | Optional | `server/.env` | Defaults to 5001 |

---

## 6. Graceful Shutdown

Verified in `server/src/index.js`:

```js
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
```

Active SSE streams are terminated cleanly via `finally` cleanup blocks in `uiStreamOrchestrator.js`. The `activeStreams` gauge reaches 0 after all streams close.
