# Final Source Architecture — Mestrio AI

```text
D:\Ai platform
├── chat-next/                  # Canonical React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── App.tsx             # Unified workspace router & modal host
│   │   ├── main.tsx            # React root mount (#root)
│   │   ├── adapters/           # AI SDK v7 message mapper
│   │   ├── components/
│   │   │   ├── ChatWorkspace.tsx
│   │   │   ├── UniversalMessageRenderer.tsx
│   │   │   ├── ChartRenderer.tsx
│   │   │   ├── images/         # Ideogram-style Image Workspace (4 workflows)
│   │   │   ├── layout/         # MasterSidebar, AccountDropdownMenu, RecentChatsList
│   │   │   ├── library/        # LibraryWorkspace, LibraryModals
│   │   │   ├── modals/         # Settings, PlanSelection, CommandPalette, DeleteAccount, Feedback
│   │   │   ├── projects/       # ProjectsWorkspace, ProjectDetailView, ProjectModals
│   │   │   └── slides/         # SlidesWorkspace, SlidesDeckViewer, SlidesTemplateModal
│   │   ├── config/             # workspaces.ts
│   │   ├── context/            # AppShell, AuthProfile, ChatSession, I18n, Theme
│   │   ├── data/               # designTemplates.ts
│   │   ├── lib/                # apiClient.ts, auth.ts
│   │   ├── services/           # libraryStorage, projectsStorage, slidesService
│   │   ├── styles/             # tokens, sidebar, modals, images, slides, projects, library
│   │   └── test/               # 9 Vitest suites (19 tests)
│   └── dist/                   # Production bundle served by Express
├── server/                     # Canonical Node.js + Express backend (port 5001)
│   ├── src/
│   │   ├── index.js            # Express entrypoint (API routers + SPA routes)
│   │   ├── config/             # env.js, imageModelRegistry.js
│   │   ├── controllers/        # chat, image, history, models, profile, template, etc.
│   │   ├── middleware/         # rateLimit.js, validate.js
│   │   ├── orchestrator/       # aiOrchestrator, compareOrchestrator, researchOrchestrator
│   │   ├── routes/             # chat, image, history, models, profile, templates, tools, etc.
│   │   ├── services/           # cache, imageAdapters, modelRouter, search, usage, etc.
│   │   └── utils/              # errors, imageOptimizer, logger
│   └── tests/runAllTests.js    # 26-test backend monolith runner
├── public/                     # Static workflow & template assets
└── docs/                       # Architecture, verification & purification reports
```
