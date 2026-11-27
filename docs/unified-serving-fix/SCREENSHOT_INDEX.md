# Screenshot Index — Unified Serving Fix

**Date**: 2026-11-26  
**Environment**: Local Development (`http://127.0.0.1:5003`) — *not production*  
**Viewport**: `1440x900`  

| # | Feature | Filename | Relative Path | Requested / Actual URL | Console / API Errors | Verification |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | **Main homepage at `/`** | `01_main_homepage.png` | `docs/unified-serving-fix/screenshots/01_main_homepage.png` | `http://127.0.0.1:5003/` | `0 / 0` | ✅ Shows `Mestrio Universal Chat` (`chat-next`) with model selector & active tools. |
| 2 | **New Chat after clicking New Chat** | `02_new_chat_after_click.png` | `docs/unified-serving-fix/screenshots/02_new_chat_after_click.png` | `/slides` → `#new-chat-btn` → `http://127.0.0.1:5003/` | `0 / 0` | ✅ Clicking New Chat from Slides Studio navigates cleanly to `chat-next` at `/`. |
| 3 | **New Chat after browser refresh** | `03_new_chat_after_refresh.png` | `docs/unified-serving-fix/screenshots/03_new_chat_after_refresh.png` | `http://127.0.0.1:5003/` (reloaded) | `0 / 0` | ✅ Hard refresh on `/` preserves `Mestrio Universal Chat` with zero errors. |
| 4 | **Slides Studio** | `04_slides_studio.png` | `docs/unified-serving-fix/screenshots/04_slides_studio.png` | `http://127.0.0.1:5003/slides` | `0 / 0` | ✅ Slides Studio workspace renders cleanly with templates & prompt bar. |
| 5 | **Projects** | `05_projects.png` | `docs/unified-serving-fix/screenshots/05_projects.png` | `http://127.0.0.1:5003/projects` | `0 / 0` | ✅ Projects workspace renders cleanly with existing project cards. |
| 6 | **Library** | `06_library.png` | `docs/unified-serving-fix/screenshots/06_library.png` | `http://127.0.0.1:5003/library` | `0 / 0` | ✅ Library workspace renders cleanly with saved prompts, files, and images. |
| 7 | **Vectorizer** | `07_vectorizer_route.png` | `docs/unified-serving-fix/screenshots/07_vectorizer_route.png` | `/vectorize` → `http://127.0.0.1:5003/` | `0 / 0` | 🔒 `images` workspace is locked (`WORKSPACE_LOCK.md`); route cleanly redirects to `/`. |
| 8 | **Image Workspace** | `08_image_workspace_route.png` | `docs/unified-serving-fix/screenshots/08_image_workspace_route.png` | `/create/svg/vectorize` → `http://127.0.0.1:5003/` | `0 / 0` | 🔒 `images` workspace is locked (`WORKSPACE_LOCK.md`); deep-link cleanly redirects to `/`. |
