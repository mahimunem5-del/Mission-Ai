# Phase 13A — Original Website Feature Inventory

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

| Existing Feature | Current Implementation (`index.html` / `src/` / `server/`) | New Integration Strategy | Preservation Test |
| :--- | :--- | :--- | :--- |
| **Primary Chat Interface** | Inline JS in `index.html` (`window.chatState`, `POST /api/chat/stream`) | **Integrate into new React architecture**: Serve `chat-next/dist` at `/` (`vite.config.ts` `base: '/'`), keep `/classic` for legacy fallback | Chromium QA at `http://127.0.0.1:5003/` (`ROOT_DESKTOP_CHECK`, `ROOT_CHAT_CHECK`) |
| **Model Selection** | `AVAILABLE_MODELS` in `index.html` + `src/config/models.ts` | **Integrate**: Dynamic `GET /api/models` in `ChatWorkspace.tsx` (`#model-select`) | `GET /api/models` 200 + live GPT-4o-mini switch in Chromium |
| **AI Streaming & Providers** | `aiOrchestrator.js` (`/api/chat/stream`) + OpenRouter + Mahi Engine | **Integrate**: `uiStreamOrchestrator.js` (`/api/chat/ui-stream`) for `/`; `/api/chat/stream` preserved for `/classic` | `test_phase7d_ai_sdk.js` (6/6) + `/` live chat stream |
| **Web Search & Deep Research** | Serper + `aiOrchestrator.js` | **Integrate**: Unified Tool Registry (`web_search`, `deep_research`) in `/` | `test_phase7d_ai_sdk.js` test 5 (sources emitted) |
| **Conversation History** | `index.html` `syncHistoryFromServer` + `/api/history` | **Integrate**: `Sidebar.tsx` + `apiClient.ts` via `/api/history/conversations` (Auth-protected) | `test_phase6_5_persistence.js` (2/2) |
| **Image Workspace (`images`)** | `src/components/ImageWorkspace.tsx`, `imageController.js`, `templateService.js`, `/api/templates`, `/api/generate-image` | **Preserve unchanged**: Frozen per `WORKSPACE_LOCK.md` (`hideInSidebar: true`) | SHA-256 hash match (12/12 files) + `GET /api/templates` 200 |
| **SVG Vectorizer (`/vectorize`)** | `VectorStudioCanvas.tsx` + `index.html` (`/vectorize`, `/create/svg/vectorize`) | **Preserve unchanged**: Routes serve `index.html` + linked in `Sidebar.tsx` | Chromium `GET /vectorize` -> `AI Mestrio` |
| **Slides Studio, Projects, Library** | `#slides-studio-workspace`, `#projects-workspace`, `#library-workspace` in `index.html` | **Preserve unchanged**: Accessible via `/classic#slides-studio`, `/classic#projects`, `/classic#library` in `Sidebar.tsx` | Chromium `GET /classic` -> `AI Mestrio` + sidebar links verified |
| **File Extract & Voice Transcribe** | `/api/files/extract`, `/api/transcribe` | **Integrate**: Wired in `ChatWorkspace.tsx` + `apiClient.ts` (behind `requireAuth`) | Verified in `server/src/index.js` & `apiClient.ts` |
| **Login / Signup** | Not implemented in `index.html` or `chat-next` | **Deferred**: Planned for Phase 14 (only Bearer token fallback exists) | `requireAuth` enforces `401` when unauthenticated |
