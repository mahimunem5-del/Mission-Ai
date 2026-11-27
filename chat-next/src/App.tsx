import React, { useMemo } from 'react';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ImagesWorkspaceContainer } from './components/images/ImagesWorkspaceContainer';
import { MasterSidebar } from './components/layout/MasterSidebar';
import { LibraryWorkspace } from './components/library/LibraryWorkspace';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { DeleteAccountModal } from './components/modals/DeleteAccountModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { PlanSelectionModal } from './components/modals/PlanSelectionModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProjectsWorkspace } from './components/projects/ProjectsWorkspace';
import { SlidesWorkspace } from './components/slides/SlidesWorkspace';
import { AppShellProvider, useAppShell } from './context/AppShellContext';
import { AuthProfileProvider } from './context/AuthProfileContext';
import { ChatSessionProvider } from './context/ChatSessionContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';

const UnifiedShell: React.FC = () => {
  const { activeWorkspace, setMobileSidebarOpen } = useAppShell();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#191919] text-slate-800 dark:text-[#f3f3f3]">
      <MasterSidebar />

      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-[#191919]">
        {activeWorkspace === 'chat' ? (
          <ChatWorkspace
            hideSidebar
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          />
        ) : activeWorkspace === 'slides' ? (
          <SlidesWorkspace />
        ) : activeWorkspace === 'projects' ? (
          <ProjectsWorkspace />
        ) : activeWorkspace === 'library' ? (
          <LibraryWorkspace />
        ) : activeWorkspace === 'images' ? (
          <ImagesWorkspaceContainer />
        ) : (
          <ChatWorkspace
            hideSidebar
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          />
        )}
      </main>

      <CommandPaletteModal />
      <SettingsModal />
      <PlanSelectionModal />
      <DeleteAccountModal />
      <FeedbackModal />
    </div>
  );
};

export const App: React.FC = () => {
  const isEmbeddedIframe = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('embedded=1');
  }, []);

  if (isEmbeddedIframe) {
    return <ChatWorkspace />;
  }

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProfileProvider>
          <AppShellProvider>
            <ChatSessionProvider>
              <UnifiedShell />
            </ChatSessionProvider>
          </AppShellProvider>
        </AuthProfileProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
