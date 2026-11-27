# Phase 1 to Latest — Complete Integration Inventory

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

| Phase | Feature / System | Disposition in Final Unified Website | Target / Evidence |
| :--- | :--- | :--- | :--- |
| **Phase 0 (`46e1f0b`)** | Initial `index.html`, Express server, `vercel.json` | **Replaced Chat / Preserved Non-Chat**: `/` replaced by React Chat Workspace; non-chat routes (`/slides`, `/projects`, `/library`, `/vectorize`) preserved | `server/src/index.js` |
| **Images Freeze (`fbe67cb`)** | Image Workspace & Precise Edit (`WORKSPACE_LOCK.md`) | **Preserved Unchanged**: 12/12 protected files SHA-256 identical | `IMAGE_WORKSPACE_PRESERVATION.md` |
| **Phase 3.0–3.1 (`1cc90b8`)** | Mermaid & chart rendering | **Superseded in Chat / Preserved in Non-Chat**: Chat uses `@streamdown/mermaid` + `ChartRenderer.tsx` | `UniversalMessageRenderer.tsx` |
| **Phase 6 / 6.5** | Restructured backend, 9-table Supabase schema, repositories | **Integrated & Active**: Connected to `/` & remote Supabase `tacqsiocsqtffqxuwwta` | `test_phase6_database.js` (3/3), `test_phase6_5_persistence.js` (2/2) |
| **Phase 7A–7D** | React Workspace (`chat-next/`) + Vercel AI SDK v7 (`/api/chat/ui-stream`) | **Integrated as Main `/` Website**: Built with `base: '/'`; obsolete `/chat-next`, `/classic`, `/legacy`, `/api/chat/stream` removed | `server/src/index.js`, `routes/chat.js` |
| **Phase 7E–7F** | Live browser QA & Supabase audit | **Completed** | `docs/phase7e/`, `docs/phase7f/` |
| **Phase 7G** | Image generation removal from Chat | **Preserved**: `allowImageTool: false` in `uiStreamOrchestrator.js`; no image gen UI in Chat | `uiStreamOrchestrator.js` |
| **Phase 8** | Professional Response Presentation | **Integrated at `/`**: Assistant header, dark code blocks, Markdown, tables, KaTeX, charts, citations | `UniversalMessageRenderer.tsx` |
| **Phase 9** | Unified AI Tools Architecture | **Integrated at `/` (Active Tools Only)**: Tools dropdown filtered to 4 implemented active tools (`web_search`, `deep_research`, `render_chart`, `calculate_math`) | `ChatWorkspace.tsx`, `toolRegistry.js` |
| **Phase 10** | Performance & Reliability | **Integrated**: Pipelined Redis rate limiter, `120000ms` stream timeout, `activeStreams` gauge, `enabledTools` validation | `rateLimit.js`, `uiStreamOrchestrator.js` |
| **Phase 11–11C** | Supabase migration + 9/9 Anonymous RLS | **Verified Remotely**: 9 tables exist; 9/9 anon RLS passed; Auth User A/B & private attachments **BLOCKED** | `test_phase11_anon_rls.js` |
| **Phase 12** | Backup, Git recovery & push | **Verified**: `origin/cleanup-backend-restructure` pushed; `main` untouched | `docs/phase12/` |
| **Phase 13 → Final** | Unified Website Replacement | **Integrated & Verified**: `/` serves React Chat Workspace; old Chat routes/UI removed | `final_migration_qa.mjs` (14 screenshots) |
