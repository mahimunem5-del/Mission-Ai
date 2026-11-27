# Feature Connectivity Report

**Date**: 2026-11-26  

| Feature | Status | Connected Path / Evidence |
| :--- | :--- | :--- |
| React Chat Workspace (`/`) | ✅ **VERIFIED** | `chat-next/dist/index.html` served at `/` |
| OpenRouter & GPT Model Routing | ✅ **VERIFIED** | `GET /api/models` + `providerRegistry.js` |
| Mahi Engine Routing | ✅ **VERIFIED** | `test_phase7d_ai_sdk.js` test 4 (`gemini-3.5-flash-lite`) |
| AI SDK v7 SSE Streaming & Stop | ✅ **VERIFIED** | `POST /api/chat/ui-stream` + `10_streaming_state.png` |
| Markdown, Tables, Dark Code Blocks, KaTeX, Charts | ✅ **VERIFIED** | `UniversalMessageRenderer.tsx` (`06_markdown_and_table_response.png`, `07_code_response.png`) |
| Web Search & Deep Research + Citations | ✅ **VERIFIED** | `08_web_search_execution.png`, `09_deep_research_execution.png` |
| Conversation Persistence (API + Remote DB) | ✅ **VERIFIED (API)** | `test_phase6_database.js` (3/3), `test_phase6_5_persistence.js` (2/2) |
| Slides Studio, Projects, Library, Vectorizer | ✅ **VERIFIED** | `/slides`, `/projects`, `/library`, `/vectorize` in Chromium QA |
| Image Workspace (`/api/templates`, `/api/generate-image`) | ✅ **VERIFIED** | 12/12 hashes identical; `GET /api/templates` HTTP `200` |
| Backend JWT Auth (`requireAuth`) | ✅ **VERIFIED** | Enforces `401` on protected routes |
| Frontend Login / Signup | ❌ **NOT IMPLEMENTED** | Scheduled for dedicated Auth phase |
| Authenticated User A/B Isolation & Private Attachments | 🔴 **BLOCKED** | Blocked until Login/Signup & `attachments` bucket |
| Subscription / Credit Enforcement | ❌ **NOT IMPLEMENTED** | DB tables exist; billing logic not implemented |
