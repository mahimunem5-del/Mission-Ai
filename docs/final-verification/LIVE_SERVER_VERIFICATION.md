# Live Server Verification — Mestrio AI

- **Target Live URL:** `http://127.0.0.1:5001`
- **Branch:** `cleanup-backend-restructure`
- **Verification Date:** 2026-11-27

## 1. Port 5001 Process Identity

- **Listening Address:** `0.0.0.0:5001` (`Listen`)
- **Owning PID:** `9700`
- **Executable / Command Line:** `node.exe` — `node src/index.js` (started from `server/`)
- **Status:** Confirmed single active Express server serving `chat-next/dist/index.html`.

## 2. Served Build Identity

Comparing `D:\Ai platform\chat-next\dist\index.html` and live `GET http://127.0.0.1:5001/` confirmed byte-for-byte parity:

- **Entrypoint:** `<div id="root"></div>`
- **Production JS Bundle:** `/assets/index-Dgfw6MwV.js` (latest build: `/assets/index-DOIa-l55.js`)
- **Production CSS Bundle:** `/assets/index-DUOOZhvk.css`
- **Shared i18n Script:** `/i18n.js`

## 3. HTTP Route Verification (`http://127.0.0.1:5001`)

| Route / Endpoint | Method | Status | Notes |
| --- | --- | --- | --- |
| `/` | `GET` | `200` | Unified React SPA (New Chat) |
| `/images` | `GET` | `200` | Unified React SPA (Image Workspace) |
| `/slides` | `GET` | `200` | Unified React SPA (Slides Studio) |
| `/projects` | `GET` | `200` | Unified React SPA (Projects) |
| `/library` | `GET` | `200` | Unified React SPA (Library) |
| `/health` | `GET` | `200` | Express health endpoint |
| `/api/conversations` | `GET` | `200` | Conversation history API |
| `/api/models` | `GET` | `200` | Model catalog API |
| `/api/templates` | `GET` | `200` | Design templates API |
| `/vectorize` | `GET` | `404` | Permanently removed |
| `/create/svg/vectorize` | `GET` | `404` | Permanently removed |
| `/api/images/vector-illustration` | `POST` | `404` | Permanently removed |
| `/api/images/vectorize` | `POST` | `404` | Permanently removed |
