# Phase 9 — Central Tool Registry & Schema Design (`PHASE9_TOOL_REGISTRY_DESIGN.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Tool Categories & Implementation Matrix (Honest Status)

| Tool ID | Category | Status | Execution Backend | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `web_search` | `web-search` | **Implemented** | `fetchWebContext` (Serper) | Emits `data-sources`; 10s timeout, 1 retry |
| `deep_research` | `deep-research` | **Implemented** | `executeDeepResearch` | Multi-query research; emits `data-status` + `data-sources` |
| `render_chart` | `charts-and-graphs` | **Implemented** | Zod validator + normalizer | Produces `chartSpec` rendered by `ChartRenderer` (`bar`/`line`/`pie`) |
| `calculate_math` | `math-reasoning` | **Implemented** | Safe deterministic evaluator | Evaluates arithmetic & `Math.*` functions without `eval` injection |
| `image_generation` | `image-generation` | **Disabled** | Reserved (Phase 7G) | Frozen Image Workspace remains separate |
| `image_understanding` | `image-understanding` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `file_understanding` | `file-understanding` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `pdf_analysis` | `pdf-analysis` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `document_generation` | `document-generation` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `presentation_generation` | `presentation-generation` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `spreadsheet_analysis` | `spreadsheet-analysis` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `data_analysis` | `data-analysis` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `code_execution` | `code-execution` | **Planned** | Not implemented | Registered in catalog as `planned` |
| `external_connectors` | `external-connectors` | **Planned** | Not implemented | Registered in catalog as `planned` |

---

## 2. Normalized Execution Envelope

Every tool invocation through `executeUnifiedTool(...)` returns:
```json
{
  "ok": true,
  "toolName": "calculate_math",
  "durationMs": 2,
  "data": { "expression": "15 * 24 + 10", "result": 370 }
}
```
On validation failure, timeout, abort, or runtime error:
```json
{
  "ok": false,
  "toolName": "web_search",
  "durationMs": 10004,
  "error": { "code": "TOOL_TIMEOUT", "message": "Tool web_search timed out after 10000ms" }
}
```

---

## 3. Security & Governance Boundaries

1. **Allowlist Enforcement**: Only tools with `implemented: true` and `status: 'active'` can be converted into AI SDK `tool(...)` instances; `planned` and `disabled` tools are never executable.
2. **Zod Input Validation**: All arguments are parsed through each tool's Zod schema before execution.
3. **Timeout & Abort Propagation**: Every tool call races against `timeoutMs` and respects the HTTP request's `AbortController` signal.
4. **No Arbitrary Code Execution**: `calculate_math` uses a strict character allowlist + whitelisted `Math` functions only.
5. **Provider Independence**: Tool definitions use AI SDK v7 `tool({ description, inputSchema, execute })` without OpenAI/Anthropic/Google vendor-specific tool formats.
