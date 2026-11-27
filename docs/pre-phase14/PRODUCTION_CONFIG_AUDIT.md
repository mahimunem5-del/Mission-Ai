# Pre-Phase 14 — Production Configuration Audit

**Audit Date:** 2026-11-27  
**Canonical Architecture:** Express (`server/src/index.js`) serving unified React SPA (`chat-next/dist/index.html`) + `/api/*` endpoints

---

## 1. Inspected Configuration Files

| File | Current State | Assessment |
| :--- | :--- | :--- |
| [`package.json`](file:///d:/Ai%20platform/package.json) | `start` and `serve` run `npm --prefix server start`; `build` runs `npm --prefix chat-next run build` | **ALIGNED** with unified Express + `chat-next/dist` serving |
| [`server/package.json`](file:///d:/Ai%20platform/server/package.json) | Express modular monolith (`ai: ^7.0.183`, `@openrouter/ai-sdk-provider: ^3.1.0`, `@supabase/supabase-js: ^2.117.2`); unused `jimp`/`potrace`/`image-q` removed | **ALIGNED** |
| [`chat-next/package.json`](file:///d:/Ai%20platform/chat-next/package.json) | Vite + React 18 + TS (`@ai-sdk/react: ^4.0.188`, `ai: ^7.0.183`, `vitest`) | **ALIGNED** |
| [`server/src/index.js`](file:///d:/Ai%20platform/server/src/index.js) | Serves `chat-next/dist/index.html` for `/`, `/images`, `/slides`, `/projects`, `/library`; redirects `/index.html` -> `302 /`; returns `404` for `/vectorize` & `/create/svg/vectorize` | **ALIGNED** |
| [`vercel.json`](file:///d:/Ai%20platform/vercel.json) | Contains stale rewrites for `/create/svg/vectorize` and `/vectorize` -> `/index.html` | **STALE / INCOMPATIBLE** — `index.html` was deleted and Vectorize was removed |
| [`serve.json`](file:///d:/Ai%20platform/serve.json) | Sets `"public": "."` and rewrites `/create/svg/vectorize` & `/vectorize` -> `/index.html` | **STALE / INCOMPATIBLE** — serving `.` has no `index.html` and no `/api/*` backend |

---

## 2. Required Configuration Changes (Before Production Hosting)

1. **Remove or Replace `serve.json`**: Root static serving via `serve` is obsolete because `package.json` `"serve"` already delegates to `npm --prefix server start`. Delete `serve.json` (or update `"public": "chat-next/dist"` only if a static-only preview is ever needed without `/api/*`).
2. **Update or Remove `vercel.json`**: Remove the dead `/vectorize` and `/create/svg/vectorize` -> `/index.html` rewrites. Note that hosting on static Vercel alone will not run `server/src/index.js` without configuring Vercel serverless/Node hosting or deploying the Express backend separately (e.g., Render/Railway/Fly/VPS) behind a reverse proxy.
3. **Production Environment Variables**: Ensure `NODE_ENV=production` and `DEV_BYPASS_AUTH=false` in staging/production so `requireAuth` strictly enforces Supabase JWTs.
