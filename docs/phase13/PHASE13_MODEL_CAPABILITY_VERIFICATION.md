# Phase 13E — Model Capability Verification Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Verified Model Routing & Capability Preservation

| Check | Status | Evidence |
| :--- | :--- | :--- |
| Selected model ID reaches `modelRouter.js` & `providerRegistry.js` | ✅ **VERIFIED** | `ChatWorkspace.tsx` sends `model` in `AssistantChatTransport`; `test_phase7d_ai_sdk.js` test 1 & 3 verify `requestedModel === 'openai/gpt-4o-mini'` & `resolvedModel` |
| Mahi Engine routing & streaming preserved | ✅ **VERIFIED** | `test_phase7d_ai_sdk.js` test 4 (`provider: 'mahi-engine'`, `model: 'gemini-3.5-flash-lite'`) |
| System prompt not duplicated & `allowImageTool: false` preserved | ✅ **VERIFIED** | `uiStreamOrchestrator.js` calls `buildSystemPrompt` once with `allowImageTool: false` |
| Tool calling gated by actual model capability (`capabilities.tools`) | ✅ **VERIFIED** | `test_phase9_tools.js` test 2 & 5 (`gpt-4o-mini` runs `calculate_math`, `mahi-engine` disables tools gracefully) |
| Live `/` browser GPT-4o-mini tool call + Markdown/table/code | ✅ **VERIFIED** | `phase13_root_qa.mjs` at `http://127.0.0.1:5003/` (`has1125: true, hasTable: true, hasPre: true`) |
| Web Search & Deep Research streaming (`data-sources`, `data-status`) | ✅ **VERIFIED** | `test_phase7d_ai_sdk.js` test 5 (8 web sources, 15 deep research sources) |
| AbortController stream cancellation | ✅ **VERIFIED** | `test_phase7d_ai_sdk.js` test 6 |
