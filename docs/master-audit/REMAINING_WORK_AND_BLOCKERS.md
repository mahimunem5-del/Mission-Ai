# Mestrio AI — Remaining Work & Blockers

**Audit Date:** 2026-11-27  
**Branch:** `cleanup-backend-restructure`

---

## 1. Critical Blockers (Must Resolve Before Multi-Tenant Production)

1. **Uncommitted Local Repository State (`537` working-tree entries)**
   - **Impact:** GitHub `origin/cleanup-backend-restructure` (`0d41ab7`) does not have the unified React SPA migration, Image Workspace 1:1 restoration, Vectorize removal, or 508-file source purification.
   - **Action:** Review, commit, and push the purified working tree cleanly to `origin/cleanup-backend-restructure`.

2. **No End-User Authentication UI or Authenticated RLS Enforcement (Phase 14 — `PENDING`)**
   - **Impact:** Blocks Phase 15 (Private Attachments) and Phase 18 (Billing/Credits).
   - **Details:**
     - `chat-next/src/` has no Supabase Login/Signup/Logout flow (`AuthProfileContext.tsx` relies on optional bearer token / dev bypass).
     - `server/src/db/dbService.js` uses `SUPABASE_SERVICE_ROLE_KEY`, bypassing Supabase RLS.
     - Local testing ran under `DEV_BYPASS_AUTH` (`00000000-0000-0000-0000-000000000000`).

3. **Client-Only `localStorage` Persistence for Non-Chat Workspaces**
   - **Impact:** Slides Studio (`slidesService.ts`), Projects (`projectsStorage.ts`), Library (`libraryStorage.ts`), and Image Studio history (`mestrio_image_assets_v1`) do not persist across devices or user accounts in Supabase.

---

## 2. Incomplete Feature & Infrastructure Gaps

| Area | Phase | Current Gap | Dependency / Blocker |
| :--- | :---: | :--- | :--- |
| **Private Attachments** | 15 | No private Supabase Storage bucket, upload/signed-URL routes, or storage RLS policies (only `GET /api/attachments` + `attachments` table exist) | Blocked by Phase 14 Auth |
| **Planned AI Tools** | 16 | 9 of 14 tools in `toolRegistry.js` have `implemented: false, status: 'planned'` (`image_understanding`, `file_understanding`, `pdf_analysis`, `document_generation`, `presentation_generation`, `spreadsheet_analysis`, `data_analysis`, `code_execution`, `external_connectors`) | Independent implementation per tool |
| **Billing & Credits** | 18 | No Stripe/payment integration, webhook handler, or credit balance enforcement (only `subscriptions`, `credit_transactions`, `model_usage` tables and `GET /api/usage` exist) | Blocked by Phase 14 Auth |
| **Scalability & Config Drift** | 19–20 | Single-node Express saturated at `500` burst connections (`371/500`); `vercel.json` & `serve.json` still reference deleted `index.html` and `/vectorize` | Reverse proxy / hosting config cleanup |
| **Live Paid Image API QA** | 13 / Final | Image Workspace UI/resizer/modals verified, but live paid external image-generation API dispatch was skipped in browser QA to avoid provider charges | Optional pre-release smoke test |
