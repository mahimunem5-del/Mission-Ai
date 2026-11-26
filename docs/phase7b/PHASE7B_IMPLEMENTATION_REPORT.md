# Phase 7B — Implementation Report (`PHASE7B_IMPLEMENTATION_REPORT.md`)

**Branch**: `cleanup-backend-restructure`  
**Route**: `/chat-next` (served alongside classic `index.html` at `/`; Image Workspace untouched)

---

## 1. Files Created & Modified

### New `chat-next/` Workspace
- `chat-next/package.json`, `chat-next/tsconfig.json`, `chat-next/vite.config.ts`, `chat-next/tailwind.config.js`, `chat-next/postcss.config.js`, `chat-next/index.html`, `chat-next/src/index.css`
- `chat-next/src/types/universal.ts` — `UniversalMessage`, `UniversalMessagePart`, `UniversalAttachment`, `UniversalMessageMetadata`, `extractTextFromParts`
- `chat-next/src/lib/auth.ts` — `getAuthToken`, `setAuthToken`, `getAuthHeaders`, `sanitizeClientError`
- `chat-next/src/lib/apiClient.ts` — Typed REST client for `/api/models`, `/api/history/conversations`, `/api/files/extract`, `/api/transcribe`, and `mapRestoredToUniversalMessages`
- `chat-next/src/adapters/sseProtocolAdapter.ts` — Custom SSE-to-`UniversalMessagePart[]` streaming adapter for `POST /api/chat/stream` with `AbortSignal` cancellation
- `chat-next/src/adapters/assistantUiAdapter.ts` — `@assistant-ui/react` `ChatModelAdapter` bridge
- `chat-next/src/components/ChartRenderer.tsx` — Lazy-loaded Recharts (`BarChart`, `LineChart`, `PieChart`) renderer
- `chat-next/src/components/UniversalMessageRenderer.tsx` — Shared universal renderer (`Streamdown` + `@streamdown/code` + `@streamdown/math` + `@streamdown/mermaid` + `ChartRenderer` + sources/images/attachments/tool parts)
- `chat-next/src/components/Sidebar.tsx` — Conversation list, new chat, switching, and deletion
- `chat-next/src/components/ChatWorkspace.tsx` — Full desktop-first workspace wired to `AssistantRuntimeProvider` + `useExternalStoreRuntime`
- `chat-next/src/App.tsx`, `chat-next/src/main.tsx`
- `chat-next/src/test/{setup.ts,sseProtocolAdapter.test.ts,universalRenderer.test.tsx,historyAndModels.test.ts}`

### Backend Mount
- `server/src/index.js` — Added static & SPA route mount for `/chat-next` serving `chat-next/dist` without altering `/` (`index.html`), `/api/*`, or Image Workspace routes.

---

## 2. Dependencies & Versions (`chat-next/package.json`)
- `react`: `^18.3.1`, `react-dom`: `^18.3.1`
- `@assistant-ui/react`: `^0.15.38`, `@assistant-ui/react-streamdown`: `^0.3.23`
- `streamdown`: `^2.8.1`, `@streamdown/code`: `^2.0.0`, `@streamdown/math`: `^1.0.0`, `@streamdown/mermaid`: `^1.0.0`
- `shiki`: `^2.5.0`, `katex`: `^0.16.21`, `mermaid`: `^11.4.1`, `recharts`: `^2.15.1`, `lucide-react`: `^0.475.0`
- `tailwindcss`: `^3.4.17`, `typescript`: `^5.7.3`, `vite`: `^5.4.21`, `vitest`: `^2.1.8`

---

## 3. Implemented Features vs Backend-Dependent Features

### Implemented & Operational
- Independent `/chat-next` React + TypeScript SPA served by Express (`GET /chat-next` -> `200`).
- Streaming text deltas, status updates, web search sources, deep research stages, generated images, stream errors, and `AbortController` cancellation via `sseProtocolAdapter.ts`.
- Universal response rendering (`Streamdown`, Shiki, KaTeX, Mermaid, lazy-loaded Recharts, responsive tables, citations, attachments, images, unknown part fallback).
- Dynamic model selector (`GET /api/models`), General/Coding/Reasoning modes, Web Search & Deep Research toggles, file extraction (`POST /api/files/extract`), microphone transcription (`POST /api/transcribe`), copy/regenerate, and Bearer token auth bar on `401`.
- Conversation list, creation, restoration (`parts` + `attachments`), and deletion via `/api/history/conversations`.

### Features Requiring Additional Backend Support
1. **`tool_call` & `tool_result` SSE Events**: Presentation components exist in `UniversalMessageRenderer.tsx`, but `server/src/orchestrator/aiOrchestrator.js` currently emits `status` + `image` rather than `tool_call` / `tool_result` SSE events on `/api/chat/stream`.
2. **Real-Time `usage` SSE Events**: `model_usage` is persisted server-side, but `/api/chat/stream` does not yet emit `type: 'usage'` SSE events mid-stream.
3. **Database Migration**: `001_clean_schema.sql` has not yet been applied to live Supabase, so `message_parts` and `attachments` operate in graceful fallback mode until applied.
