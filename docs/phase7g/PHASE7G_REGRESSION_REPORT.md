# Phase 7G — Regression & E2E Verification Report (`PHASE7G_REGRESSION_REPORT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Automated Test & Build Results (Post-Final Edit)

| Suite / Command | Result | Scope |
| :--- | :--- | :--- |
| `node tests/test_phase7d_ai_sdk.js` (`server`) | **6 passed, 0 failed** | AI SDK v7 `OpenRouter`, `Mahi Engine`, `Web Search`, `Deep Research`, abort handling |
| `npm test` (`server/tests/runAllTests.js`) | **26 PASSED, 0 FAILED** | Full backend modular monolith & Frozen Image Workspace regression suite |
| `npm test` (`chat-next`, `vitest run`) | **Test Files 3 passed (3), Tests 7 passed (7)** | Mapper, history/models, and universal renderer tests |
| `npm run build` (`chat-next`, `tsc -b && vite build`) | **Passed (`✓ built in 20.80s`)** | TypeScript strict check + Vite production bundle |

---

## 2. Live API & Headless Chromium E2E Checks (`http://127.0.0.1:5002`)

1. **`GET /api/models`**: Returned `16` models and `0` image generation models (**PASSED**).
2. **Ordinary Prompts via `POST /api/chat/ui-stream` (No Image Generation Triggered)**:
   - `"Can you make graphs?"` -> Normal conversational text (`225` chars, zero `data-image` / `generate_image` / `"Generating image..."`) (**PASSED**).
   - `"Explain image generation."` -> Normal conversational text (`1639` chars, zero `data-image` / `generate_image`) (**PASSED**).
   - `"Can you create a chart?"` -> Normal conversational text (`267` chars, zero `data-image` / `generate_image`) (**PASSED**).
   - `"How does AI generate pictures?"` -> Normal conversational text (`1509` chars, zero `data-image` / `generate_image`) (**PASSED**).
3. **Explicit Image Generation Request via `POST /api/chat/ui-stream`**:
   - `"Generate an image of a red sports car."` -> Responded clearly that Image Generation is not currently available in this chat workspace; zero fake execution, zero `data-image`, zero `"Generating image..."` (**PASSED**).
4. **Live Chromium E2E on `/chat-next`**:
   - Submitted `"Generate an image of a mountain."` in `/chat-next` UI -> Completed cleanly with `hasImgTag: false`, `hasGeneratingText: false`, `hasCopyBtn: true`, `0` console errors, `0` page exceptions (**PASSED**).
5. **Legacy `/` Preservation**:
   - Navigated to `http://127.0.0.1:5002/` -> `document.title === "AI Mestrio"` untouched (**PASSED**).
