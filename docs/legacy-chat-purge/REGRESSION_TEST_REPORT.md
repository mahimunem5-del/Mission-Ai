# Regression Test Report — Legacy Chat Purge

**Date**: 2026-11-26  
**Environment**: Local Development (`http://127.0.0.1:5003`) — *Staging: Not Configured; Production: Not Deployed*  

---

| Suite | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **Frontend Vitest** | `npm --prefix chat-next test` | ✅ **8 passed, 0 failed** | 3 test files (`uiMessageMapper.test.ts`, `historyAndModels.test.ts`, `universalRenderer.test.tsx`). |
| **TypeScript & Vite Build** | `npm --prefix chat-next run build` | ✅ **Passed** | `tsc -b && vite build` succeeded cleanly in `19.52s`. |
| **Full Backend Suite** | `npm --prefix server test` | ✅ **26 passed, 0 failed** | Covers `/api/chat/ui-stream` (OpenRouter, Mahi Engine, Web Search, Deep Research, `calculate_math`, `400` validation, `AbortController`), `/api/chat/compare`, history, rate limit, cache, and legacy `404` checks. |
| **AI SDK v7 Streaming Tests** | `node server/tests/test_phase7d_ai_sdk.js` | ✅ **6 passed, 0 failed** | Real OpenRouter, Mahi Engine, Web Search, Deep Research, auth `401`, and abort tests. |
| **Unified Tool Tests** | `node server/tests/test_phase9_tools.js` | ✅ **5 passed, 0 failed** | Tool registry, math evaluator, timeout handling, and live `calculate_math` execution. |
| **Chromium Desktop & Mobile E2E** | `http://127.0.0.1:5003/` | ✅ **Passed** | Desktop (`1440x900`): `/` (`Mestrio Universal Chat`), live `calculate_math` (`14 * 15 = 210`) streaming, `/slides`, `/projects`, `/library`, `/classic` (`404`), `/legacy` (`404`), `/index.html` (`chat-next`). Mobile (`375x812`): `/` renders with `noOverflow=true`, `0` console errors, `0` failed `/api/` calls. |
