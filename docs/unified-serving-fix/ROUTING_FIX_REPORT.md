# Routing & Script Fix Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Changes Applied

| File | Change | Purpose |
| :--- | :--- | :--- |
| `package.json` | Replaced `"serve": "npx serve -c serve.json . -p 3000"` with `"serve": "npm --prefix server start"` and added `"build": "npm --prefix chat-next run build"`. | Eliminates the obsolete static-server entry point on port `3000` so developers cannot accidentally launch root `index.html` as the main website. |
| `server/src/index.js` | Added explicit `app.get('/index.html', (req, res) => res.redirect(302, '/'))` route guard. | Ensures direct `/index.html` requests never fall through to root `index.html` and always resolve to the canonical `chat-next` homepage. |
| `chat-next/` & `WORKSPACE_LOCK.md` files | **Unchanged** | Preserved zero-touch protection on `chat-next/`, `/api/chat/ui-stream`, and all frozen Image Workspace files. |

---

## 2. Verified Route Behavior (`http://127.0.0.1:5003`)

| Route | HTTP Status | Served App / Behavior |
| :--- | :---: | :--- |
| `GET /` | `200` | Serves `chat-next/dist/index.html` (**Mestrio Universal Chat**) |
| `GET /slides` | `200` | Serves `index.html` -> activates `#slides-studio-workspace` |
| `GET /projects` | `200` | Serves `index.html` -> activates `#projects-workspace` |
| `GET /library` | `200` | Serves `index.html` -> activates `#library-workspace` |
| `GET /vectorize` | `200` -> `/` | Serves `index.html` -> blocked by `WORKSPACE_LOCK.md` (`images.locked = true`) -> redirects to `/` |
| `GET /create/svg/vectorize` | `200` -> `/` | Serves `index.html` -> blocked by `WORKSPACE_LOCK.md` (`images.locked = true`) -> redirects to `/` |
| `GET /nonexistent-unknown-route` | `404` | Handled by Express `notFoundHandler` (proper JSON 404, no blank legacy fallback) |
| `GET /api/templates` | `200` | Returns JSON template catalog |
| `POST /api/chat/ui-stream` | `200` | Authoritative Vercel AI SDK v7 UI stream endpoint |
