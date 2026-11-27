# Final Migration Regression Test Report

**Date**: 2026-11-26  
**Local Server**: `http://127.0.0.1:5003` (Express + `chat-next/dist`)  

---

## 1. Automated & Browser Test Results

| Suite | Result |
| :--- | :--- |
| `chat-next` `npx vitest run` | ✅ **3 files, 8 passed** |
| `chat-next` `npx tsc -b --noEmit` | ✅ **0 errors** |
| `chat-next` `npm run build` | ✅ **Built in 21.37s** |
| `node tests/test_phase6_database.js` | ✅ **3 passed, 0 failed** |
| `node tests/test_phase6_5_persistence.js` | ✅ **2 passed, 0 failed** |
| `node tests/test_phase7d_ai_sdk.js` | ✅ **6 passed, 0 failed** |
| `node tests/test_phase9_tools.js` | ✅ **5 passed, 0 failed** |
| `node tests/test_phase11_anon_rls.js` | ✅ **9/9 tables PASSED** |
| Chromium E2E (`final_migration_qa.mjs`) | ✅ **14/14 screenshots PASS (`CONSOLE_ERRORS: []`, `PAGE_EXCEPTIONS: []`)** |

---

## 2. Screenshot Evidence (`docs/final-migration/screenshots/`)

All 14 screenshots were captured against **Local Development (`http://127.0.0.1:5003`)** (never represented as production):

| # | File | URL | Viewport | Test Performed | Result |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 1 | `01_homepage_desktop.png` | `http://127.0.0.1:5003/` | `1440x900` | Actual main website homepage at `/` | PASS |
| 2 | `02_new_chat_workspace.png` | `http://127.0.0.1:5003/` | `1440x900` | New Chat Workspace & active Unified Tools menu | PASS |
| 3 | `03_model_selector.png` | `http://127.0.0.1:5003/` | `1440x900` | Model selector focused (`openai/gpt-4o-mini`) | PASS |
| 4 | `04_new_chat_input.png` | `http://127.0.0.1:5003/` | `1440x900` | New Chat composer input populated | PASS |
| 5 | `05_real_ai_response.png` | `http://127.0.0.1:5003/` | `1440x900` | Real GPT-4o-mini response with `calculate_math` | PASS |
| 6 | `06_markdown_and_table_response.png` | `http://127.0.0.1:5003/` | `1440x900` | Markdown & table rendering | PASS |
| 7 | `07_code_response.png` | `http://127.0.0.1:5003/` | `1440x900` | Dark code block with Copy button | PASS |
| 8 | `08_web_search_execution.png` | `http://127.0.0.1:5003/` | `1440x900` | Web Search execution & source cards | PASS |
| 9 | `09_deep_research_execution.png` | `http://127.0.0.1:5003/` | `1440x900` | Deep Research execution & citations | PASS |
| 10 | `10_streaming_state.png` | `http://127.0.0.1:5003/` | `1440x900` | Active SSE streaming state with Stop button | PASS |
| 11 | `11_image_workspace_vectorizer.png` | `http://127.0.0.1:5003/vectorize` | `1440x900` | Frozen Image Workspace `/vectorize` | PASS |
| 12 | `12_slides_studio.png` | `http://127.0.0.1:5003/slides` | `1440x900` | Slides Studio workspace at `/slides` | PASS |
| 13 | `13_projects_and_library.png` | `http://127.0.0.1:5003/projects` | `1440x900` | Projects workspace at `/projects` (and `/library` verified) | PASS |
| 14 | `14_mobile_interface.png` | `http://127.0.0.1:5003/` | `375x812` | Mobile responsive `/` interface (zero overflow) | PASS |
