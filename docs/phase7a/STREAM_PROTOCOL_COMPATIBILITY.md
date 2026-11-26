# Stream Protocol Compatibility Audit (`STREAM_PROTOCOL_COMPATIBILITY.md`)

Audit of `server/src/ai/streaming/protocol.js`, `sseStream.js`, `aiOrchestrator.js`, and `chatController.js` against `assistant-ui`.

---

## 1. Current Backend SSE Wire Format (`POST /api/chat/stream`)

| Backend SSE Event | Payload Shape | Emitted Today? |
| :--- | :--- | :--- |
| Text Delta | `{ "text": "..." }` | Yes (`aiOrchestrator.js:560`) |
| Status / Model Identity | `{ "type": "status", "message": "...", "requestedModel": "...", "resolvedModel": "...", "provider": "...", "isFallback": boolean }` | Yes (`aiOrchestrator.js:518`, `researchOrchestrator.js`) |
| Sources / Citations | `{ "type": "sources", "data": [{ "title", "url", "domain?" }] }` | Yes (`aiOrchestrator.js:383, 414`) |
| Image Generated | `{ "type": "image", "imageUrl": "...", "prompt": "..." }` | Yes (`aiOrchestrator.js:228, 284`, `openrouterAdapter.js`) |
| Image Error | `{ "type": "image_error", "message": "...", "error": "..." }` | Yes (`aiOrchestrator.js:247, 303`) |
| Stream Error | `{ "type": "stream_error", "error": "...", "code": "...", "text": "..." }` | Yes (`sseStream.js:58`) |
| Stream End | `data: [DONE]\n\n` | Yes (`sseStream.js:43`) |
| `usage` / `tool_call` / `tool_result` | Defined in `protocol.js` (`STREAM_EVENT_TYPES`) | **Not yet emitted** on `/api/chat/stream` SSE (usage is persisted server-side via `recordRequestMetrics()`; image tool calls emit `status` + `image`) |

---

## 2. Compatibility Assessment with `assistant-ui`

1. **Not Directly Compatible with Vercel AI SDK `DataStream` (`useChatRuntime`)**:
   - `assistant-ui`'s `useChatRuntime` expects Vercel AI SDK Data Stream framing (`0:"text"\n`, `d:{...}\n`).
   - Mestrio's backend uses standard SSE (`data: <JSON>\n\n`) because `index.html` and `runAllTests.js` depend on it.
2. **Recommended Integration Path — `ChatModelAdapter` / `useExternalStoreRuntime`**:
   - Implementing an `assistant-ui` `ChatModelAdapter` (around ~80 lines in the React client) consumes `POST /api/chat/stream` directly via `fetch` + `ReadableStream` + `AbortSignal`, and yields `ChatModelRunResult` updates (`content: UniversalMessagePart[]`, `status`, `metadata`) in real time.
   - **Zero breaking changes** to `index.html` or existing backend tests.

---

## 3. Compatibility Matrix & Required Adapter Behavior

| Capability | Backend Support | Adapter Mapping |
| :--- | :--- | :--- |
| **Streaming text deltas** | `{ text }` | Append to `text` part; yield incremental `content` to `assistant-ui` + `Streamdown` |
| **Message start & completion** | `status` -> `[DONE]` | Start `running` state on first byte; finalize `complete` on `[DONE]` |
| **Tool calls & results** | `status` ("Generating image...") + `image` / `image_error` | Map `status` + `image` into `tool_call` / `image` parts; optionally emit `tool_call`/`tool_result` in future |
| **Errors & cancellation** | `stream_error`, HTTP 4xx/5xx, `AbortSignal` | Pass `fetch(..., { signal: abortSignal })`; on abort mark `status: 'interrupted'` and persist partial text |
| **Usage metadata** | Persisted in `model_usage` + `GET /api/usage` | Not streamed in SSE yet; fetch via `GET /api/usage` or emit `createUsageEvent()` before `[DONE]` when ready |
| **Citations & sources** | `{ type: 'sources', data }` | Store in `sources` part; render citation chips & `[1]` popovers |
| **Conversation restoration** | `GET /api/history/conversations/:id` | `useExternalStoreRuntime` hydrates `ThreadMessageLike[]` from `messages` + `parts` + `attachments` |
