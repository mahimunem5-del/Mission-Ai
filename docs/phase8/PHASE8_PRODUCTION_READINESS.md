# Phase 8 — Production Readiness (`PHASE8_PRODUCTION_READINESS.md`)

**Branch**: `cleanup-backend-restructure`

---

## Status: **CONDITIONAL GO** (`/chat-next` Beta Ready; Production Cutover Blocked on Database Steps)

- **`/chat-next` Response Experience**: All Phase 8 UI/UX requirements, Markdown/dark code/table/KaTeX/chart/citation renderers, streaming/regeneration/restoration flows, and `1440px`–`375px` responsive layouts are verified passing with `0` console errors and `0` page exceptions.
- **Strict Preservation Rules Verified**:
  - Frozen Image Workspace untouched.
  - Legacy `/` (`AI Mestrio`) untouched and functional.
  - Phase 7G Image Generation removal in `/chat-next` preserved.
  - `OpenRouter`, `Mahi Engine`, `Web Search`, `Deep Research`, auth, and persistence preserved.

## Remaining Production Blockers (Carried Forward from Phase 7F)

1. **Pending Supabase Migration**: [001_clean_schema.sql](file:///d:/Ai%20platform/server/src/database/migrations/001_clean_schema.sql) must be executed manually in Supabase Dashboard SQL Editor before production cutover.
2. **Nine-Table PostgreSQL RLS Verification**: Database-level PostgreSQL RLS tests with `SUPABASE_ANON_KEY` + `anon`, `User A`, and `User B` JWTs across all 9 tables must be executed after applying `001_clean_schema.sql`.
