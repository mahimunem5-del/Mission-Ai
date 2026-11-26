# Phase 7C — End-to-End Validation Report (`PHASE7C_E2E_REPORT.md`)

**Branch**: `cleanup-backend-restructure`  
**Target**: `/chat-next` (`chat-next/dist`) + Express backend (`server/src/index.js`)

---

## 1. Real Authenticated AI & Tool QA (`scratch/phase7c_api_qa.mjs`)

Executed against the Express app with `DEV_BYPASS_AUTH=false` and a signed HMAC Bearer token (`API_AUTH_SECRET`):

| Scenario | Actual Outcome | Measured Timing |
| :--- | :--- | :--- |
| Missing token (`GET /api/history/conversations`) | `401 Unauthorized` | — |
| Expired token (`GET /api/history/conversations`) | `401 Unauthorized` | — |
| Valid token (`GET /api/history/conversations`) | `200 OK` | — |
| Unauthenticated file extract (`POST /api/files/extract`) | `401 Unauthorized` | — |
| Valid file extract (`notes.txt`) | `200 OK` (`"Hello Phase 7C"`) | — |
| Missing `fileData` (`POST /api/files/extract`) | `400 Bad Request` | — |
| Empty audio (`POST /api/transcribe`) | `200 OK` (`{ text: "" }`) | — |
| Real GPT-4o-mini stream (`POST /api/chat/stream`) | `200 OK`, `[DONE]`, `resolvedModel: openai/gpt-4o-mini` | First token: **1,955 ms**, Total: **1,994 ms** |
| Real `web-search` toggle (`searchMode: 'web-search'`) | `200 OK`, `sources` SSE event emitted (**4 sources**) | **3,113 ms** |
| Real `deep-research` toggle (`searchMode: 'deep-research'`) | `200 OK`, `status` + `sources` SSE events (**15 sources**) | **13,460 ms** |

---

## 2. Tools & Research Capability Classification

| Capability | Status | Details |
| :--- | :--- | :--- |
| **Web Search (`searchMode: 'web-search'`)** | **Fully functional** | Triggers `Serper.dev` search and emits `{ type: 'sources', data }` + grounded response. |
| **Deep Research (`searchMode: 'deep-research'`)** | **Fully functional** | Executes 4 parallel search vectors, emits `status` stages and `sources` (up to 15). |
| **Image Generation (`/image` or tool call)** | **Fully functional** | Emits `status` + `image` / `image_error` SSE events. |
| **Structured `tool_call` / `tool_result` SSE events** | **UI-ready / Not emitted by backend** | `UniversalMessageRenderer` supports `tool_call`/`tool_result` parts, but `/api/chat/stream` does not emit those event types yet. |

---

## 3. Bundle & Security Audit

- Scanned `chat-next/dist/assets/*.js` for `service_role`, `eyJhbGci`, `sk-or-v1`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `MAHI_ENGINE_API_KEY`: **0 secrets found** (only the `sk-or-v1` redaction regex literal in `sanitizeClientError`).
- Verified `GET /chat-next` -> `200`, `GET /` -> `200` (`index.html` preserved), `GET /api/health` -> `200`.

---

## 4. Browser Visual QA Limitation

- Live Chrome DevTools browser automation could **not** be executed because `DevToolsActivePort` was not active in the local Chrome profile (`Could not find DevToolsActivePort for chrome`).
- As a result, live in-browser rendering of Shiki, KaTeX, Mermaid, and Recharts, as well as interactive mouse/keyboard/mobile viewport (`375x812`) rendering in Chrome, remains **unverified in a live browser** and must be checked manually or with Chrome remote debugging enabled before production cutover.
