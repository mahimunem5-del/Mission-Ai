# Pre-Phase 14 — Safe Git Synchronization Plan

**Audit Date:** 2026-11-27  
**Target Branch:** `cleanup-backend-restructure` (currently at `0d41ab7`, matching `origin/cleanup-backend-restructure`)  
**Protected Refs (Do Not Touch):** `main` (`1cc90b8`), `origin/main` (`fbe67cb`), `images-workspace-locked` (`fbe67cb`), `images-v1.0-frozen`

---

## 1. Safety Assessment

- **Working Tree Safe to Commit?** **YES** — all `9/9` Vitest files (`19/19` tests), `tsc -b && vite build`, `26/26` backend tests, `6/6` AI SDK v7 tests, `3/3` Phase 6 DB tests, `2/2` Phase 6.5 tests, and `9/9` Phase 11C anon RLS checks pass, and **zero secrets** are present.
- **Safe to Push to `origin/cleanup-backend-restructure`?** **YES** (after committing the clean groups below and updating/removing stale `vercel.json` & `serve.json`). Never push directly to `main` yet.

---

## 2. Recommended Commit Boundaries

1. **Commit 1 — Unified React SPA & Workspace Migration**
   - **Include:** `WORKSPACE_LOCK.md`, `chat-next/index.html`, `chat-next/src/**` (migrated shell, `images/`, `slides/`, `projects/`, `library/`, `modals/`, `layout/`, `context/`, `services/`, `styles/`, `test/`), `D chat-next/src/components/Sidebar.tsx`, `chat-next/tailwind.config.js`, `chat-next/vite.config.ts`.
   - **Message:** `feat(chat-next): migrate unified Mestrio AI shell and all 5 workspaces to React`
2. **Commit 2 — Backend Purification, Vectorize Removal & Legacy Purge**
   - **Include:** `package.json`, `server/package.json`, `server/package-lock.json`, `server/src/index.js`, `server/src/controllers/chatController.js`, `server/src/controllers/imageController.js`, `server/src/routes/chat.js`, `server/src/routes/image.js`, `server/tests/runAllTests.js`, `D index.html`, `D src/App.tsx`, `D src/components/ComparePickerModal.tsx`, `D src/components/ModelDropdown.tsx`, `D src/config/models.ts`, `D test_anchors.js`, `D scratch/*`.
   - **Message:** `refactor(server,root): purify live-only Express + React serving and remove Vectorize & legacy chat`
3. **Commit 3 — Hosting Config Cleanup (Recommended Before Push)**
   - **Include:** Updated/removed `vercel.json` and `serve.json` (removing stale `/vectorize` and `/index.html` rewrites).
   - **Message:** `chore(config): remove stale vectorize and legacy index.html hosting rewrites`
4. **Commit 4 — Phase 12–13, Purification & Pre-Phase 14 Audit Documentation**
   - **Include:** `docs/audits/REACT_MIGRATION_*`, `docs/final-migration/`, `docs/final-source-audit/`, `docs/final-verification/`, `docs/legacy-chat-purge/`, `docs/master-audit/`, `docs/phase12/PHASE12_GITHUB_PUSH_VERIFICATION.md`, `docs/phase13/`, `docs/source-purification/`, `docs/unified-serving-fix/`, `docs/unified-shell/`, `docs/pre-phase14/`.
   - **Message:** `docs(audit): add unified migration, purification, master audit, and pre-phase14 reports`

---

## 3. Exclusions

- Never `git add -f` any `.env`, `.env.*`, `chat-next/dist/`, `node_modules/`, `.vite/`, or `*.tsbuildinfo`.
- Keep `src/components/ImageWorkspace.tsx` and `src/utils/imagePreprocessing.ts` untouched to preserve the 13-file Image Workspace SHA-256 baseline.
