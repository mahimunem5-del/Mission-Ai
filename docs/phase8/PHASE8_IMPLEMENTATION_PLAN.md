# Phase 8 — Implementation Plan (`PHASE8_IMPLEMENTATION_PLAN.md`)

**Branch**: `cleanup-backend-restructure`  
**Scope**: `/chat-next` only (zero changes to legacy `/`, frozen Image Workspace, or backend orchestration)

---

## 1. Objectives

Elevate the `/chat-next` assistant response experience to a consistent, publication-grade standard while preserving:
- Vercel AI SDK v7 (`useChat`, `AssistantChatTransport`) + `@assistant-ui/react` (`useAISDKRuntime`, `useAuiState`)
- `OpenRouter`, `Mahi Engine`, `Web Search`, `Deep Research`, authentication, and persistence
- Normal AI thinking and streaming animations (zero simulated tool-loading states)
- Disabled image generation (reserved for its dedicated integration phase)

---

## 2. Planned Changes (`/chat-next` Only)

1. **Assistant Turn Header & Status Presentation (`ChatWorkspace.tsx`, `UniversalMessageRenderer.tsx`)**:
   - Add a consistent assistant header above every assistant message showing Mestrio AI identity, resolved model badge, active mode/search indicator, and real streaming indicator when `status === 'streaming'`.
   - Standardize interrupted, fallback, and error banners with clean accessible contrast.

2. **Structured Markdown, Code Blocks, Blockquotes & Tables (`UniversalMessageRenderer.tsx`, `index.css`)**:
   - Refine `prose` typography hierarchy, blockquote styling, inline code pills, and `tabular-nums` table cells inside `overflow-x-auto` containers.
   - Add a `CodeBlockWrapper` around fenced code blocks (preserving `@streamdown/code` syntax highlighting and `chart`/`recharts` interception) with language label and one-click **Copy** action.

3. **Sources & Citations Grid (`UniversalMessageRenderer.tsx`)**:
   - Upgrade `SourcesSection` into a structured, responsive citation card grid displaying `[index]`, domain/hostname, title, and external link indicator.

4. **Chart & Action Bar Polish (`ChartRenderer.tsx`, `ChatWorkspace.tsx`)**:
   - Add subtle chart type badge (`Bar` / `Line` / `Pie`) and clean framing in `ChartRenderer`.
   - Standardize the assistant footer action bar (`Copy`, `Regenerate` on latest turn, and optional real token/latency metadata when present).

5. **Verification**:
   - Add/update Vitest unit tests in `chat-next/src/test/universalRenderer.test.tsx`.
   - Run backend regression suites (`test_phase6_database.js`, `test_phase6_5_persistence.js`, `test_phase7d_ai_sdk.js`, `npm test`), frontend tests + build (`npm test`, `npm run build`), and live headless Chromium QA across desktop (`1440x900`) and mobile (`375x812`).
