# Phase 12C — Architecture Stabilization Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Clear Architectural Boundaries

| # | Boundary | Current Implementation | Status |
| :--- | :--- | :--- | :--- |
| 1 | **Original Website Frontend (`/`)** | `index.html` (46,221 lines) + `src/` (`App.tsx`, `ModelDropdown.tsx`, `ComparePickerModal.tsx`, `src/config/models.ts`) | Preserved untouched; uses legacy `/api/chat/stream` |
| 2 | **New React Chat Workspace (`/chat-next`)** | `chat-next/src/` (`ChatWorkspace.tsx`, `Sidebar.tsx`, `UniversalMessageRenderer.tsx`, `ChartRenderer.tsx`, `uiMessageMapper.ts`) | Separate SPA built to `chat-next/dist/`, uses `/api/chat/ui-stream` |
| 3 | **Express Backend** | `server/src/index.js` + `routes/*` + `controllers/*` + `middleware/*` | Serves `/`, `/chat-next`, and `/api/*` |
| 4 | **AI Provider & Model Routing** | `server/src/services/modelRouter.js`, `server/src/ai/sdk/providerRegistry.js`, `openrouterProvider.js`, `mahiEngineProvider.js` | OpenRouter + Mahi Engine routing; `capabilities.tools` gated per model |
| 5 | **AI Tools Architecture** | `server/src/ai/tools/toolRegistry.js` + `toolExecutor.js` + `routes/tools.js` | 4 active (`web_search`, `deep_research`, `render_chart`, `calculate_math`), 1 disabled (`image_generation`), 9 `planned` |
| 6 | **Supabase DB & Auth** | `server/src/middleware/auth.js`, `server/src/database/repositories/*`, `001_clean_schema.sql` | 9 tables + anonymous RLS verified; Frontend Login/Signup NOT implemented |
| 7 | **Frozen Image Workspace** | `src/components/ImageWorkspace.tsx`, `VectorStudioCanvas.tsx`, `imageController.js`, `templateController.js`, `templateService.js`, `routes/image.js`, `routes/templates.js` | Strictly frozen (`WORKSPACE_LOCK.md`); untouched |
| 8 | **Shared Utilities** | `server/src/utils/{logger,errors,cache}.js`, `chat-next/src/lib/{auth,apiClient}.ts` | Cleanly separated between server & SPA |

---

## 2. Identified Duplication, Conflicts & Architectural Risks

1. **Dual Chat Frontends & Dual Chat Endpoints**:
   - `index.html` calls `POST /api/chat/stream` (`aiOrchestrator.js`), while `chat-next` calls `POST /api/chat/ui-stream` (`uiStreamOrchestrator.js`).
   - **Risk**: Maintaining two chat pipelines long-term causes feature drift. **Recommended**: Keep both during Phase 13 transition; retire `index.html` chat UI only after `/chat-next` is integrated into `/` and verified.
2. **Duplicate Model Catalogs**:
   - `src/config/models.ts` (root), `index.html` (`AVAILABLE_MODELS`), and `server/src/services/modelRouter.js` all define model lists.
   - **Risk**: Model IDs can drift. `/chat-next` already fetches dynamically from `GET /api/models` — make `modelRouter.js` the single source of truth during integration.
3. **Unbundled `src/` vs. Bundled `chat-next/`**:
   - Root `package.json` has no Vite build pipeline; `chat-next/` has its own `vite.config.ts` (`base: '/chat-next/'`).
   - **Risk**: Integrating `/chat-next` at `/` will require updating Vite `base: '/'` and routing `/` -> unified React build while preserving `/vectorize` and Frozen Image Workspace.
4. **Authentication Placeholder in `chat-next`**:
   - `chat-next/src/lib/auth.ts` uses `localStorage.getItem('mestrio_auth_token')` + manual paste banner instead of real `@supabase/supabase-js` Auth sessions.
5. **Unresolved Storage Gap**:
   - No private `attachments` storage bucket or `storage.objects` RLS policy exists yet in Supabase.
