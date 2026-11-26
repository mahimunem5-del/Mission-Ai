# Mestrio AI — Frontend Integration API Contract

This document defines the HTTP and Server-Sent Events (SSE) contract between the Mestrio AI backend and the future React + TypeScript chat workspace (`assistant-ui` + `Streamdown`).

## 1. Authentication & Headers

- **Header**: `Authorization: Bearer <supabase_jwt_or_hmac_token>`
- **Request Tracing**: Optional `X-Request-ID` (echoed back on all responses).
- **CORS**: Strict allowlist via `CORS_ORIGIN` / `CLIENT_URL`. Production rejects unlisted origins.
- **Unauthenticated Error (`401`)**:
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication required. Provide a valid Bearer token."
  }
}
```

## 2. Chat & Streaming (`POST /api/chat/stream`)

**Request Body**:
```json
{
  "model": "mahi-engine",
  "searchMode": "none | web-search | deep-research",
  "projectId": "optional-project-id",
  "projectInstructions": "optional workspace instructions",
  "systemPrompt": "optional override",
  "language": "optional language hint",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

**SSE Event Stream (`Content-Type: text/event-stream`)**:
Each line is `data: <JSON>\n\n`, terminating with `data: [DONE]\n\n`.

| Event Shape | Purpose | `assistant-ui` / `Streamdown` Mapping |
| :--- | :--- | :--- |
| `{ "text": "..." }` | Incremental markdown token | Append to active assistant text part; render incrementally via `Streamdown` |
| `{ "type": "status", "message": "...", "requestedModel": "...", "resolvedModel": "...", "provider": "...", "isFallback": false }` | Model identity & status indicator | Display model badge / fallback notice; never misrepresent fallback as requested model |
| `{ "type": "sources", "data": [{ "title", "url", "domain?" }] }` | Web search / deep research citations | Attach source chips & `[1]` citation popovers |
| `{ "type": "image", "imageUrl": "...", "prompt": "..." }` | Generated image part | Render image content part in assistant message |
| `{ "type": "image_error", "message": "...", "error": "..." }` | Non-fatal image synthesis failure | Display inline retryable image error card |
| `{ "type": "tool_call", ... }` / `{ "type": "tool_result", ... }` | Structured tool lifecycle | Map to `assistant-ui` tool-call UI parts |
| `{ "type": "usage", "provider", "requestedModel", "resolvedModel", "promptTokens", "completionTokens", "totalTokens", "cacheHit" }` | Token & cache accounting | Update message metadata / usage telemetry |
| `{ "type": "stream_error", "code": "...", "error": "..." }` | Mid-stream failure | Transition `assistant-ui` run state to error |
| `data: [DONE]` | Stream completion | Finalize assistant message & `Streamdown` parse |

**Cancellation**: Closing the `fetch` `AbortController` immediately aborts the upstream provider stream and Deep Research requests on the server.

## 3. Multi-Model Compare (`POST /api/chat/compare`)

**Request Body**:
```json
{
  "models": ["mahi-engine", "openai/gpt-4o-mini"],
  "messages": [{ "role": "user", "content": "Compare..." }]
}
```
Maximum 4 models per request. Emits `{ "modelId": "...", "text": "..." }`, `{ "type": "model_done", "modelId": "..." }`, `{ "type": "model_error", "modelId": "...", "error": "..." }`, and `data: [DONE]`.

## 4. Models Catalog (`GET /api/models`)

Returns `{ "models": [...], "count": number }` with `id`, `name`, `provider`, `tier`, `openRouterModel`, and `capabilities` (`streaming`, `image`, `reasoning`, `coding`).

## 5. Conversation History (`GET/POST/DELETE /api/history/conversations`)

All endpoints require `requireAuth` and enforce `req.user.id` ownership:
- `GET /api/history/conversations?projectId=&limit=50`
- `GET /api/history/conversations/:id`
- `POST /api/history/conversations`
- `POST /api/history/conversations/:id/messages`
- `DELETE /api/history/conversations/:id`

## 6. Files, Transcription, Health

- `POST /api/files/extract` (Auth required, 50MB limit) — Extracts text from PDF, DOCX, XLSX, CSV, code, and text files.
- `POST /api/transcribe` (Auth required, 25MB base64 limit) — Audio speech-to-text (`{ audio, mimeType }` -> `{ text }`).
- `GET /api/health` — Non-leaking dependency readiness status.
