# Phase 10 — Regression & Security Test Report (`PHASE10_REGRESSION_REPORT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Automated Suites (Post-Final Edit)

| Suite | Result |
| :--- | :--- |
| `node tests/test_phase9_tools.js` | **5 passed, 0 failed** |
| `node tests/test_phase7d_ai_sdk.js` | **6 passed, 0 failed** |
| `npm test` (`server/tests/runAllTests.js`) | **26 PASSED, 0 FAILED** |
| `chat-next` `vitest run` | **Test Files 3 passed (3), Tests 8 passed (8)** |
| `chat-next` `tsc -b && vite build` | **Passed (`✓ built in 19.88s`)** |

---

## 2. Security & Failure Mode Verification

- **Unauthorized `POST /api/chat/ui-stream`**: `401` (**PASSED**).
- **Invalid `enabledTools` (`['bad;tool!']`)**: `400 VALIDATION_ERROR` (**PASSED**).
- **Oversized Payload (`> 2MB`)**: `413` (**PASSED**).
- **Concurrent Client Cancellation (`AbortController`)**: Cleanly aborted upstream stream and decremented `activeStreams` to `0` (**PASSED**).
- **Frozen Image Workspace & Legacy `/`**: Untouched and verified.
