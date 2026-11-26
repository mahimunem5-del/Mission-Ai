# Phase 12D — Production Deployment Readiness Report

**Date**: 2026-11-26  
**Status**: 🟡 **ARCHITECTURE DEFINED / NOT YET DEPLOYED**  

*(No production domain or hosting provider is invented or assumed; recommendations are grounded in the existing codebase.)*

---

## 1. Current Deployment Configuration Audit

| Component | Current State in Repo | Gap for Production |
| :--- | :--- | :--- |
| **Frontend Hosting (`/` & `/chat-next`)** | Express serves both `index.html` (`/`) and `chat-next/dist` (`/chat-next`) in `server/src/index.js`. `vercel.json` has only static rewrites for `/vectorize`. | Unified build / SPA routing not yet integrated; `chat-next/vite.config.ts` hardcodes `base: '/chat-next/'`. |
| **Express Backend Hosting** | Single-process Node.js (`server/src/index.js`, `PORT=5001`). Graceful `SIGTERM`/`SIGINT` shutdown implemented. | Load test (Phase 10) showed socket saturation at 500 concurrent requests on a single Node instance (371/500). Requires reverse proxy + multi-instance scaling. |
| **Environment Variables** | `server/.env` (local only, git-ignored). `DEV_BYPASS_AUTH` blocked in `NODE_ENV=production` (`config/env.js`). | Hosting secrets manager needed for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`, `MAHI_ENGINE_API_KEY`, `SERPER_API_KEY`, `UPSTASH_REDIS_REST_*`. |
| **CORS (`server/src/index.js`)** | Allows `localhost`/`127.0.0.1` only when `!config.isProd`; production requires `config.cors.allowedOrigins` (`CORS_ALLOWED_ORIGINS`). | Must set `CORS_ALLOWED_ORIGINS` to exact production `https://` origin(s). |
| **HTTPS & Reverse Proxy (SSE)** | Express runs plain HTTP locally (`127.0.0.1:5001`). | Production requires TLS termination (Nginx/Cloudflare/PaaS) with **proxy buffering disabled** (`X-Accel-Buffering: no` / `proxy_buffering off`) so AI SDK v7 SSE streams flush token-by-token. |
| **Supabase Connection** | Project `tacqsiocsqtffqxuwwta` connected; 9 tables + anonymous RLS verified. | Needs PgBouncer pooling for high concurrency, plus authenticated RLS & private `attachments` bucket. |
| **Logging, Errors & Health** | Structured JSON `logger.js` with secret redaction, `requestIdMiddleware`, `GET /health` & `GET /api/health`. | Ready for production monitoring. |

---

## 2. Recommended Production Architecture

```
Client Browser (HTTPS)
   │
   ▼
Edge / Reverse Proxy (TLS termination, CDN for static assets, proxy_buffering off for SSE)
   │
   ├──► Static SPA Assets (Unified React build + Frozen Image Workspace)
   │
   └──► Express API Cluster (2+ stateless Node.js instances, NODE_ENV=production)
           ├── Upstash Redis (shared pipelined rate limiting + cache)
           ├── OpenRouter / Mahi Engine / Serper (AI & search)
           └── Supabase (Auth + PostgreSQL 9 tables + Storage)
```

## 3. Rollback Strategy

- **Git**: `origin/main` (`fbe67cb`, `images-v1.0-frozen`) remains an intact rollback baseline.
- **Database**: `001_clean_schema.sql` is additive; rollback drops only the 6 new tables while preserving `conversations`, `messages`, and `image_templates`.
- **Deployment**: Keep `/api/chat/stream` alongside `/api/chat/ui-stream` until `/chat-next` integration is validated in staging.
