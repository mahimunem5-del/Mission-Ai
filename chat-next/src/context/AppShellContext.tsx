import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getPathForWorkspace,
  isWorkspaceBlocked,
  normalizeWorkspaceFromPath,
  type WorkspaceId
} from '../config/workspaces';

export type ActiveModalId = 'settings' | 'upgrade' | 'delete-account' | 'feedback' | null;

interface AppShellContextValue {
  activeWorkspace: WorkspaceId;
  navigateToWorkspace: (ws: WorkspaceId, options?: { replace?: boolean }) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  activeModal: ActiveModalId;
  openModal: (modal: ActiveModalId) => void;
}

const SIDEBAR_COLLAPSED_KEY = 'mestrio_sidebar_collapsed';

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const AppShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => {
    if (typeof window === 'undefined') return 'chat';
    return normalizeWorkspaceFromPath(window.location.pathname);
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ActiveModalId>(null);

  const navigateToWorkspace = useCallback(
    (ws: WorkspaceId, options: { replace?: boolean } = {}) => {
      const target: WorkspaceId = isWorkspaceBlocked(ws) ? 'chat' : ws;
      setActiveWorkspace(target);
      setMobileSidebarOpen(false);
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-workspace', target === 'slides' ? 'slides-studio' : target);
      }
      if (typeof window !== 'undefined') {
        const nextPath = getPathForWorkspace(target);
        if (window.location.pathname !== nextPath) {
          if (options.replace) {
            window.history.replaceState({ workspace: target }, '', nextPath);
          } else {
            window.history.pushState({ workspace: target }, '', nextPath);
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = normalizeWorkspaceFromPath(window.location.pathname);
    if (initial !== activeWorkspace) {
      setActiveWorkspace(initial);
    }
    const targetPath = getPathForWorkspace(initial);
    if (
      window.location.pathname !== targetPath &&
      !window.location.pathname.startsWith('/chat-embed')
    ) {
      window.history.replaceState({ workspace: initial }, '', targetPath);
    }
    document.body.setAttribute('data-workspace', initial === 'slides' ? 'slides-studio' : initial);

    const onPopState = () => {
      const next = normalizeWorkspaceFromPath(window.location.pathname);
      setActiveWorkspace(next);
      document.body.setAttribute('data-workspace', next === 'slides' ? 'slides-studio' : next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const openModal = useCallback((modal: ActiveModalId) => {
    setActiveModal(modal);
  }, []);

  return (
    <AppShellContext.Provider
      value={{
        activeWorkspace,
        navigateToWorkspace,
        isSidebarCollapsed,
        toggleSidebarCollapsed,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        isSearchModalOpen,
        setSearchModalOpen,
        activeModal,
        openModal
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
};

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used inside AppShellProvider');
  }
  return ctx;
}
