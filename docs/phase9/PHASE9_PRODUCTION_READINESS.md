# Phase 9 — Production Readiness (`PHASE9_PRODUCTION_READINESS.md`)

**Branch**: `cleanup-backend-restructure`

---

## Status: **CONDITIONAL GO** (`/chat-next` Beta Ready; Cutover to `/` Blocked on Database Steps)

- **Unified AI Tools Architecture**: Registry, executor, model capability gating, `/api/tools`, AI SDK v7 streaming tool calls, and `/chat-next` tool-state UI are verified passing in backend, frontend, and live Chromium E2E tests.
- **Honest Capability Status**:
  - **Fully Implemented & Tested**: `web_search`, `deep_research`, `render_chart`, `calculate_math`.
  - **Disabled**: `image_generation` (Phase 7G intact; Frozen Image Workspace preserved).
  - **Designed / Planned Only (Not Executable)**: `image_understanding`, `file_understanding`, `pdf_analysis`, `document_generation`, `presentation_generation`, `spreadsheet_analysis`, `data_analysis`, `code_execution`, `external_connectors`.
- **Preservation Verified**: Frozen Image Workspace, legacy `/` (`AI Mestrio`), OpenRouter, Mahi Engine, Web Search, Deep Research, and Phase 8 rendering remain intact.

## Remaining Production Blockers (Carried Forward)

1. Execute [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) manually in Supabase Dashboard SQL Editor.
2. Run nine-table PostgreSQL RLS verification with `SUPABASE_ANON_KEY` + `anon`, `User A`, and `User B` JWTs.
