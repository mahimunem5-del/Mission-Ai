const TOKEN_STORAGE_KEY = 'mestrio_auth_token';

declare global {
  interface Window {
    mestrioAuthToken?: string;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (window.mestrioAuthToken && typeof window.mestrioAuthToken === 'string') {
    return window.mestrioAuthToken.trim() || null;
  }
  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? stored.trim() : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  window.mestrioAuthToken = token || undefined;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function sanitizeClientError(message: string): string {
  if (!message || typeof message !== 'string') return 'An unexpected error occurred.';
  return message
    .replace(/(?:Bearer\s+|sk-or-v1-|sk-)[a-zA-Z0-9_\-]{12,}/gi, '[REDACTED]')
    .slice(0, 300);
}
