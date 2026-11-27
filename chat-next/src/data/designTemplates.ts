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
const BASE_DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'tmpl-portrait-golden-hour',
    title: 'Editorial Golden Hour Portrait',
    category: 'Portrait & Photo',
    targetWorkflow: 'precise-edit',
    aspectRatio: '9:16',
    stylePreset: 'Realistic',
    prompt:
      'Maintain exact facial features and identity, apply warm golden hour backlight illumination, soft cinematic skin texture, subtle lens flare, shallow depth of field, 85mm f/1.4 lens',
    imageUrl: '/templates/editorial-portrait.jpg',
    featured: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'tmpl-avatar-cyberpunk-neon',
    title: 'Cyberpunk Hologram Avatar',
    category: 'Avatar & Stylized',
    targetWorkflow: 'precise-edit',
    aspectRatio: '3:4',
    stylePreset: 'Anime',
    prompt:
      'Transform portrait subject into high-detail cyberpunk anime avatar while preserving facial likeness and expression, glowing neon cyan and magenta rim light, subtle cybernetic cheek implants',
    imageUrl: '/templates/cyber-avatar.jpg',
    featured: true,
    createdAt: '2026-11-02T00:00:00Z',
  },
  {
    id: 'tmpl-product-amber-perfume',
    title: 'Amber Glass Luxury Perfume',
    category: 'Product & Branding',
    targetWorkflow: 'generate',
    aspectRatio: '1:1',
    stylePreset: 'Realistic',
    prompt:
      'High-end commercial studio product photography of a ribbed amber glass perfume bottle set on polished raw travertine stone, sharp directional afternoon sunlight, crisp caustic refractions, Hasselblad 100mm macro',
    imageUrl: '/templates/luxury-perfume.jpg',
    featured: true,
    createdAt: '2026-11-03T00:00:00Z',
  },
  {
    id: 'tmpl-logo-geometric-monogram',
    title: 'Swiss Minimalist Monogram',
    category: 'Logo & Typography',
    targetWorkflow: 'generate',
    aspectRatio: '1:1',
    stylePreset: 'Typography',
    prompt:
      'Clean minimalist vector monogram emblem logo, interlocking geometric curves, pure monochrome black and white palette, negative space optical illusion, modernist Swiss graphic design',
    imageUrl: '/templates/geometric-logo.jpg',
    featured: false,
    createdAt: '2026-11-04T00:00:00Z',
  },
  {
    id: 'tmpl-arch-brutalist-villa',
    title: 'Brutalist Nordic Glass Villa',
    category: 'Architecture & Scenery',
    targetWorkflow: 'generate',
    aspectRatio: '16:9',
    stylePreset: 'Cinematic',
    prompt:
      'Monolithic concrete and glass cantilevered architectural villa nestled in misty Scandinavian pine forest, floor-to-ceiling illuminated windows, warm interior lighting contrasting cold morning mist, architectural digest 8k',
    imageUrl: '/templates/nordic-scenery.jpg',
    featured: true,
    createdAt: '2026-11-05T00:00:00Z',
  },
  {
    id: 'tmpl-avatar-clay-explorer',
    title: '3D Tactile Clay Explorer',
    category: 'Avatar & Stylized',
    targetWorkflow: 'generate',
    aspectRatio: '4:3',
    stylePreset: '3D Render',
    prompt:
      'Charming 3D claymorphism tactile adventurer character wearing winter beanie and parka, matte plasticine clay textures, soft studio softbox illumination, clean neutral background, whimsical Blender Cycles render',
    imageUrl: '/templates/clay-character.jpg',
    featured: false,
    createdAt: '2026-11-06T00:00:00Z',
  },
];
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
