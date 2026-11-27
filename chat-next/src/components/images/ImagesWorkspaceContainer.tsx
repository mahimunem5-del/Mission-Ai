import React, { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import { getAuthHeaders } from '../../lib/auth';
import { ImageWorkspace, type ImageAsset } from './ImageWorkspace';

const IMAGE_ASSETS_STORAGE_KEY = 'mestrio_image_assets_v1';

function loadSavedAssets(): ImageAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(IMAGE_ASSETS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const ImagesWorkspaceContainer: React.FC = () => {
  const { setMobileSidebarOpen } = useAppShell();
  const [assets, setAssets] = useState<ImageAsset[]>(() => loadSavedAssets());
  const [isGenerating, setIsGenerating] = useState(false);

  const persistAssets = useCallback((next: ImageAsset[]) => {
    setAssets(next);
    try {
      window.localStorage.setItem(IMAGE_ASSETS_STORAGE_KEY, JSON.stringify(next.slice(0, 40)));
    } catch {
      // Ignore quota errors
    }
  }, []);

  const handleGenerate = useCallback(
    async (params: {
      prompt: string;
      model: string;
      aspectRatio: string;
      count: number;
      referenceImage?: string;
      referenceImages?: string[];
      quality?: string;
      tool?: string;
      stylePreset?: string;
      seed?: string;
    }) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(params)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
        }
        const rawList: Array<Record<string, unknown>> = Array.isArray(data.images)
          ? data.images
          : data.imageUrl || data.url
            ? [data]
            : [];

        const newAssets: ImageAsset[] = rawList.map((item, idx) => ({
          id: String(item.id || `img_${Date.now()}_${idx}`),
          url: String(item.url || item.imageUrl || ''),
          prompt: params.prompt,
          originalPrompt: params.prompt,
          model: String(item.model || params.model),
          modelName: String(item.modelName || params.model),
          aspectRatio: params.aspectRatio,
          stylePreset: params.stylePreset,
          tool: params.tool,
          createdAt: new Date().toISOString()
        }));

        if (newAssets.length > 0) {
          persistAssets([...newAssets, ...assets]);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [assets, persistAssets]
  );

  const handleApplyEdit = useCallback(
    async (params: {
      sourceImage: string;
      referenceImages?: string[];
      prompt: string;
      count: number;
      quality?: string;
      model?: string;
    }) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/images/precise-edit', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(params)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
        }
        const rawList: Array<Record<string, unknown>> = Array.isArray(data.images)
          ? data.images
          : data.imageUrl || data.url
            ? [data]
            : [];

        const newAssets: ImageAsset[] = rawList.map((item, idx) => ({
          id: String(item.id || `edit_${Date.now()}_${idx}`),
          url: String(item.url || item.imageUrl || ''),
          prompt: params.prompt,
          originalPrompt: params.prompt,
          model: String(item.model || params.model || 'auto'),
          modelName: String(item.modelName || params.model || 'Auto'),
          sourceImage: params.sourceImage,
          isPreciseEdit: true,
          createdAt: new Date().toISOString()
        }));

        if (newAssets.length > 0) {
          persistAssets([...newAssets, ...assets]);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [assets, persistAssets]
  );

  const handleRemoveBackground = useCallback(
    async (params: { sourceImage: string }) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/images/remove-background', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(params)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
        }
        const url = String(data.imageUrl || data.url || '');
        if (url) {
          const newAsset: ImageAsset = {
            id: String(data.id || `rmbg_${Date.now()}`),
            url,
            prompt: 'Background removed',
            model: 'remove-background',
            modelName: 'Remove Background',
            isRemoveBg: true,
            sourceImage: params.sourceImage,
            createdAt: new Date().toISOString()
          };
          persistAssets([newAsset, ...assets]);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [assets, persistAssets]
  );

  const handleUpscaleImage = useCallback(
    async (params: { sourceImage: string; scale?: string }) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/images/upscale', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(params)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
        }
        const url = String(data.imageUrl || data.url || '');
        if (url) {
          const newAsset: ImageAsset = {
            id: String(data.id || `upscale_${Date.now()}`),
            url,
            prompt: `Upscaled (${params.scale || '2x'})`,
            model: 'upscale-image',
            modelName: 'Upscale Image',
            scale: params.scale || '2x',
            isUpscale: true,
            sourceImage: params.sourceImage,
            createdAt: new Date().toISOString()
          };
          persistAssets([newAsset, ...assets]);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [assets, persistAssets]
  );

  return (
    <div id="images-workspace-root" className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-[#191919]">
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-md border border-slate-200 dark:border-neutral-700 p-1.5 text-slate-600 dark:text-neutral-300"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100">Images</span>
        <div className="w-7" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ImageWorkspace
          initialView="home"
          assets={assets}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onApplyEdit={handleApplyEdit}
          onRemoveBackground={handleRemoveBackground}
          onUpscaleImage={handleUpscaleImage}
          onUpdateAssets={persistAssets}
        />
      </div>
    </div>
  );
};

export default ImagesWorkspaceContainer;
