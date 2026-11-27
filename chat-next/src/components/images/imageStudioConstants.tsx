import React from 'react';

export type ImageStudioWorkflowId =
  | 'generate'
  | 'remove-background'
  | 'precise-edit'
  | 'upscale-image';

export interface ImageModelOption {
  id: string;
  name: string;
}

export const IMAGE_MODELS: ImageModelOption[] = [
  { id: 'auto', name: 'Auto' },
  { id: 'openai/gpt-image-2.5-sunburst', name: 'GPT Image 2.5 Sunburst' },
  { id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro' },
  { id: 'black-forest-labs/flux.2-pro', name: 'FLUX.2 Pro' },
  { id: 'bytedance-seed/seedream-5.0-pro', name: 'Seedream 5.0 Pro' },
  { id: 'meta/muse-image', name: 'Meta: Muse Image' },
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Nano Banana 2' },
];

export const EDIT_MODELS: ImageModelOption[] = [
  { id: 'auto', name: 'Auto' },
  { id: 'krea/krea-k3-edit', name: 'Krea K3 Edit' },
  { id: 'bytedance-seed/seedream-5-5', name: 'Seedream 5.5' },
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Nano Banana 2' },
];

export interface AspectRatioOption {
  id: string;
  label: string;
  w: number;
  h: number;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: 'auto', label: 'Auto', w: 14, h: 14 },
  { id: '1:1', label: '1:1', w: 14, h: 14 },
  { id: '2:3', label: '2:3', w: 11, h: 16 },
  { id: '3:4', label: '3:4', w: 12, h: 16 },
  { id: '9:16', label: '9:16', w: 9, h: 16 },
  { id: '3:2', label: '3:2', w: 16, h: 11 },
  { id: '4:3', label: '4:3', w: 16, h: 12 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
];

export const STYLE_PRESETS: string[] = [
  'Auto',
  'General',
  'Realistic',
  'Design',
  '3D Render',
  'Anime',
  'Cinematic',
  'Illustration',
  'Typography',
];

export interface StudioWorkflowCard {
  id: ImageStudioWorkflowId;
  title: string;
  subtitle: string;
  image: string;
  isSplitSlice?: boolean;
}

export const STUDIO_WORKFLOWS: StudioWorkflowCard[] = [
  {
    id: 'generate',
    title: 'Generate Image',
    subtitle: 'Create studio-grade visuals from text',
    image: '/workflows/generate-image.jpeg',
    isSplitSlice: true,
  },
  {
    id: 'remove-background',
    title: 'Remove Background',
    subtitle: 'Isolate any subject with clean edges',
    image: '/workflows/remove-bg.jpeg',
    isSplitSlice: true,
  },
  {
    id: 'precise-edit',
    title: 'Precise Edit',
    subtitle: 'Modify specific regions with precision',
    image: '/workflows/precise-edit.jpeg',
    isSplitSlice: true,
  },
  {
    id: 'upscale-image',
    title: 'Upscale Image',
    subtitle: 'Enhance resolution & clarity up to 4K',
    image: '/workflows/upscale-image.jpeg',
    isSplitSlice: true,
  },
];

export const ROTATING_PLACEHOLDERS: string[] = [
  'An origami crane made of world-map paper, clean studio lighting.',
  'A cartoon mascot of a hot chili pepper wearing a chef hat.',
  'Packaging for organic granola in kraft paper box with botanical illustration.',
  'A 35mm film photo of friends laughing around a campfire at dusk.',
  'A simple infographic showing the water cycle with labeled arrows.',
  'Retro-futuristic sci-fi cityscape with floating monorails, sunset glow.',
  'A cozy ceramic mug of matcha latte with delicate leaf foam art.',
  'Minimalist line-art poster of a Bauhaus architectural chair.',
];

export function getModelDisplayName(modelId?: string): string {
  if (!modelId || modelId === 'auto') return 'Auto';
  const found = [...IMAGE_MODELS, ...EDIT_MODELS].find((m) => m.id === modelId);
  return found ? found.name : modelId;
}

export const ModelIcon: React.FC<{ modelId?: string; className?: string }> = ({
  modelId = 'auto',
  className = 'w-4 h-4 shrink-0',
}) => {
  const mid = String(modelId || '').toLowerCase().trim();

  if (mid === 'auto' || mid.startsWith('auto')) {
    return (
      <svg
        className={`${className} text-blue-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    );
  }

  if (mid.includes('krea') || mid.includes('k3') || mid.includes('flux-fill')) {
    return (
      <svg
        className={`${className} text-neutral-800 dark:text-neutral-100`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2 2 7v10l10 5 10-5V7L12 2z" />
        <path d="m2 7 10 5 10-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  if (
    mid === 'openai/gpt-image-2.5-sunburst' ||
    mid.includes('openai') ||
    mid.includes('gpt') ||
    mid.includes('dall') ||
    mid.includes('sunburst')
  ) {
    return (
      <svg className={`${className} text-zinc-900 dark:text-white`} viewBox="60 60 392 392" fill="currentColor">
        <path
          fillRule="nonzero"
          d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z"
        />
      </svg>
    );
  }

  if (
    mid === 'google/gemini-3-pro-image' ||
    mid.includes('gemini-3-pro') ||
    mid === 'google/gemini-3.1-flash-image-preview' ||
    mid.includes('gemini') ||
    mid.includes('google') ||
    mid.includes('banana')
  ) {
    const gradId = mid.includes('pro') ? 'gemini-sparkle-pro-react' : 'gemini-sparkle-flash-react';
    return (
      <svg className={className} viewBox="0 0 24 24">
        <defs>
          <linearGradient id={gradId} x1="85%" y1="15%" x2="15%" y2="85%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C12 7.5 7.5 12 2 12c5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z"
          fill={`url(#${gradId})`}
        />
      </svg>
    );
  }

  if (
    mid === 'black-forest-labs/flux.2-pro' ||
    mid === 'black-forest-labs/flux.2-flex' ||
    mid.includes('flux') ||
    mid.includes('black-forest') ||
    mid.includes('bfl')
  ) {
    return (
      <svg className={`${className} text-zinc-900 dark:text-white`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.2l7.5 4.1L12 12.4 4.5 8.3 12 4.2zM4 9.8l7 3.8v7.6l-7-3.8V9.8zm16 7.6l-7 3.8v-7.6l7-3.8v7.6z" />
      </svg>
    );
  }

  if (
    mid === 'bytedance-seed/seedream-5.0-pro' ||
    mid.includes('seedream') ||
    mid.includes('bytedance')
  ) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="6" width="3.2" height="12" rx="1.6" fill="#3B82F6" />
        <rect x="7.8" y="3" width="3.2" height="18" rx="1.6" fill="#06B6D4" />
        <rect x="13.1" y="6" width="3.2" height="15" rx="1.6" fill="#3B82F6" />
        <rect x="18.4" y="8" width="3.2" height="10" rx="1.6" fill="#06B6D4" />
      </svg>
    );
  }

  if (mid === 'meta/muse-image' || mid.includes('muse') || mid.includes('meta')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#0081FB">
        <path d="M16.995 3C14.636 3 12.748 4.316 12 5.864 11.252 4.316 9.364 3 7.005 3 3.136 3 0 6.136 0 10.005c0 3.869 3.136 7.005 7.005 7.005 2.359 0 4.247-1.316 4.995-2.864.748 1.548 2.636 2.864 4.995 2.864 3.869 0 7.005-3.136 7.005-7.005C24 6.136 20.864 3 16.995 3zm0 11.96c-1.898 0-3.568-1.074-4.39-2.73a.873.873 0 0 0-1.21 0c-.822 1.656-2.492 2.73-4.39 2.73-2.732 0-4.955-2.223-4.955-4.955s2.223-4.955 4.955-4.955c1.898 0 3.568 1.074 4.39 2.73a.873.873 0 0 0 1.21 0c.822-1.656 2.492-2.73 4.39-2.73 2.732 0 4.955 2.223 4.955 4.955s-2.223 4.955-4.955 4.955z" />
      </svg>
    );
  }

  return (
    <svg
      className={`${className} text-neutral-700 dark:text-neutral-200`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="5" y="5" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4M19 9h4m-4 6h4" />
    </svg>
  );
};
