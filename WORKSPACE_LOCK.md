# WORKSPACE LOCK & GOVERNANCE RULEBOOK — MESTRIO AI PLATFORM

> **CRITICAL GOVERNANCE DIRECTIVE FOR ANTIGRAVITY IDE, AI CODING AGENTS & ALL ENGINEERS**  
> Before viewing, planning, modifying, creating, refactoring, or deleting ANY file across this entire repository, you **MUST** read this file and inspect `window.MESTRIO_WORKSPACES` in `index.html`.  
> **NEVER VIOLATE A LOCKED WORKSPACE BOUNDARY.**

---

## 1. Universal Governance Rule

1. **Mandatory Pre-Flight Check:**
   Before modifying ANY file in the repository, the AI agent MUST read `window.MESTRIO_WORKSPACES` in `index.html` and `WORKSPACE_LOCK.md`.

2. **Absolute Freeze on Locked Workspaces (`locked: true`):**
   - Any workspace marked with `locked: true` is **STRICTLY FROZEN, COMPLETED, AND READ-ONLY**.
   - AI agents are **FORBIDDEN** from editing, refactoring, restyling, optimizing, renaming, or touching ANY files belonging to a locked workspace unless the user explicitly writes:
     ```
     UNLOCK <WORKSPACE_NAME>
     ```
     (For example: `UNLOCK IMAGES`).
   - If an instruction does not contain this exact unlock phrase, the entire codebase slice for that workspace is completely off-limits.

3. **Dynamic Sidebar & Navigation Visibility (`hideInSidebar`):**
   - When `hideInSidebar: true`, the corresponding sidebar navigation item is cleanly hidden (`display: none` / `hidden`) in both Desktop left sidebar and Mobile navigation drawer without leaving awkward gaps or broken alignment.
   - Any accidental navigation (hash change, deep link, popstate, or programmatic invocation) into a hidden/locked workspace is automatically blocked and redirected cleanly to `chat` (New chat).
   - When `hideInSidebar: false`, the navigation item is displayed normally with 100% of its existing functionality intact.

4. **Shared Core Protection:**
   - Global CSS theme tokens, root stylesheets, font definitions, authentication wrappers, database connectors, and shared layout shells (`#sidebar`, `#top-nav-header`, command palette) must **NEVER** be altered in ways that break or alter any locked workspace.

---

## 2. Current Master Configuration (`window.MESTRIO_WORKSPACES`)

Defined in `index.html`:

```javascript
window.MESTRIO_WORKSPACES = {
  chat:     { locked: false, hideInSidebar: false },
  images:   { locked: false, hideInSidebar: false }, // Unlocked and visible in Master Sidebar
  slides:   { locked: false, hideInSidebar: false },
  projects: { locked: false, hideInSidebar: false },
  library:  { locked: false, hideInSidebar: false }
};
```

---

## 3. Exact File Ownership Map by Workspace

### A. images (CURRENT STATUS: UNLOCKED on 2026-11-27 for Unified React Migration):
> **Owner Authorization:** Officially unlocked by Munem Mahi on 2026-11-27 for migration into `chat-next/`. Backend AI/image controllers (`server/src/routes/image.js`, `server/src/controllers/imageController.js`, `server/src/services/image*`) remain protected and unmodified.
- `src/components/ImageWorkspace.tsx`
- `src/utils/imagePreprocessing.ts`
- `server/src/routes/image.js`
- `server/src/routes/templates.js`
- `server/src/controllers/imageController.js`
- `server/src/controllers/templateController.js`
- `server/src/config/imageModelRegistry.js`
- `server/src/services/preciseEditPlanner.js`
- `server/src/services/referenceIntelligence.js`
- `server/src/services/imagePreflight.js`
- `server/src/services/templateService.js`
- `server/src/services/promptIntelligence.js`
- `server/src/services/imageAdapters/*`
- `server/src/utils/imageOptimizer.js`
- All Image Studio UI markup, modals, and JS handlers in `index.html` (including `#image-studio-workspace`, `#image-home-view`, `#mobile-image-home-container`, `#mobile-image-composer-container`, `#mobile-workspace-drawer`, `#template-white-preview-modal`, `#mobile-template-card-modal`, `src/components/VectorStudioCanvas.tsx`)

---

### B. chat (CURRENT STATUS: LOCKED = false):
Main chat UI/handlers in `index.html` (`#hero-section`, `#chat-messages-container`, `#chat-composer-container`, `#recent-chats-list`), `server/src/routes/chat.js`, `server/src/controllers/chatController.js`, Mahi Engine chat services

---

### C. slides (CURRENT STATUS: LOCKED = false):
Slides workspace UI/handlers in `index.html` (`#slides-studio-workspace`), `src/components/Slides*`, `server/src/routes/slides*`, `server/src/controllers/slides*`

---

### D. projects (CURRENT STATUS: LOCKED = false):
Projects workspace UI/handlers in `index.html` (`#projects-workspace`), `src/components/Projects*`, `server/src/routes/projects*`, `server/src/controllers/projects*`

---

### E. library (CURRENT STATUS: LOCKED = false):
Library workspace UI/handlers in `index.html` (`#library-workspace`), `src/components/Library*`, `server/src/routes/library*`, `server/src/controllers/library*`

---

## 4. Runtime Visibility Helpers & DevTools Control

In the browser runtime (`index.html`), the configuration object is live and reactive on `window.MESTRIO_WORKSPACES`.

```javascript
// 1. Inspect current state:
console.log(window.MESTRIO_WORKSPACES.images);
// => { locked: true, hideInSidebar: true }

// 2. Programmatically unhide Images workspace:
window.MESTRIO_WORKSPACES.images.hideInSidebar = false;
// (Updates sidebar visibility immediately via Proxy)

// 3. Programmatically re-hide Images workspace:
window.MESTRIO_WORKSPACES.images.hideInSidebar = true;

// 4. Force immediate DOM update manually:
window.applyWorkspaceVisibility();
```

---

## 5. Strict Zero-Regression Enforcement

Any pull request, AI agent generation, or commit that touches files in a locked workspace without an explicit `UNLOCK <WORKSPACE_NAME>` instruction will be automatically rejected.
