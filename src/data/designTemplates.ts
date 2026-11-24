export interface DesignTemplate {
  id: string;
  title: string;
  category: 'Portrait & Photo' | 'Avatar & Stylized' | 'Product & Branding' | 'Logo & Typography' | 'Architecture & Scenery';
  targetWorkflow: 'precise-edit' | 'generate';
  aspectRatio: '9:16' | '3:4' | '1:1' | '4:3' | '16:9';
  stylePreset: string; // e.g. 'Realistic', '3D Render', 'Design', 'Anime', 'Cinematic', 'Typography'
  prompt: string;
  imageUrl: string;
  featured?: boolean;
  createdAt: string;
}

export type DesignCategory =
  | 'All'
  | 'Portrait & Photo'
  | 'Avatar & Stylized'
  | 'Product & Branding'
  | 'Logo & Typography'
  | 'Architecture & Scenery';

export const DESIGN_CATEGORIES: DesignCategory[] = [
  'All',
  'Portrait & Photo',
  'Avatar & Stylized',
  'Product & Branding',
  'Logo & Typography',
  'Architecture & Scenery',
];

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const port = window.location.port;
  const hostname = window.location.hostname || 'localhost';
  if (port === '3000') {
    return `http://${hostname}:5001`;
  }
  return '';
}

// Authoritative in-memory cache for design templates (ZERO localStorage)
let inMemoryTemplates: DesignTemplate[] = [];

export async function fetchTemplatesApi(): Promise<DesignTemplate[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/templates`);
    if (!res.ok) return getDesignTemplates();
    const data = await res.json();
    const list = Array.isArray(data) ? data : (Array.isArray(data?.templates) ? data.templates : (Array.isArray(data?.data) ? data.data : []));
    if (Array.isArray(list) && list.length > 0) {
      inMemoryTemplates = list;
      return list;
    }
  } catch (err) {
    console.warn('[Templates API]: Fetch templates fallback to memory/base:', err);
  }
  return getDesignTemplates();
}

export function getCustomAdminTemplates(): DesignTemplate[] {
  return inMemoryTemplates;
}

export function getDesignTemplates(): DesignTemplate[] {
  if (inMemoryTemplates.length > 0) {
    const customIds = new Set(inMemoryTemplates.map(t => t.id));
    const filteredBase = BASE_DESIGN_TEMPLATES.filter(t => !customIds.has(t.id));
    return [...inMemoryTemplates, ...filteredBase];
  }
  return BASE_DESIGN_TEMPLATES;
}

export async function saveCustomDesignTemplate(template: DesignTemplate): Promise<void> {
  const existingIdx = inMemoryTemplates.findIndex(t => t.id === template.id);
  if (existingIdx >= 0) {
    inMemoryTemplates[existingIdx] = template;
  } else {
    inMemoryTemplates.unshift(template);
  }

  // Mutate exclusively via Supabase-backed API
  try {
    const isEdit = Boolean(template.id && !template.id.startsWith('tmpl-'));
    const path = isEdit ? `/api/admin/templates/${encodeURIComponent(template.id)}` : '/api/admin/templates';
    const endpoint = `${getApiBaseUrl()}${path}`;
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: template.id,
        title: template.title,
        category: template.category,
        prompt: template.prompt,
        image: template.imageUrl
      })
    });
  } catch (err) {
    console.error('Failed to sync custom template to /api/admin/templates:', err);
  }
}

export function saveAllDesignTemplates(templates: DesignTemplate[]): void {
  inMemoryTemplates = Array.isArray(templates) ? [...templates] : [];
}

export async function deleteCustomDesignTemplate(id: string): Promise<void> {
  inMemoryTemplates = inMemoryTemplates.filter(t => t.id !== id);
  try {
    await fetch(`${getApiBaseUrl()}/api/admin/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('Failed to delete template via /api/admin/templates:', err);
  }
}
