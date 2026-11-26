# Phase 7A — Frontend Migration Readiness Report

**Status**: Read-Only Audit Complete (No production code modified; Image Workspace untouched)  
**Target Branch**: `cleanup-backend-restructure`

---

## 1. Current Production Frontend Audit (`index.html`)

The live production application is served from [index.html](file:///d:/Ai%20platform/index.html) (46,221 lines) by `server/src/index.js` (`VALID_SPA_ROUTES`).

### Identified New Chat Components, State & API Calls
- **State & Storage**: `window.chatState` (`conversations`, `currentConversationId`, `selectedModel`), cached in `localStorage` and synchronized with the backend via:
  - `POST /api/history/conversations` (`syncConversationToServer`, `index.html:19426`)
  - `POST /api/history/conversations/:id/messages` (`syncMessageToServer`, `index.html:19451`)
  - `GET /api/history/conversations/:id` (`fetchAndRestoreConversation`, `index.html:19476`)
  - `GET /api/history/conversations?limit=50` (`syncHistoryFromServer`, `index.html:19521`)
  - `DELETE /api/history/conversations/:id` (`deleteConversationById`, `index.html:19507`)
- **Authentication**: `window.mestrioAuthToken || localStorage.getItem('mestrio_auth_token')` via `getAuthHeadersForSync()`.
  - **Gap Found**: `POST /api/chat/stream` (`index.html:22904`) currently sends only `'Content-Type': 'application/json'` without an `Authorization: Bearer ...` header, which will return `401` in production when `DEV_BYPASS_AUTH` is disabled.
- **Model Catalog**: `AVAILABLE_MODELS`, `loadAvailableModelsFromServer()` (`GET /api/models`, `index.html:13986`), `getCanonicalModelId()` (`index.html:14006`).
- **Chat Streaming**: Manual `fetch` + `ReadableStream` SSE line parser (`index.html:22903-23060`) handling `{ text }`, `{ type: 'status' }`, `{ type: 'sources' }`, `{ type: 'image' }`, `{ type: 'image_error' | 'error' }`, and `[DONE]`.
- **Compare Mode**: `POST /api/chat/compare` (`index.html:17939`).
- **File Extraction**: `POST /api/files/extract` (`index.html:20303`).
- **Voice Transcription**: `POST /api/transcribe` (`index.html:24921`).

### Existing `src/` Prototype Audit
The `src/` directory contains unbundled TypeScript/React files (`src/App.tsx`, `src/components/ModelDropdown.tsx`, `src/components/ComparePickerModal.tsx`, `src/components/ImageWorkspace.tsx`, `src/components/VectorStudioCanvas.tsx`, `src/config/models.ts`).
- **Not Production-Ready**: Root [package.json](file:///d:/Ai%20platform/package.json) has no Vite, React, TypeScript, Tailwind, or build scripts (`npm run serve` only serves static files via `serve.json`).
- **Reusable**: `src/config/models.ts` (`AIModel` interface & `MODELS` catalog), `src/components/ModelDropdown.tsx`, `src/components/ComparePickerModal.tsx`, and `src/App.tsx`'s `getApiBaseUrl()` / `streamChatResponse()` patterns can be adapted into the new workspace.

### Separation from Frozen Image Workspace
- Frozen Image Workspace (`src/components/ImageWorkspace.tsx`, `src/components/VectorStudioCanvas.tsx`, `src/data/designTemplates.ts`, `src/utils/imagePreprocessing.ts`, and `/api/images/*`, `/api/generate-image/*`, `/api/templates/*`) must remain completely isolated and untouched during New Chat migration.

---

## 2. Finalized Frontend Stack & Integration Boundaries

| Layer | Selected Package(s) | Responsibility |
| :--- | :--- | :--- |
| **Core** | `react`, `react-dom`, `typescript`, `vite` | Bundled SPA runtime for New Chat workspace |
| **Chat Runtime & UI** | `@assistant-ui/react`, `shadcn/ui`, `tailwindcss`, `lucide-react` | Thread state, composer, message list, tool UI, branching/abort via `ChatModelAdapter` / `useExternalStoreRuntime` |
| **Markdown & Code** | `streamdown`, `shiki` | Streaming-safe markdown, headings, lists, tables, and syntax-highlighted code blocks |
| **Math & Diagrams** | `katex`, `mermaid` | LaTeX math rendering (`$...$` / `$$...$$`) and Mermaid flowcharts/sequence diagrams |
| **Charts** | `recharts` | Structured data visualization components triggered from chart code/data blocks |

---

## 3. Top Migration Risks

1. **Missing Auth Header on `/api/chat/stream`**: Existing `index.html` omits `Authorization` on `/api/chat/stream`; the new React client must attach `Bearer <token>` on all `/api/*` requests.
2. **Custom SSE Protocol vs `assistant-ui`**: Backend emits custom JSON SSE (`{ text }`, `{ type: 'status' }`, etc.) rather than Vercel AI SDK Data Stream format; requires a dedicated `ChatModelAdapter` (see [STREAM_PROTOCOL_COMPATIBILITY.md](file:///d:/Ai%20platform/docs/phase7a/STREAM_PROTOCOL_COMPATIBILITY.md)).
3. **Dual Frontend Serving**: Until New Chat migration is verified, `index.html` remains the production entry point; the new React app must build to a dedicated route/bundle without breaking `index.html` or Image Workspace.
4. **Pending DB Migration**: `001_clean_schema.sql` must be applied to Supabase before `message_parts`, `attachments`, `profiles`, and `model_usage` persist in production.
