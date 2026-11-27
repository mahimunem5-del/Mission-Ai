export type WorkspaceId = 'chat' | 'images' | 'slides' | 'projects' | 'library';

export interface WorkspaceLockConfig {
  locked: boolean;
  hideInSidebar: boolean;
}

/**
 * Mirrors WORKSPACE_LOCK.md.
 * Image Workspace was unlocked by owner (Munem Mahi) on 2026-11-27 for React migration,
 * while keeping hideInSidebar: true per existing sidebar visibility preference.
 */
export const MESTRIO_WORKSPACES: Record<WorkspaceId, WorkspaceLockConfig> = {
  chat: { locked: false, hideInSidebar: false },
  images: { locked: false, hideInSidebar: false },
  slides: { locked: false, hideInSidebar: false },
  projects: { locked: false, hideInSidebar: false },
  library: { locked: false, hideInSidebar: false }
};

export function getWorkspaceConfig(id: WorkspaceId): WorkspaceLockConfig {
  if (typeof window !== 'undefined') {
    const winCfg = (window as unknown as { MESTRIO_WORKSPACES?: Record<string, WorkspaceLockConfig> })
      .MESTRIO_WORKSPACES?.[id];
    if (winCfg) return winCfg;
  }
  return MESTRIO_WORKSPACES[id];
}

export function isWorkspaceBlocked(id: WorkspaceId): boolean {
  const cfg = getWorkspaceConfig(id);
  return Boolean(cfg && cfg.locked);
}

export function isWorkspaceHiddenInSidebar(id: WorkspaceId): boolean {
  const cfg = getWorkspaceConfig(id);
  return Boolean(cfg && (cfg.locked || cfg.hideInSidebar));
}

export function normalizeWorkspaceFromPath(pathname: string): WorkspaceId {
  const clean = (pathname || '/').replace(/\/+$/, '').toLowerCase() || '/';
  if (clean === '/slides') return 'slides';
  if (clean === '/projects') return 'projects';
  if (clean === '/library') return 'library';
  if (clean === '/images') {
    return isWorkspaceBlocked('images') ? 'chat' : 'images';
  }
  return 'chat';
}

export function getPathForWorkspace(id: WorkspaceId): string {
  const safeId = isWorkspaceBlocked(id) ? 'chat' : id;
  switch (safeId) {
    case 'slides':
      return '/slides';
    case 'projects':
      return '/projects';
    case 'library':
      return '/library';
    case 'images':
      return '/images';
    case 'chat':
    default:
      return '/';
  }
}
