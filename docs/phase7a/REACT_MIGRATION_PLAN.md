# React Migration Plan — New Chat Workspace (`REACT_MIGRATION_PLAN.md`)

Safe, incremental migration plan for **New Chat only**, preserving production `index.html` and the frozen Image Workspace.

---

## 1. Core Principles

- **Single Backend**: All chat, history, models, files, transcription, profile, and usage endpoints remain on the single Express backend (`server/src/index.js`).
- **Image Workspace Frozen**: Zero changes to `ImageWorkspace.tsx`, `VectorStudioCanvas.tsx`, `/api/images/*`, `/api/generate-image/*`, or `/api/templates/*`.
- **No Premature Deletion**: `index.html` remains live at `/` until the React New Chat workspace passes full parity & QA.

---

## 2. Incremental Migration Stages

### Stage 1 — Workspace Scaffolding & Auth/API Client
- Add Vite + React + TypeScript + Tailwind CSS + `shadcn/ui` build config in a dedicated workspace (e.g. `client/` or root Vite config outputting to `dist-chat/`).
- Implement typed API client attaching `Authorization: Bearer <token>` and `X-Request-ID` to all `/api/*` calls.
- Implement `src/adapters/mestrioChatAdapter.ts` (`assistant-ui` `ChatModelAdapter`) consuming `POST /api/chat/stream`.

### Stage 2 — Universal Renderer (`Streamdown` + `Shiki` + `KaTeX` + `Mermaid` + `Recharts`)
- Build `UniversalMessageRenderer` consuming `UniversalMessagePart[]`:
  - `text` -> `Streamdown` + `Shiki` + `KaTeX` + `Mermaid` + `Recharts`
  - `sources` -> Citation chips + `[1]` popovers
  - `image` -> Image card
  - `status` / `fallbackNotice` -> Model identity badge (never misrepresenting fallback models)

### Stage 3 — Thread Persistence, Attachments, Voice & Compare
- Wire `useExternalStoreRuntime` to:
  - `GET /api/history/conversations` & `GET /api/history/conversations/:id` (restoring `messages`, `parts`, `attachments`)
  - `POST /api/history/conversations` & `POST /api/history/conversations/:id/messages` (persisting user messages, completed/interrupted assistant messages, `parts`, and `attachments`)
  - `DELETE /api/history/conversations/:id`
  - `GET /api/models`, `POST /api/files/extract`, `POST /api/transcribe`, `POST /api/chat/compare`

### Stage 4 — Parallel Verification & Cutover
- Serve the new React New Chat at a preview route (e.g. `/chat-next`) while `/` continues serving `index.html`.
- Verify feature parity (streaming, abort, deep research, web search, compare, file upload, voice, history restore, auth).
- Switch `/` to the React New Chat entry point only after sign-off, keeping `index.html` fallback available for instant rollback.

---

## 3. Rollback Strategy

- Because the backend API and database schema are shared and non-destructive, rolling back the frontend is a single static-route revert in `server/src/index.js` (`VALID_SPA_ROUTES` -> `index.html`) with zero data loss.
