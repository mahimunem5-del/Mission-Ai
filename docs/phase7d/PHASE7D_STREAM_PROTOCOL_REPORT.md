# Phase 7D — Stream Protocol Report (`PHASE7D_STREAM_PROTOCOL_REPORT.md`)

**Endpoint**: `POST /api/chat/ui-stream` (Vercel AI SDK v7 UI Message Stream via `pipeUIMessageStreamToResponse`)

---

## Standard & Custom Stream Parts

| Part / Event | Emitted By | Frontend Handling (`uiMessageMapper.ts`) |
| :--- | :--- | :--- |
| `text-start`, `text-delta`, `text-end` | `streamText().toUIMessageStream()` | Mapped to `{ partType: 'text', payload: { text } }` -> `Streamdown` |
| `data-status` | `writer.write({ type: 'data-status', data })` | Updates `requestedModel`, `resolvedModel`, `provider`, `isFallback`, `statusMessage` |
| `data-sources` | `writer.write({ type: 'data-sources', data })` | Mapped to `{ partType: 'sources', payload: { sources } }` -> `SourcesSection` |
| `data-image` | `generate_image` tool `execute()` | Mapped to `{ partType: 'image', payload: { imageUrl, prompt } }` |
| `data-usage` | `streamText` `onFinish` (actual usage only) | Stored in `metadata.providerMeta.usage` |
| `tool-call` / `tool-result` | AI SDK tool lifecycle | Mapped to `tool_call` / `tool_result` parts |
| `AbortSignal` | Express `req.on('aborted')` / `res.on('close')` | Passed to `streamText({ abortSignal })`; client marks `status: 'interrupted'` |
