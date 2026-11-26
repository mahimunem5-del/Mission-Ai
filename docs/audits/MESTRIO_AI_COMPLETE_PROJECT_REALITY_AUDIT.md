# Mestrio AI — Complete Project Reality Audit

**Audit Type**: Strictly Read-Only Historical & Environmental Reality Audit  
**Date**: 2026-11-26  
**Repository**: `https://github.com/mahimunem5-del/Mission-Ai.git`  
**Active Local Branch**: `cleanup-backend-restructure` (at commit `1cc90b8`)  
**Remote `origin/main` Commit**: `fbe67cb` (`tag: images-v1.0-frozen`)  

---

## 1. Executive Summary

Your Mestrio AI project currently exists in **two separate, unmerged layers** on your local machine, while **GitHub is frozen at an older state** and **no staging or live production deployment of the new system exists**:

1. **What is on GitHub (`origin/main` at `fbe67cb`)**: Only the original Mestrio AI application (`index.html`, `src/`, `server/`) up to `images-v1.0-frozen` (Image Workspace + Precise Edit upgrades). **Even commit `1cc90b8` (Phase 3.0 Mermaid engine) has not been pushed to GitHub, and zero work from Phases 6–11C has been committed or pushed.**
2. **What is built locally (`cleanup-backend-restructure` working tree)**: A new standalone React/TypeScript chat SPA in `chat-next/` (mounted at `/chat-next`) powered by a restructured Express + Vercel AI SDK v7 backend (`server/`), Unified Tool Registry, Phase 8 response rendering, Phase 10 reliability hardening, and Phase 11/11B/11C database schema + anonymous RLS verification.
3. **Is `/chat-next` integrated into your original website (`/`)?** **No.** Your original website at `/` (`index.html`, 46,221 lines) still runs its own inline vanilla JS chat client and `POST /api/chat/stream`. `/chat-next` is a separate bundled React SPA served on a side-by-side route (`/chat-next`) in local development.
4. **What were the screenshots?** Every screenshot captured during Phases 7E, 8, and 9 (`phase7e_screenshots/`, `phase8_screenshots/`, `phase9_screenshots/`) was captured in headless Chromium against `http://127.0.0.1:5001/chat-next` or `http://127.0.0.1:5002/chat-next` — **a local development workspace, NOT your original `/` website and NOT live production**.
5. **What is in remote Supabase (`tacqsiocsqtffqxuwwta`)?** All **9 tables** from `001_clean_schema.sql` now exist remotely, `conversations` (14 rows) and `messages` (75 rows) are intact, and **anonymous RLS passed 9/9**. However, **frontend Login/Signup is NOT implemented**, so **real authenticated User A / User B isolation and private attachment storage remain BLOCKED**.

---

## 2. Full Development Timeline (Beginning → Phase 11C)

*(Reconstructed strictly from `git log`, `WORKSPACE_LOCK.md`, `server/src/db/schema.sql`, `docs/phase7a/`–`docs/phase11/`, and current working-tree files. Undocumented intermediate phase numbers 1–2 and 4–5 are not invented.)*

### Phase 0 — Initial Mestrio AI Platform (`46e1f0b`)
- **Planned / Implemented**: Original monolithic web app (`index.html`), Express backend (`server/src/index.js`), root `package.json`, `vercel.json` / `serve.json` static hosting config, and `src/` prototype components.
- **Tested / Environment**: Local development; committed to Git (`46e1f0b Initial clean commit - Mestrio AI`).

### Images Workspace & Freeze (`fbe67cb`, `tag: images-v1.0-frozen`, `WORKSPACE_LOCK.md`)
- **Planned / Implemented**: Complete Image Studio (`src/components/ImageWorkspace.tsx`, `VectorStudioCanvas.tsx`, `imageController.js`, `templateController.js`, `templateService.js`, `imageModelRegistry.js`, `preciseEditPlanner.js`, `referenceIntelligence.js`, `imagePreflight.js`), locked via `WORKSPACE_LOCK.md` (`images: { locked: true, hideInSidebar: true }`).
- **GitHub**: Pushed to `origin/main` and `origin/images-workspace-locked` (`fbe67cb`). **This is the latest commit on GitHub.**

### Phase 3.0 / 3.1 — Mermaid Diagram & Chart Presentation Engine (`1cc90b8` + `scratch/audit_phase3_1_*`)
- **Planned / Implemented**: Upgraded diagram/chart rendering in `index.html` / `src/config/models.ts`, plus Phase 3.1 production/edge-case audit scripts in `scratch/`.
- **GitHub**: Committed locally as `1cc90b8` on `main` / `cleanup-backend-restructure`, **NOT pushed to `origin`**.

### Phase 6 & 6.5 — Backend Restructure, Database Schema & Repositories (Uncommitted in working tree)
- **Planned / Implemented**: Restructured `server/src/` (`aiOrchestrator.js`, `modelRouter.js`, `mahiEngineProvider.js`, `openrouterProvider.js`, `rateLimit.js`, `validate.js`), created `server/src/database/migrations/001_clean_schema.sql` (9 tables + RLS), and added repositories (`conversationsRepository.js`, `messagesRepository.js`, `messagePartsRepository.js`, `attachmentsRepository.js`, `modelUsageRepository.js`, `profilesRepository.js`).
- **Tested**: `test_phase6_database.js` (3/3), `test_phase6_5_persistence.js` (2/2) locally against Express + Supabase.

### Phase 7A — Frontend Migration Readiness Audit (`docs/phase7a/`)
- **Planned / Implemented**: Read-only audit of `index.html` (46,221 lines) and `src/` prototype; designed `UniversalMessage` contract and React + Vite + `@assistant-ui/react` + `Streamdown` target stack.
- **Files**: Docs only (`docs/phase7a/*.md`).

### Phase 7B — `/chat-next` React Workspace Creation (`docs/phase7b/`)
- **Planned / Implemented**: Created standalone `chat-next/` SPA (`ChatWorkspace.tsx`, `Sidebar.tsx`, `UniversalMessageRenderer.tsx`, `ChartRenderer.tsx`, `apiClient.ts`, `auth.ts`, `sseProtocolAdapter.ts`, `assistantUiAdapter.ts`) and mounted `/chat-next` in `server/src/index.js`.
- **Tested**: Local `vitest`, `vite build`, local Express `/chat-next` HTTP `200`.

### Phase 7C — E2E Validation & Auth/Tool QA (`docs/phase7c/`)
- **Planned / Implemented**: Tested `/chat-next` + Express APIs (`401` on missing/expired tokens, `/api/files/extract`, `/api/transcribe`, GPT-4o-mini SSE, `web-search`, `deep-research`) using local HMAC tokens (`API_AUTH_SECRET`).

### Phase 7D & 7D Cleanup — Vercel AI SDK v7 Migration (`docs/phase7d/`)
- **Planned / Implemented**: Migrated `/chat-next` chat pipeline to Vercel AI SDK v7 (`server/src/ai/sdk/providerRegistry.js`, `uiStreamOrchestrator.js`, `POST /api/chat/ui-stream`, `chat-next/src/adapters/uiMessageMapper.ts`, `@assistant-ui/ai-sdk`). Removed premature `generate_image` AI SDK tool and deleted obsolete `sseProtocolAdapter.ts` / `assistantUiAdapter.ts`.
- **Tested**: `test_phase7d_ai_sdk.js` (6/6) locally.

### Phase 7E — Live Browser Validation (`docs/phase7e/`)
- **Planned / Implemented**: Headless Chromium CDP validation of `http://127.0.0.1:5001/chat-next` across 5 viewports (`1440x900` down to `375x812`). Legacy `/` verified untouched.

### Phase 7F — Supabase Pre-Migration Audit (`docs/phase7f/`)
- **Planned / Implemented**: Read-only audit identifying that 6/9 tables were missing in remote Supabase (`tacqsiocsqtffqxuwwta`) and `001_clean_schema.sql` was pending manual execution.

### Phase 7G — Complete Image Generation Removal from `/chat-next` (`docs/phase7g/`)
- **Planned / Implemented**: Disabled image generation in `/chat-next` (`allowImageTool: false` in `uiStreamOrchestrator.js`, removed live `data-image` stream adapters in `uiMessageMapper.ts` / `ChatWorkspace.tsx` / `universal.ts`), while preserving Frozen Image Workspace and legacy `aiOrchestrator.js`.

### Phase 8 — Professional Chat Response Experience (`docs/phase8/`)
- **Planned / Implemented**: Assistant identity header (`Mestrio AI`, `resolvedModel`, `provider`, `Responding`), dark `zinc-950` code blocks with copy fallback, full Markdown/KaTeX/table styling, `SourcesSection` citation grid, `ChartRenderer` title bar.
- **Tested**: Local Vitest + Chromium QA against `http://127.0.0.1:5002/chat-next`.

### Phase 9 — Unified AI Tools Architecture (`docs/phase9/`)
- **Planned / Implemented**: `server/src/ai/tools/toolRegistry.js` (14 categories: 4 active `web_search`, `deep_research`, `render_chart`, `calculate_math`; 1 disabled `image_generation`; 9 `planned`), `toolExecutor.js`, `GET /api/tools`, model capability gating (`modelRouter.js`), and `/chat-next` Tools menu + tool result cards.
- **Tested**: `test_phase9_tools.js` (5/5) + Chromium QA.

### Phase 10 — Performance & Reliability Engineering (`docs/phase10/`)
- **Planned / Implemented**: Pipelined Redis rate limiter (`rateLimit.js`), `activeStreams` gauge + `120000ms` timeout + `finally` cleanup (`uiStreamOrchestrator.js`), `enabledTools` validation (`validate.js`), `sendingLockRef` + scroll fix (`ChatWorkspace.tsx`).
- **Tested**: Local load tests (100/100 concurrent `/api/models`; 371/500 burst socket saturation; 10 concurrent streams).

### Phase 11 / 11B / 11C — Supabase Migration, Safety Gate & Anonymous RLS (`docs/phase11/`)
- **Planned / Implemented**:
  - Added pre-flight ownership check in `historyController.js` (`deleteConversation`).
  - Completed read-only Migration Safety Gate (`PHASE11_FINAL_MIGRATION_SAFETY_GATE.md`, verdict `SAFE TO RUN`).
  - User manually executed `001_clean_schema.sql` on remote Supabase (`tacqsiocsqtffqxuwwta`).
  - Verified all 9 tables exist (`conversations` 14 rows, `messages` 75 rows intact) and `templates (public: true)` bucket unchanged.
  - Added `SUPABASE_ANON_KEY` to local `server/.env` and passed **9/9 anonymous RLS verification** (`server/tests/test_phase11_anon_rls.js`).
- **Incomplete / Blocked**: Frontend Login/Signup UI (`NOT IMPLEMENTED`), real User A / User B session isolation (`BLOCKED`), private attachment storage bucket & policies (`BLOCKED / NOT IMPLEMENTED`), and GitHub commit/push (`NOT DONE`).

---

## 3. Original Website Architecture (Real Website vs. `/chat-next`)

| Question | Evidence-Based Answer | Exact File / Route Evidence |
| :--- | :--- | :--- |
| **1. Which frontend currently represents your original website?** | **`index.html` (46,221 lines)** served at `/` (and `/vectorize`, `/create/svg/vectorize`). | [`server/src/index.js`](file:///d:/Ai%20platform/server/src/index.js#L104-L134), [`vercel.json`](file:///d:/Ai%20platform/vercel.json#L3-L8) |
| **2. Is `/chat-next` integrated into that original website?** | **No.** They are mounted as two completely separate SPAs on the Express server. | [`server/src/index.js`](file:///d:/Ai%20platform/server/src/index.js#L111-L117) (`/chat-next` -> `chat-next/dist/index.html`) vs [`L128-L132`](file:///d:/Ai%20platform/server/src/index.js#L128-L132) (`/` -> `index.html`) |
| **3. Is `/chat-next` a separate application or only a local dev route?** | **Both:** It is a separate Vite/React/TypeScript sub-application (`chat-next/`) built to `chat-next/dist/` and mounted only on the local Express `/chat-next` route. | [`chat-next/package.json`](file:///d:/Ai%20platform/chat-next/package.json), [`chat-next/vite.config.ts`](file:///d:/Ai%20platform/chat-next/vite.config.ts#L6) (`base: '/chat-next/'`) |
| **4. Does the original website actually use the new React chat system?** | **No.** `index.html` uses its own inline JS (`window.chatState`, `POST /api/chat/stream`), not `@assistant-ui/ai-sdk` or `/api/chat/ui-stream`. | [`docs/phase7a/PHASE7A_FRONTEND_READINESS_REPORT.md`](file:///d:/Ai%20platform/docs/phase7a/PHASE7A_FRONTEND_READINESS_REPORT.md#L10-L25) |
| **5. Is the Image Workspace still the original implementation?** | **Yes.** All Frozen Image Workspace files and routes (`/api/generate-image`, `/api/images`, `/api/templates`, `imageController.js`, `templateService.js`, `src/components/ImageWorkspace.tsx`) are preserved untouched. | [`WORKSPACE_LOCK.md`](file:///d:/Ai%20platform/WORKSPACE_LOCK.md#L51-L67), `GET /api/templates` HTTP 200 |
| **6. Has any phase replaced or modified the original website?** | **Not replaced.** `index.html` was modified locally (relative to `1cc90b8` — `git diff --stat` shows `2230 insertions, 709 deletions` from pre-Phase-7A work), and `index.html` has NOT been replaced by `chat-next`. | `git diff --stat index.html` |

---

## 4. Local Environment Map

Observed live listening ports and production builds on this machine:

| Port / Path | Status | Application / Evidence |
| :--- | :--- | :--- |
| **`http://127.0.0.1:5001`** | **LISTENING** (PID `10632`) | Local Express backend (`server/src/index.js`). Serves `/` (`index.html`), `/chat-next` (`chat-next/dist`), and `/api/*`. Confirmed HTTP `200` on `/chat-next` and `/api/templates`. |
| **`http://127.0.0.1:5002`** | **LISTENING** (PID `11888`) | Secondary local Express instance started earlier during Phase 11 testing. |
| **`http://127.0.0.1:3000`** | **LISTENING** (PID `15868`) | Local Node listener on port 3000 (external to Express `5001`/`5002`; exact command line blocked by `Get-CimInstance` permissions). |
| **Local Production Build (`chat-next/dist/`)** | **EXISTS** | Built via `tsc -b && vite build` (`dist/index.html`, `dist/assets/index-Dv-e3nY1.js` + KaTeX/Mermaid/Shiki/Recharts chunks). Contains `/chat-next` React app ONLY (not `/`). |

---

## 5. GitHub Status (Read-Only Inspection)

- **Remote**: `origin -> https://github.com/mahimunem5-del/Mission-Ai.git`
- **Current Local Branch**: `cleanup-backend-restructure` (at commit `1cc90b8`)
- **Remote `origin/main` & `origin/images-workspace-locked`**: **`fbe67cb`** (`tag: images-v1.0-frozen`)
- **Unpushed Local Commit**: `1cc90b8` (`feat(render): complete Phase 3.0 Mermaid diagram & flowchart presentation engine`) is **ahead of `origin/main`** and **not on GitHub**.
- **Uncommitted Working Tree Changes**:
  - **26 modified/deleted tracked files** (`index.html`, `src/config/models.ts`, `server/package.json`, `server/src/index.js`, controllers, providers, routes, middleware, orchestrator, etc.)
  - **Untracked directories**: `chat-next/`, `docs/` (all Phase 7A–11C reports), `scratch/`
- **Conclusion**: **GitHub does NOT contain Phase 3.0, Phase 6–11C, `/chat-next`, or the restructured backend.**

---

## 6. Staging and Live Production Website Status

- **Staging Environment**: **NONE / UNKNOWN** (no staging URL, branch deployment, or `.env.staging` exists in the repository).
- **Live Production Domain**: **UNKNOWN / NOT CONFIGURED** (`server/.env` has no `CORS_ALLOWED_ORIGINS` or production domain; `vercel.json` has only path rewrites, no domain).
- **Production Deployment Status**: **NOT DEPLOYED** (since neither commit `1cc90b8` nor the uncommitted `chat-next/` + `server/` changes exist on GitHub `origin/main`, any deployment tracking GitHub `main` would only have `fbe67cb`).

---

## 7. Complete Phase-by-Phase Reality Audit

| Phase | Implemented | Local Test | GitHub | Remote Supabase | Production Deployment | Remaining Work |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Original Mestrio AI Website (`/`)** | VERIFIED | VERIFIED | VERIFIED (`fbe67cb` baseline; local edits unpushed) | PARTIALLY VERIFIED | UNKNOWN / NOT DEPLOYED | Integrate `/chat-next` & real Auth |
| **Image Workspace (`images-v1.0-frozen`)** | VERIFIED | VERIFIED | VERIFIED (`fbe67cb`) | VERIFIED (`image_templates` + `templates` bucket) | UNKNOWN | Keep frozen & untouched |
| **Phase 3.0 / 3.1 Mermaid & Charts** | VERIFIED | VERIFIED (local scripts) | NOT DEPLOYED (`1cc90b8` unpushed) | N/A | NOT DEPLOYED | Commit/push when ready |
| **Phase 6 / 6.5 Backend & DB Schema** | VERIFIED (uncommitted) | VERIFIED (`3/3`, `2/2`) | NOT DEPLOYED | VERIFIED (`001_clean_schema.sql` applied) | NOT DEPLOYED | Commit/push; wire real user sessions |
| **Phase 7A–7C `/chat-next` React SPA** | VERIFIED (uncommitted) | VERIFIED | NOT DEPLOYED | N/A | NOT DEPLOYED | Integrate into `/` |
| **Phase 7D AI SDK v7 Streaming** | VERIFIED (uncommitted) | VERIFIED (`6/6`) | NOT DEPLOYED | N/A | NOT DEPLOYED | Commit/push |
| **Phase 7E–7F Browser QA & DB Audit** | VERIFIED | VERIFIED | NOT DEPLOYED | VERIFIED | NOT DEPLOYED | Completed |
| **Phase 7G Image Gen Removal (`/chat-next`)** | VERIFIED (uncommitted) | VERIFIED | NOT DEPLOYED | N/A | NOT DEPLOYED | Re-add later via Unified Tools |
| **Phase 8 Response Presentation** | VERIFIED (uncommitted) | VERIFIED (Vitest + CDP) | NOT DEPLOYED | N/A | NOT DEPLOYED | Commit/push |
| **Phase 9 Unified AI Tools** | VERIFIED (uncommitted) | VERIFIED (`5/5` + CDP) | NOT DEPLOYED | N/A | NOT DEPLOYED | Implement 9 `planned` tools later |
| **Phase 10 Performance & Reliability** | VERIFIED (uncommitted) | VERIFIED (load tests) | NOT DEPLOYED | N/A | NOT DEPLOYED | Reverse proxy + horizontal scaling for prod |
| **Phase 11 / 11B Migration & Verification** | VERIFIED | VERIFIED | NOT DEPLOYED | VERIFIED (9/9 tables, 14 convs, 75 msgs) | NOT DEPLOYED | Auth & storage gaps below |
| **Phase 11C Anonymous RLS** | VERIFIED (`test_phase11_anon_rls.js`) | VERIFIED (`9/9`) | NOT DEPLOYED | VERIFIED (anon blocked on 8 private tables) | NOT DEPLOYED | Authenticated RLS **BLOCKED** |

---

## 8. Supabase Remote Verification (`tacqsiocsqtffqxuwwta`)

| Layer | Status | Verified Facts |
| :--- | :--- | :--- |
| **Local Supabase Config (`server/.env`)** | **VERIFIED** | `SUPABASE_URL` (`tacqsiocsqtffqxuwwta`), `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` (len 46) are set locally. `.env` is git-ignored. |
| **Actual Remote DB (9 Tables)** | **VERIFIED** | Migration `001_clean_schema.sql` applied remotely. All 9 tables exist: `profiles` (0), `conversations` (**14**), `messages` (**75**), `message_parts` (0), `attachments` (0), `model_usage` (0), `subscriptions` (0), `credit_transactions` (0), `image_templates` (0). |
| **Backend `service_role` Operations** | **VERIFIED** | `conversations`, `messages`, and `GET /api/templates` work via Express backend; FK constraints (`profiles_id_fkey`, `model_usage_user_id_fkey`, `attachments_user_id_fkey`, `message_parts_message_id_fkey`) are active remotely. |
| **Anonymous Client Access (`SUPABASE_ANON_KEY`)** | **VERIFIED** | `test_phase11_anon_rls.js`: 8 private tables return `0` rows on `SELECT` (hiding the 14 conversations & 75 messages) and reject `INSERT`/`UPDATE`/`DELETE` (`42501`). `image_templates` allows `SELECT` only. |
| **Authenticated User A / B Access** | **BLOCKED** | Real frontend Login/Signup does not exist yet; authenticated RLS isolation cannot be verified end-to-end. |
| **Frontend Auth & Storage** | **NOT IMPLEMENTED / BLOCKED** | No Login/Signup UI exists. Storage has only `templates (public: true)`; no private `attachments` bucket exists. |

---

## 9. Feature Integration Status

| # | Feature | Actual Status |
| :--- | :--- | :--- |
| 1 | **Chat interface (new React)** | Available only in `/chat-next` (local) |
| 2 | **GPT model selection** | Available in `/chat-next` & backend `/api/models` (local) |
| 3 | **OpenRouter integration** | Available in backend + `/chat-next` (local) |
| 4 | **Streaming responses (AI SDK v7)** | Available only in `/chat-next` + `/api/chat/ui-stream` (local); `/` uses legacy `/api/chat/stream` |
| 5 | **Markdown & code rendering (Streamdown/Shiki)** | Available only in `/chat-next` (local) |
| 6 | **Tables & Recharts charts** | Available only in `/chat-next` (local) |
| 7 | **Citations (`SourcesSection`)** | Available only in `/chat-next` (local) |
| 8 | **Web search (Serper)** | Available in backend + `/chat-next` (local) |
| 9 | **Deep research** | Available in backend + `/chat-next` (local) |
| 10 | **Unified tool registry (`GET /api/tools`)** | Available only in `/chat-next` + backend (4 active, 9 planned, 1 disabled) |
| 11 | **Chat history & persistence** | Backend + remote Supabase `conversations`/`messages` working; `/chat-next` uses manual token fallback |
| 12 | **Supabase authentication (Backend JWT)** | Available only in backend (`requireAuth`) |
| 13 | **Login / Signup (Frontend)** | **Not implemented** (only manual Bearer token paste prompt in `/chat-next`) |
| 14 | **Image Workspace** | Integrated in original `/` & backend (`/api/templates`, `/api/generate-image`, frozen) |
| 15 | **Image generation in `/chat-next`** | Intentionally disabled (`allowImageTool: false`, Phase 7G) |
| 16 | **File & attachment handling** | Text extraction (`/api/files/extract`) works in backend/`/chat-next`; **private attachment storage bucket not created** |
| 17 | **Subscription & credit system** | **Not implemented** (DB tables exist remotely; Stripe/credit enforcement not built) |

---

## 10. Screenshot & Browser Preview Identification

All screenshots saved during development were captured by headless Chromium scripts (`phase7e_browser_qa.mjs`, `phase8_browser_qa.mjs`, `phase9_browser_qa.mjs`) against **local development servers**, **NOT** the original `/` site and **NOT** production:

| Screenshot Set | Exact URL Captured | App & Build | Backend Connection | Represents |
| :--- | :--- | :--- | :--- | :--- |
| `phase7e_screenshots/01`–`06` | `http://127.0.0.1:5001/chat-next` | `chat-next/dist` (React + Vite) | Local Express (`:5001`) | **Separate local dev workspace (`/chat-next`)** |
| `phase8_screenshots/01`–`06` | `http://127.0.0.1:5002/chat-next` | `chat-next/dist` (React + Vite) | Local Express (`:5002`) | **Separate local dev workspace (`/chat-next`)** |
| `phase9_screenshots/01`–`03` | `http://127.0.0.1:5001/chat-next` *(earlier `:5002`)* | `chat-next/dist` (React + Vite) | Local Express (`:5001`) | **Separate local dev workspace (`/chat-next`)** |

*(In `phase9_browser_qa.mjs`, only a headless `document.title` check navigated to `http://127.0.0.1:5001/` to verify `index.html` returned `"AI Mestrio"` untouched.)*

---

## 11. Final Classification (A–G)

- **A. What is genuinely built?**  
  A complete React/TypeScript chat frontend (`chat-next/`), an Express + Vercel AI SDK v7 backend (`server/`), Unified Tool Registry (4 active tools), Phase 8 Markdown/chart/citation UI, Phase 10 reliability hardening, 9-table Supabase schema + anonymous RLS, and the preserved Frozen Image Workspace.
- **B. What exists only locally?**  
  **All** code from Phase 3.0 (`1cc90b8` unpushed) and Phases 6–11C (`chat-next/`, `docs/`, restructured `server/`), plus `server/.env` and `chat-next/dist/`.
- **C. What exists remotely in Supabase (`tacqsiocsqtffqxuwwta`)?**  
  All 9 tables (`conversations`: 14 rows, `messages`: 75 rows), active FK constraints, 9/9 verified anonymous RLS policies, and the public `templates` storage bucket.
- **D. What has actually been pushed to GitHub?**  
  Only up to commit `fbe67cb` (`tag: images-v1.0-frozen`) on `origin/main` and `origin/images-workspace-locked`. **Nothing after `fbe67cb` is on GitHub.**
- **E. What is deployed to the real Mestrio AI website?**  
  **UNKNOWN / NOT DEPLOYED** (no production domain or deployment pipeline is configured in the repo, and GitHub `origin/main` is still at `fbe67cb`).
- **F. Is the new chat system integrated into the original website?**  
  **No.** `/` still serves legacy `index.html`; `/chat-next` is a separate local side-by-side app.
- **G. What remains before the actual website is ready for users?**  
  Login/Signup UI + Supabase Auth, integrating `/chat-next` into `/` while preserving Image Workspace, authenticated User A/B RLS verification, private `attachments` storage bucket + RLS, billing/credits (if required), committing/pushing to GitHub, and deploying behind HTTPS + reverse proxy.

---

## 12. Recommended Next Steps (Do Not Execute Yet)

1. **Commit & Push Baseline Safety Checkpoint**: Review and commit the verified `cleanup-backend-restructure` work to GitHub (excluding `.env` and `scratch/`) so work is safely backed up.
2. **Integrate `/chat-next` into the Original Website (`/`)**: Replace the legacy chat view in `/` with the React `/chat-next` app while preserving all Frozen Image Workspace routes and UI.
3. **Implement Real Supabase Login/Signup**: Add `@supabase/supabase-js` client auth, Login/Signup/Logout UI, and automatic JWT refresh in `chat-next/src/lib/auth.ts`.
4. **Connect Account-Based Chat History**: Wire `AssistantChatTransport` and `/api/history/conversations` to real user sessions (removing the manual Bearer token paste fallback).
5. **Complete Authenticated RLS & Attachment Storage Security**: Create private `attachments` bucket (with approval), add `storage.objects` RLS, and run live User A vs User B isolation tests across all 9 tables.
6. **Integrate Remaining AI Tools**: Implement the 9 `planned` tools and re-enable `image_generation` through the Unified Tool Registry when authorized.
7. **Implement Subscription & Credit Management**: Connect Stripe/webhooks and enforce `subscriptions` / `credit_transactions` quotas.
8. **Full Production QA**: Run E2E browser, security, and load tests against staging with `NODE_ENV=production` and `DEV_BYPASS_AUTH` disabled.
9. **Deploy Complete Integrated Website**: Configure production domain, HTTPS, Nginx/Cloudflare reverse proxy, `CORS_ALLOWED_ORIGINS`, and deploy.
