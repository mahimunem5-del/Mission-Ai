# Tool Runtime Report

**Date**: 2026-11-26  

---

## 1. Frontend-Exposed Tools (Strictly Real & Functional)

`ChatWorkspace.tsx` filters `GET /api/tools` to `toolItem.implemented && toolItem.status === 'active'` — **only 4 real, functional tools** are exposed in the Chat UI:

| Tool | Backend Handler | Model Compatibility | Verified Execution |
| :--- | :--- | :--- | :--- |
| `web_search` | `toolRegistry.js` / Serper | `capabilities.tools: true` / `web-search` toggle | ✅ `test_phase7d_ai_sdk.js` + `08_web_search_execution.png` |
| `deep_research` | `toolRegistry.js` / Serper | `deep-research` toggle | ✅ `test_phase7d_ai_sdk.js` + `09_deep_research_execution.png` |
| `render_chart` | `toolRegistry.js` + `ChartRenderer.tsx` | `capabilities.tools: true` | ✅ `test_phase9_tools.js` |
| `calculate_math` | `toolRegistry.js` (safe parser) | `capabilities.tools: true` | ✅ `test_phase9_tools.js` + `05_real_ai_response.png` (`1125`) |

- **Image Generation (`image_generation`)**: Disabled (`allowImageTool: false` in `uiStreamOrchestrator.js`, `status: 'disabled'`), NOT exposed in Chat.
- **9 `planned` tools**: Not exposed as fake UI checkboxes in `ChatWorkspace.tsx`.
