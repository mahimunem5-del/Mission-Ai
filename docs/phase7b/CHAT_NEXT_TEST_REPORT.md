# `/chat-next` Test & Verification Report (`CHAT_NEXT_TEST_REPORT.md`)

---

## 1. Frontend Build & Unit/Component Tests (`chat-next/`)

- **TypeScript & Vite Production Build (`npm run build`)**:
  - `tsc -b`: **0 errors**
  - `vite build`: **Succeeded** (`dist/index.html` + lazy `ChartRenderer` chunk generated)
- **Vitest Suite (`npm test`)**: **3 Test Files passed, 8 Tests passed, 0 failed**:
  - `src/test/sseProtocolAdapter.test.ts` (**4/4 passed**):
    - Attaches `Authorization: Bearer ...` header and streams incremental text, status, fallback model identity, sources, and `[DONE]`.
    - Handles `image` and `stream_error` events.
    - Handles mid-stream `AbortSignal` cancellation as `interrupted` preserving partial text.
    - Sanitizes/redacts secret keys from HTTP 401/500 error messages.
  - `src/test/universalRenderer.test.tsx` (**2/2 passed**):
    - Renders `text` (Streamdown), `image`, `sources`, `attachments`, `tool_call`, `tool_result`, unknown part fallback, fallback notice, and error banner.
    - Renders interrupted generation indicator.
  - `src/test/historyAndModels.test.ts` (**2/2 passed**):
    - Maps restored conversations with `parts`, `attachments`, `interrupted` status, and fallback metadata.
    - Redacts API keys via `sanitizeClientError`.

## 2. Express Integration & Backend Regression Tests

- **Express Route Verification (`server/src/index.js`)**:
  - `GET /chat-next` -> `200` (serves `chat-next/dist/index.html` with `#root`)
  - `GET /` -> `200` (classic `index.html` preserved)
  - `GET /api/health` -> `200`
- **Backend Regression Suite (`cd server && npm test`, `NODE_ENV=test`)**:
  - `tests/runAllTests.js`: **26 passed, 0 failed**

## 3. Known Limitations
1. `UniversalMessageRenderer` tests mock `streamdown` plugins in `jsdom` because Shiki/Mermaid/KaTeX browser DOM rendering is verified via the full Vite production bundle build rather than `jsdom`.
2. Multi-model Compare UI (`POST /api/chat/compare`) remains on the classic workspace; `/chat-next` focuses on the single-thread `assistant-ui` universal chat workspace.
