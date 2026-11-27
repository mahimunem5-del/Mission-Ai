# Phase 13I — Cutover & Rollback Safety Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Cutover Summary

- Root `/` now serves `chat-next/dist/index.html` (built with `base: '/'`).
- `/chat-next*` redirects (`302`) to `/`.
- Original `index.html` remains preserved in the repo and is served at `/classic`, `/legacy`, `/vectorize`, `/create/svg/vectorize`, `/slides`, `/projects`, and `/library`.
- `main` (`1cc90b8`), `origin/main` (`fbe67cb`), `images-workspace-locked` (`fbe67cb`), and tag `images-v1.0-frozen` remain untouched.

## 2. Instant Rollback Procedure

If `/` ever needs to revert to legacy `index.html`:
1. In `server/src/index.js`, restore `'/'` to `VALID_LEGACY_SPA_ROUTES` (serving `rootDir/index.html`) and mount `chatNextDistDir` back at `/chat-next` (or `git checkout 0d41ab7 -- server/src/index.js chat-next/vite.config.ts chat-next/src/components/Sidebar.tsx` and rebuild `chat-next`).
2. `index.html` and all legacy `/api/chat/stream` handlers remain intact and require zero restoration.

## 3. Authentication Boundary (Phase 13G)

- Login/Signup was **not** implemented in Phase 13 (deferred to Phase 14).
- `requireAuth` remains enforced on protected routes (`/api/history/*`, `/api/profile`, `/api/attachments`, `/api/usage`, `/api/files`, `/api/transcribe`, `/api/generate-image`, `/api/images`, `POST/PUT/DELETE /api/templates`, `/api/chat/ui-stream` when `DEV_BYPASS_AUTH` is off).
- Authenticated User A / User B isolation and private `attachments` storage remain **BLOCKED** until Phase 14 Login/Signup.
