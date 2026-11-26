# Phase 9 — Regression & E2E Report (`PHASE9_REGRESSION_REPORT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Automated Test & Build Results (Post-Final Edit)

| Suite / Command | Result | Coverage |
| :--- | :--- | :--- |
| `node tests/test_phase9_tools.js` (`server`) | **5 passed, 0 failed** | 14-category registry, blocked planned/disabled tools, unsupported model handling, safe math evaluator + injection rejection, validation/timeout errors, `GET /api/tools`, real GPT `calculate_math` stream, `mahi-engine` fallback notice |
| `node tests/test_phase7d_ai_sdk.js` (`server`) | **6 passed, 0 failed** | AI SDK v7 `OpenRouter`, `Mahi Engine`, `Web Search` & `Deep Research` (executed via Unified Tool Engine), abort handling |
| `npm test` (`server/tests/runAllTests.js`) | **26 PASSED, 0 FAILED** | Full backend modular monolith & Frozen Image Workspace regression suite |
| `npm test` (`chat-next`, `vitest run`) | **Test Files 3 passed (3), Tests 8 passed (8)** | Mapper, history/models, and universal renderer + tool card tests |
| `npm run build` (`chat-next`, `tsc -b && vite build`) | **Passed (`✓ built in 19.14s`)** | TypeScript strict check + Vite production bundle |

---

## 2. Live Headless Chromium E2E QA (`http://127.0.0.1:5002/chat-next`)

- **Tools Menu (`1440x900`)**: `TOOLS_MENU_CHECK: {"hasUnifiedHeader":true,"hasMathTool":true,"hasPlannedBadge":true}` (**PASSED**).
- **Multi-Tool Execution (`calculate_math` + `render_chart`)**: Real GPT-4o Mini invoked both tools in one turn; UI rendered `Completed` tool cards, `= 1125`, and `Phase 9 Revenue` bar chart with `overflow: false` (**PASSED**).
- **Mobile `375x812`**: `MOBILE_375_OVERFLOW: false` (**PASSED**).
- **Legacy `/`**: `LEGACY_ROOT_TITLE: AI Mestrio` untouched (**PASSED**).
- **Console & Exceptions**: `CONSOLE_ERRORS: []`, `PAGE_EXCEPTIONS: []` (**PASSED**).
