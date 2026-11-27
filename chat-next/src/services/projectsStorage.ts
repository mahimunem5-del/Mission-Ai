export const PROJECTS_STORAGE_KEY = 'mestrio_projects_v1';
export const PROJECT_FILES_PREFIX = 'project_files_';
export const PROJECT_MEMORY_PREFIX = 'project_memory_';
export const PROJECT_CHATS_PREFIX = 'proj_chats_';

export interface ProjectChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ProjectChatThread {
  id: string;
  title: string;
  projectId: string;
  messages: ProjectChatMessage[];
  createdAt: string;
}

export interface ProjectFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
  addedAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
  isPinned: boolean;
  messages?: Array<{ role: string; content: string; createdAt: string }>;
}

const DEFAULT_SEED_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-demo-1',
    name: 'Mahi Testing',
    instructions: 'Test project for validating AI chat workflows and knowledge assets.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isPinned: true
  },
  {
    id: 'proj-demo-2',
    name: 'Product Roadmap',
    instructions: 'Prioritize user experience, clear milestones, and measurable KPIs.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isPinned: false
  }
];

export function loadProjectsFromStorage(): ProjectItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_PROJECTS));
  } catch {
    // Ignore
  }
  return DEFAULT_SEED_PROJECTS;
}

export function saveProjectsToStorage(projects: ProjectItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Ignore
  }
}

export function getProjectFiles(projectId: string): ProjectFileItem[] {
  if (!projectId || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROJECT_FILES_PREFIX + projectId);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjectFiles(projectId: string, files: ProjectFileItem[]): void {
  if (!projectId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECT_FILES_PREFIX + projectId, JSON.stringify(files));
  } catch {
    // Ignore
  }
}

export function getProjectMemory(projectId: string): boolean {
  if (!projectId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(PROJECT_MEMORY_PREFIX + projectId) === 'true';
  } catch {
    return false;
  }
}

export function setProjectMemory(projectId: string, enabled: boolean): void {
  if (!projectId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECT_MEMORY_PREFIX + projectId, enabled ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

export function loadProjectChats(projectId: string): ProjectChatThread[] {
  if (!projectId || typeof window === 'undefined') return [];
  const results: ProjectChatThread[] = [];
  const seen = new Set<string>();

  try {
    const raw = window.localStorage.getItem(PROJECT_CHATS_PREFIX + projectId);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      for (const c of parsed) {
        if (c && c.id && !seen.has(c.id)) {
          seen.add(c.id);
          results.push(c);
        }
      }
    }
  } catch {
    // Ignore
  }

  try {
    const legacyRaw = window.localStorage.getItem('mestrio_platform_chats_v1');
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && Array.isArray(parsed.conversations)) {
        for (const c of parsed.conversations) {
          if (c && c.projectId === projectId && c.id && !seen.has(c.id)) {
            seen.add(c.id);
            results.push(c);
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  return results;
}

export function saveProjectChats(projectId: string, chats: ProjectChatThread[]): void {
  if (!projectId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECT_CHATS_PREFIX + projectId, JSON.stringify(chats));
  } catch {
    // Ignore
  }
}

export function formatProjectFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTimeAgo(iso?: string): string {
  if (!iso) return 'Just now';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 60000) return 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
