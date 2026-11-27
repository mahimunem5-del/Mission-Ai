# Serving Architecture Audit — Mestrio AI

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Root Cause of Dual-Server & Dual-Entry-Point Confusion

1. **Why Express (`server/src/index.js`) at `http://127.0.0.1:5003/` (or `:5001`) serves the New Chat correctly**:
   - `server/src/index.js` mounts `chat-next/dist` with `express.static(chatNextDistDir, { index: false })` and explicitly handles `GET /` by sending `chat-next/dist/index.html`.
   - It serves API routes (`/api/chat/ui-stream`, `/api/models`, `/api/tools`, `/api/history`, `/api/templates`, `/api/images`, etc.) ahead of frontend fallback handlers.
   - Its `GET *` handler serves root `index.html` **only** for `VALID_NON_CHAT_SPA_ROUTES` (`/create/svg/vectorize`, `/vectorize`, `/slides`, `/projects`, `/library`), returning `404` via `notFoundHandler` for unknown routes.

2. **Why `npx serve` at `http://localhost:3000/` served the old `index.html` with a blank main area**:
   - Root `package.json` previously defined `"serve": "npx serve -c serve.json . -p 3000"`, which served the **repository root (`.`)** instead of `chat-next/dist/` or the Express app.
   - Serving `.` caused `GET /` to serve root `index.html`—the internal legacy workspace host from which `#hero-section` and `#mobile-home-container` had been removed—resulting in a blank main content area and no `/api/*` backend.
   - `serve.json`, `vercel.json`, and `_redirects` only had rewrites for `/vectorize` and `/create/svg/vectorize` -> `/index.html`, with no routing for `/` -> `chat-next/dist/index.html`.

3. **Canonical Serving Architecture (Development & Production)**:
   - The Express application in `server/src/index.js` (also exported at `server/index.js`) is the **single canonical application server** for both local development and production.
   - `chat-next/` is a Vite + React 18 + TypeScript SPA built into `chat-next/dist/` (`tsc -b && vite build`, `base: '/'`).
   - Root `index.html` is strictly an internal workspace host for `/slides`, `/projects`, and `/library` (and locked-workspace guards for `/vectorize` / `/create/svg/vectorize`). It must never be served as `/`.

4. **Workspace Dependency Summary**:
   - **Mestrio Universal Chat (`/`)**: `chat-next/dist/index.html` (zero dependency on root `index.html` or root `src/`).
   - **Slides Studio (`/slides`), Projects (`/projects`), Library (`/library`)**: Hosted inside root `index.html`.
   - **Images Studio / Vectorizer (`/vectorize`, `/create/svg/vectorize`)**: Frozen & locked (`MESTRIO_WORKSPACES.images.locked = true` in `index.html`, governed by `WORKSPACE_LOCK.md`).
