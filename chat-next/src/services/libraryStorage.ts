export const LIBRARY_STORAGE_KEY = 'library_items';

export type LibraryTab = 'all' | 'favourites' | 'images' | 'files';
export type LibrarySourceFilter = 'all' | 'uploaded' | 'generated' | 'images';
export type LibrarySortBy = 'name' | 'modified' | 'size';
export type LibraryViewMode = 'grid' | 'list';

export interface LibraryItem {
  id: string;
  name: string;
  title?: string;
  type: 'file' | 'image' | 'prompt';
  fileExt?: string;
  mimeType?: string;
  source?: 'uploaded' | 'generated';
  url?: string;
  content?: string;
  size: number;
  isFavorite?: boolean;
  favourite?: boolean;
  isGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

const SAMPLE_PDF_DATA_URL =
  'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iagoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmo8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+PgplbmRvYmoKNCAwIG9iajw8L0xlbmd0aCA4ND4+CnN0cmVhbQpCVAovRjEgMjQgVGYKNzIgNzIwIFRECihoZXJlIGlzIHlvdXIgRmluYW5jaWFsIFByb2plY3Rpb24gUTQgUERGIFJlcG9ydCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY3IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDI0NyAwMDAwMCBuIAowMDAwMDAwMzgwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg==';

const SAMPLE_CODE_CONTENT = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string; email: string };
}

export function authSecurityMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_super_secret_key');
        req.user = decoded as AuthenticatedRequest['user'];
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
}`;

export const DEFAULT_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib_seed_1',
    name: 'Financial Projection Q4.pdf',
    title: 'Financial Projection Q4.pdf',
    type: 'file',
    fileExt: 'PDF',
    mimeType: 'application/pdf',
    source: 'uploaded',
    url: SAMPLE_PDF_DATA_URL,
    size: 2450000,
    isFavorite: true,
    favourite: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
    tags: ['finance', 'report', 'pdf', 'q4']
  },
  {
    id: 'lib_seed_2',
    name: 'Executive AI Strategy Prompt',
    title: 'Executive AI Strategy Prompt',
    type: 'prompt',
    source: 'generated',
    content:
      'Act as a principal AI strategist. Formulate a 5-pillar roadmap for enterprise agent adoption focusing on governance, human-in-the-loop workflows, and ROI attribution.',
    size: 380,
    isFavorite: true,
    favourite: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
    tags: ['strategy', 'prompt', 'executive', 'enterprise']
  },
  {
    id: 'lib_seed_3',
    name: 'Futuristic Cyberpunk Metropolis.png',
    title: 'Futuristic Cyberpunk Metropolis.png',
    type: 'image',
    mimeType: 'image/png',
    fileExt: 'PNG',
    source: 'generated',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    size: 3120000,
    isFavorite: false,
    favourite: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    tags: ['image', 'cyberpunk', 'ai-art', 'wallpaper']
  },
  {
    id: 'lib_seed_4',
    name: 'Brand Style Guidelines.png',
    title: 'Brand Style Guidelines.png',
    type: 'image',
    mimeType: 'image/png',
    fileExt: 'PNG',
    source: 'uploaded',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    size: 1980000,
    isFavorite: true,
    favourite: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 8).toISOString(),
    tags: ['brand', 'design', 'guidelines', 'image']
  },
  {
    id: 'lib_seed_5',
    name: 'Enterprise Pitch Deck.pptx',
    title: 'Enterprise Pitch Deck.pptx',
    type: 'file',
    fileExt: 'PPTX',
    source: 'generated',
    size: 5240000,
    isFavorite: false,
    favourite: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    tags: ['slides', 'presentation', 'pitch', 'deck']
  },
  {
    id: 'lib_seed_6',
    name: 'auth-security-middleware.ts',
    title: 'auth-security-middleware.ts',
    type: 'file',
    fileExt: 'TS',
    source: 'uploaded',
    content: SAMPLE_CODE_CONTENT,
    size: 18400,
    isFavorite: false,
    favourite: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(),
    tags: ['code', 'typescript', 'security', 'auth']
  }
];

export function isImageItem(item: LibraryItem): boolean {
  return (
    item.type === 'image' ||
    Boolean(item.mimeType && item.mimeType.startsWith('image/')) ||
    ['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG', 'GIF'].includes((item.fileExt || '').toUpperCase())
  );
}

export function isFileItem(item: LibraryItem): boolean {
  return item.type === 'file' || item.type === 'prompt';
}

export function getLibraryItemsFromStorage(): LibraryItem[] {
  if (typeof window === 'undefined') return DEFAULT_LIBRARY_ITEMS;
  try {
    const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  saveLibraryItemsToStorage(DEFAULT_LIBRARY_ITEMS);
  return DEFAULT_LIBRARY_ITEMS;
}

export function saveLibraryItemsToStorage(items: LibraryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
}

export function formatLibrarySize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadLibraryItem(item: LibraryItem): void {
  const filename = item.name || item.title || 'library-asset';
  if (item.url) {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  const text = item.content || `${filename}\n`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.includes('.') ? filename : `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
