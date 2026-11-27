# Final Architecture Report — Mestrio AI

## Unified Architecture Overview

Mestrio AI now runs on a single unified React 18 + TypeScript SPA (`chat-next/`) served in production by the Express backend (`server/src/index.js`) on port `5001`:

1. **Application Shell & Contexts (`chat-next/src/context/`):**
   - `ThemeContext` (Light / Dark / System tokens synced with `html.dark`)
   - `I18nContext` (Multi-language + RTL mirroring via `/i18n.js`)
   - `AuthProfileContext` (User profile, plan state, auth token)
   - `ChatSessionContext` (Immediate mount hydration via `listConversations(50)` + `localStorage` cache)
   - `AppShellContext` (Workspace routing, collapsed sidebar, mobile drawer, modal manager)
2. **Unified Navigation & Overlays (`chat-next/src/components/layout/` & `modals/`):**
   - `MasterSidebar` (`#sidebar`), `AccountDropdownMenu`, `SettingsModal`, `PlanSelectionModal`, `DeleteAccountModal`, `FeedbackModal`, `CommandPaletteModal`.
3. **Workspaces (`chat-next/src/components/`):**
   - **New Chat (`/`):** `ChatWorkspace.tsx` (`@assistant-ui/react` + `@ai-sdk/react` v4 + `AssistantChatTransport` -> `/api/chat/ui-stream`).
   - **Image Workspace (`/images`):** `ImagesWorkspaceContainer.tsx` -> `ImageWorkspace.tsx` -> `ImageHomeView.tsx` + `TemplatePreviewModal.tsx` + `ImageStudioEditor.tsx` + `ImageLightboxModal.tsx` (4 finalized modes: `Generate Image`, `Remove Background`, `Precise Edit`, `Upscale Image`).
   - **Slides Studio (`/slides`):** `SlidesWorkspace.tsx`
   - **Projects (`/projects`):** `ProjectsWorkspace.tsx`
   - **Library (`/library`):** `LibraryWorkspace.tsx`
4. **Backend (`server/src/`):**
   - Express serves `chat-next/dist/index.html` for `/`, `/images`, `/slides`, `/projects`, `/library`, `/chat-embed` and handles `/api/*` + `/health`.
