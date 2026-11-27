# Phase 13B — Integration Architecture Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Unified Routing Architecture (`server/src/index.js`)

| Route | Handler / Target | Purpose |
| :--- | :--- | :--- |
| `GET /` | `chat-next/dist/index.html` | **Primary Mestrio AI Chat Workspace** (React + TypeScript + AI SDK v7) |
| `GET /assets/*` | `express.static(chatNextDistDir, { index: false })` | React/Vite production bundles (`base: '/'` in `chat-next/vite.config.ts`) |
| `GET /chat-next*` | `302 Redirect -> /` | Legacy preview path cleanly redirects to primary `/` |
| `GET /classic`, `/legacy`, `/index.html` | `index.html` | Preserved original Mestrio AI UI |
| `GET /vectorize`, `/create/svg/vectorize` | `index.html` | Preserved SVG Vectorizer SPA route |
| `GET /slides`, `/projects`, `/library` | `index.html` | Preserved non-chat workspace routes |
| `/api/*` | Express API routers | Unified backend (`chat`, `compare`, `models`, `tools`, `history`, `profile`, `attachments`, `usage`, `files`, `transcribe`, `image`, `templates`) |

---

## 2. Files Modified in Phase 13

- [`chat-next/vite.config.ts`](file:///d:/Ai%20platform/chat-next/vite.config.ts#L6): Updated `base: '/chat-next/'` → `base: '/'`.
- [`chat-next/src/components/Sidebar.tsx`](file:///d:/Ai%20platform/chat-next/src/components/Sidebar.tsx#L91-L112): Replaced `<a href="/">Switch to Classic Workspace</a>` with a **Workspaces** switcher linking `/classic`, `/classic#slides-studio`, `/classic#projects`, `/classic#library`, and `/vectorize`.
- [`server/src/index.js`](file:///d:/Ai%20platform/server/src/index.js#L104-L143): Cut over `/` to `chat-next/dist/index.html`, added `302` redirect from `/chat-next*` to `/`, moved original `index.html` to `VALID_LEGACY_SPA_ROUTES`, and passed `{ index: false }` to both `express.static` middlewares so `/` never collides with `rootDir/index.html`.
