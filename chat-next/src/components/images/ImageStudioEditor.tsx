import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { ImageAsset } from './ImageWorkspace';
import {
  ASPECT_RATIOS,
  EDIT_MODELS,
  IMAGE_MODELS,
  ModelIcon,
  STUDIO_WORKFLOWS,
  STYLE_PRESETS,
  getModelDisplayName,
  type ImageStudioWorkflowId,
} from './imageStudioConstants';

export interface StudioState {
  workflow: ImageStudioWorkflowId;
  model: string;
  editModel: string;
  prompt: string;
  aspectRatio: string;
  count: number;
  stylePreset: string;
  seed: string;
  referenceImages: string[];
  sourceImage: string;
  editQuality: 'Low' | 'Medium' | 'High';
  upscaleFactor: '2x' | '4x';
}

interface ImageStudioEditorProps {
  state: StudioState;
  setState: React.Dispatch<React.SetStateAction<StudioState>>;
  assets: ImageAsset[];
  isGenerating: boolean;
  onBackHome: () => void;
  onRunGenerate: () => void;
  onRunPreciseEdit: () => void;
  onRunRemoveBackground: () => void;
  onRunUpscale: () => void;
  onOpenLightbox: (asset: ImageAsset) => void;
  onRegenerateAsset: (asset: ImageAsset) => void;
  onEditInPreciseEdit: (asset: ImageAsset) => void;
  onCopyPrompt: (prompt: string) => void;
  onDownloadAsset: (asset: ImageAsset) => void;
  onDeleteAssets: (ids: string[]) => void;
}

function getAspectClass(ratio?: string): string {
  switch (ratio) {
    case '16:9':
      return 'aspect-video';
    case '9:16':
      return 'aspect-[9/16]';
    case '4:3':
      return 'aspect-[4/3]';
    case '3:4':
      return 'aspect-[3/4]';
    case '2:3':
      return 'aspect-[2/3]';
    case '3:2':
      return 'aspect-[3/2]';
    default:
      return 'aspect-square';
  }
}

function formatAssetTime(iso?: string): string {
  if (!iso) return 'Just now';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

export const ImageStudioEditor: React.FC<ImageStudioEditorProps> = ({
  state,
  setState,
  assets,
  isGenerating,
  onBackHome,
  onRunGenerate,
  onRunPreciseEdit,
  onRunRemoveBackground,
  onRunUpscale,
  onOpenLightbox,
  onRegenerateAsset,
  onEditInPreciseEdit,
  onCopyPrompt,
  onDownloadAsset,
  onDeleteAssets,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    'workflow' | 'model' | 'editModel' | 'ratio' | 'count' | 'editQuality' | 'editCount' | null
  >(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refInputRef = useRef<HTMLInputElement | null>(null);
  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const MIN_PANEL_WIDTH = 300;
  const MAX_PANEL_WIDTH = 540;
  const DEFAULT_PANEL_WIDTH = 380;

  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_PANEL_WIDTH;
    const saved =
      window.localStorage.getItem('ideogram_panel_width') ||
      window.localStorage.getItem('image_workspace_panel_width') ||
      window.localStorage.getItem('ideogram_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : NaN;
    if (!Number.isNaN(parsed) && parsed >= MIN_PANEL_WIDTH && parsed <= MAX_PANEL_WIDTH) {
      return parsed;
    }
    return DEFAULT_PANEL_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const nextWidth = Math.min(Math.max(e.clientX - rect.left, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
      setPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      try {
        window.localStorage.setItem('ideogram_panel_width', String(panelWidth));
        window.localStorage.setItem('image_workspace_panel_width', String(panelWidth));
        window.localStorage.setItem('ideogram_sidebar_width', String(panelWidth));
      } catch {
        // Ignore storage errors
      }
      window.dispatchEvent(new Event('resize'));
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, panelWidth]);

  const handleStartResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleResetWidth = () => {
    setPanelWidth(DEFAULT_PANEL_WIDTH);
    try {
      window.localStorage.setItem('ideogram_panel_width', String(DEFAULT_PANEL_WIDTH));
      window.localStorage.setItem('image_workspace_panel_width', String(DEFAULT_PANEL_WIDTH));
      window.localStorage.setItem('ideogram_sidebar_width', String(DEFAULT_PANEL_WIDTH));
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new Event('resize'));
  };

  const activeWorkflowLabel =
    STUDIO_WORKFLOWS.find((w) => w.id === state.workflow)?.title || 'Generate Image';

  const handleClearAll = () => {
    setPromptError(null);
    setState((prev) => ({
      ...prev,
      prompt: '',
      seed: '',
      referenceImages: [],
      sourceImage: '',
      stylePreset: 'Auto',
      aspectRatio: '1:1',
      count: 1,
      editQuality: 'Medium',
    }));
  };

  const handleRefFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, Math.max(0, 10 - state.referenceImages.length)).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setState((prev) => ({
            ...prev,
            referenceImages:
              prev.referenceImages.length < 10
                ? [...prev.referenceImages, reader.result as string]
                : prev.referenceImages,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setState((prev) => ({ ...prev, sourceImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePrimaryGenerate = () => {
    if (!state.prompt.trim()) {
      setPromptError('Please enter a prompt to generate an image.');
      return;
    }
    setPromptError(null);
    onRunGenerate();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRatioObj = useMemo(
    () => ASPECT_RATIOS.find((r) => r.id === state.aspectRatio) || ASPECT_RATIOS[1],
    [state.aspectRatio]
  );

  return (
    <div
      ref={workspaceRef}
      id="image-studio-workspace"
      style={{ '--sidebar-width': `${panelWidth}px` } as React.CSSProperties}
      className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* LEFT PANEL — GENERATION WORKSPACE */}
      <aside
        id="ideogram-left-panel"
        style={{ width: `${panelWidth}px`, minWidth: '300px', maxWidth: '540px' }}
        className="w-full md:w-auto shrink-0 md:h-full max-h-[52vh] md:max-h-none flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
      >
        {/* Left Panel Header: < <Mode Name> v   Clear all */}
        <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-transparent">
          <div className="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white relative min-w-0">
            <button
              type="button"
              id="ideogram-back-to-home-btn"
              onClick={onBackHome}
              className="p-1 -ml-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
              title="Back to Image Home"
              aria-label="Back to Image Home"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="relative min-w-0" id="workspace-tool-switcher-wrapper">
              <button
                type="button"
                id="workspace-tool-switcher-btn"
                onClick={() => setOpenDropdown((d) => (d === 'workflow' ? null : 'workflow'))}
                className="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none truncate"
              >
                <span id="workspace-active-tool-label" className="truncate">{activeWorkflowLabel}</span>
                <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {openDropdown === 'workflow' && (
                <div
                  id="workspace-tool-flyout"
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl p-1.5 z-50"
                >
                  <div className="text-[11.5px] font-medium text-neutral-500 dark:text-neutral-400 px-3 pt-2 pb-1.5 select-none">
                    Creative workflows
                  </div>
                  <div className="space-y-0.5 overflow-y-auto ideogram-custom-scroll">
                    {STUDIO_WORKFLOWS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setState((prev) => ({ ...prev, workflow: item.id }));
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                          state.workflow === item.id
                            ? 'bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-6 h-6 rounded-md object-cover shrink-0 border border-neutral-200/70 dark:border-white/10"
                          />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {state.workflow === item.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            id="ideogram-reset-composer-btn"
            onClick={handleClearAll}
            className="text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Clear all"
          >
            Clear all
          </button>
        </div>

        {/* Left Panel Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 ideogram-custom-scroll space-y-4">
          {state.workflow === 'generate' && (
            <>
              {/* 1. MODEL SELECTOR */}
              <div className="space-y-1.5 relative">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">
                  Model
                </label>
                <button
                  type="button"
                  onClick={() => setOpenDropdown((d) => (d === 'model' ? null : 'model'))}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer text-[13px] font-medium text-neutral-800 dark:text-neutral-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ModelIcon modelId={state.model} />
                    <span className="truncate">{getModelDisplayName(state.model)}</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {openDropdown === 'model' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50 max-h-72 overflow-y-auto ideogram-custom-scroll">
                    {IMAGE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setState((prev) => ({ ...prev, model: m.id }));
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors ${
                          state.model === m.id
                            ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ModelIcon modelId={m.id} />
                          <span className="truncate">{m.name}</span>
                        </div>
                        {state.model === m.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. REFERENCE IMAGES (0/10) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">
                    Reference images
                  </label>
                  <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">
                    {state.referenceImages.length}/10
                  </span>
                </div>

                <input
                  ref={refInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleRefFileUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => refInputRef.current?.click()}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-50/50 dark:bg-white/[0.02] transition-all cursor-pointer"
                    title="Upload reference image"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                  </button>

                  {state.referenceImages.map((src, idx) => (
                    <div
                      key={`${idx}-${src.slice(0, 20)}`}
                      className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group"
                    >
                      <img src={src} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            referenceImages: prev.referenceImages.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {state.referenceImages.length === 0 && (
                    <>
                      <div className="w-full aspect-square rounded-xl border border-dashed border-slate-200 dark:border-white/5" />
                      <div className="w-full aspect-square rounded-xl border border-dashed border-slate-200 dark:border-white/5" />
                    </>
                  )}
                </div>
              </div>

              {/* 3. STYLE PRESETS */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">
                  Style Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, stylePreset: preset }))}
                      className={`rounded-lg px-2.5 py-1 text-[13px] tracking-[-0.005em] cursor-pointer transition-colors ${
                        state.stylePreset === preset
                          ? 'bg-slate-900/[0.08] text-neutral-900 dark:bg-white/10 dark:text-white font-medium'
                          : 'bg-transparent text-neutral-500 hover:text-neutral-900 hover:bg-slate-900/[0.04] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5 font-normal'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. PROMPT COMPOSER */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">
                  Prompt
                </label>
                <div
                  id="studio-composer-box"
                  className="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:ring-0 focus-within:border-slate-400 dark:focus-within:border-white/25"
                >
                  <textarea
                    id="studio-prompt-input"
                    rows={10}
                    value={state.prompt}
                    onChange={(e) => {
                      setPromptError(null);
                      setState((prev) => ({ ...prev, prompt: e.target.value }));
                    }}
                    placeholder="Describe the image you want to create..."
                    className="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"
                  />
                  {promptError && (
                    <p className="text-xs text-rose-500 font-medium pt-1">{promptError}</p>
                  )}
                </div>
              </div>

              {/* 5. ASPECT RATIO & COUNT DUAL ROW */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((d) => (d === 'ratio' ? null : 'ratio'))}
                    className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-[13px] font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="border-[1.5px] border-current rounded-xs inline-block shrink-0"
                        style={{
                          width: `${Math.max(10, Math.round(selectedRatioObj.w * 0.85))}px`,
                          height: `${Math.max(10, Math.round(selectedRatioObj.h * 0.85))}px`,
                        }}
                      />
                      <span className="truncate">{selectedRatioObj.label}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {openDropdown === 'ratio' && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50 max-h-[260px] overflow-y-auto ideogram-custom-scroll">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setState((prev) => ({ ...prev, aspectRatio: r.id }));
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] cursor-pointer ${
                            state.aspectRatio === r.id
                              ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white font-medium'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{r.label}</span>
                          {state.aspectRatio === r.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((d) => (d === 'count' ? null : 'count'))}
                    className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-[13px] font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <span className="truncate">{state.count}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {openDropdown === 'count' && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setState((prev) => ({ ...prev, count: n }));
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] cursor-pointer ${
                            state.count === n
                              ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white font-medium'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{n}</span>
                          {state.count === n && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 6. ADVANCED SETTINGS ACCORDION */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className="w-full flex items-center justify-between py-1 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <span className="text-[13px] font-semibold tracking-[-0.01em]">Advanced settings</span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {advancedOpen && (
                  <div className="pt-2 space-y-2">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Seed
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={state.seed}
                        onChange={(e) => setState((prev) => ({ ...prev, seed: e.target.value }))}
                        placeholder="Random seed"
                        className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            seed: String(Math.floor(Math.random() * 999999999)),
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs cursor-pointer"
                        title="Randomize seed"
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. GENERATE CTA (Muted-gray disabled when prompt empty, solid dark when filled) */}
              <div className="pt-2">
                <button
                  id="studio-generate-btn"
                  type="button"
                  disabled={isGenerating || !state.prompt.trim()}
                  onClick={handlePrimaryGenerate}
                  className="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E7EB] dark:disabled:bg-neutral-800 disabled:text-[#9CA3AF] dark:disabled:text-neutral-500 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </>
          )}

          {/* PRECISE EDIT CONTROLS */}
          {state.workflow === 'precise-edit' && (
            <div className="space-y-4">
              {/* 0. MODEL SELECTOR (4 models: Auto, Krea K3 Edit, Seedream 5.5, Nano Banana 2) */}
              <div className="relative">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">
                  Model
                </label>
                <button
                  type="button"
                  onClick={() => setOpenDropdown((d) => (d === 'editModel' ? null : 'editModel'))}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-[13px] font-medium cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ModelIcon modelId={state.editModel} />
                    <span className="truncate">{getModelDisplayName(state.editModel)}</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {openDropdown === 'editModel' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50">
                    {EDIT_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setState((prev) => ({ ...prev, editModel: m.id }));
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium cursor-pointer ${
                          state.editModel === m.id
                            ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ModelIcon modelId={m.id} />
                          <span className="truncate">{m.name}</span>
                        </div>
                        {state.editModel === m.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 1. SOURCE IMAGE DROPZONE */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">
                  Source image
                </label>
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSourceFileUpload}
                  className="hidden"
                />
                {state.sourceImage ? (
                  <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-900 flex items-center justify-center p-2">
                    <img src={state.sourceImage} alt="Source image" className="w-full h-full object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, sourceImage: '' }))}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer shadow-md"
                      title="Change image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => sourceInputRef.current?.click()}
                    className="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
                  >
                    <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">
                      Upload or choose an image
                    </span>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>

              {/* 2. WHAT SHOULD CHANGE? PROMPT BOX */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">
                  What should change?
                </label>
                <div className="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 focus-within:border-slate-400 dark:focus-within:border-white/20">
                  <textarea
                    rows={4}
                    value={state.prompt}
                    onChange={(e) => setState((prev) => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Describe the change you want..."
                    className="w-full min-h-[110px] resize-none border-none outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"
                  />
                </div>
              </div>

              {/* 3. REFERENCE IMAGES (0/10) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">
                    Reference images
                  </label>
                  <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">
                    {state.referenceImages.length}/10
                  </span>
                </div>
                <input
                  ref={refInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleRefFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => refInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-50/50 dark:bg-white/[0.02] cursor-pointer shrink-0"
                    title="Upload reference image"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                  </button>
                  {state.referenceImages.map((src, idx) => (
                    <div
                      key={`edit-ref-${idx}`}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group shrink-0"
                    >
                      <img src={src} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            referenceImages: prev.referenceImages.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {state.referenceImages.length === 0 && (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 dark:border-white/5 shrink-0" />
                  )}
                </div>
              </div>

              {/* 4. QUALITY & VARIATIONS ROW */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">
                    Quality
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((d) => (d === 'editQuality' ? null : 'editQuality'))}
                    className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-[13px] font-medium cursor-pointer shadow-2xs"
                  >
                    <span>{state.editQuality}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {openDropdown === 'editQuality' && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50">
                      {(['Low', 'Medium', 'High'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setState((prev) => ({ ...prev, editQuality: q }));
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                            state.editQuality === q
                              ? 'bg-slate-100 dark:bg-white/10 font-semibold'
                              : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{q}</span>
                          {state.editQuality === q && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">
                    Variations
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((d) => (d === 'editCount' ? null : 'editCount'))}
                    className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-[13px] font-medium cursor-pointer shadow-2xs"
                  >
                    <span>{state.count}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {openDropdown === 'editCount' && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setState((prev) => ({ ...prev, count: n }));
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                            state.count === n
                              ? 'bg-slate-100 dark:bg-white/10 font-semibold'
                              : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{n}</span>
                          {state.count === n && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. APPLY EDIT CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGenerating || !state.sourceImage || !state.prompt.trim()}
                  onClick={onRunPreciseEdit}
                  className="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#262626] text-white disabled:bg-neutral-100 dark:disabled:bg-white/10 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? 'Applying edit...' : 'Apply edit'}
                </button>
              </div>
            </div>
          )}

          {/* REMOVE BACKGROUND / UPSCALE CONTROLS */}
          {(state.workflow === 'remove-background' || state.workflow === 'upscale-image') && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">
                  Source image
                </label>
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSourceFileUpload}
                  className="hidden"
                />
                {state.sourceImage ? (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2">
                    <img src={state.sourceImage} alt="Source" className="w-full h-full object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, sourceImage: '' }))}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => sourceInputRef.current?.click()}
                    className="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
                  >
                    <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">
                      Upload or choose an image
                    </span>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>

              {state.workflow === 'upscale-image' && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">
                    Target Scale
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['2x', '4x'] as const).map((factor) => (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => setState((prev) => ({ ...prev, upscaleFactor: factor }))}
                        className={`py-2 px-3 rounded-xl border text-[13px] font-medium flex items-center justify-center cursor-pointer transition ${
                          state.upscaleFactor === factor
                            ? 'border-[#111111] dark:border-white/30 bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white'
                            : 'border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                        }`}
                      >
                        {factor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating || !state.sourceImage}
                onClick={
                  state.workflow === 'remove-background' ? onRunRemoveBackground : onRunUpscale
                }
                className="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {isGenerating
                  ? 'Processing...'
                  : state.workflow === 'remove-background'
                    ? 'Remove background'
                    : 'Upscale'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* DRAGGABLE / RESIZABLE SIDEBAR DIVIDER (Ideogram Style) */}
      <div
        id="ideogram-sidebar-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize studio panel"
        onMouseDown={handleStartResize}
        onDoubleClick={handleResetWidth}
        title="Drag to resize • Double-click to reset"
        className={`flex w-1.5 h-full relative z-30 cursor-col-resize bg-transparent border-r border-gray-200 dark:border-neutral-800 hover:bg-gray-300/40 dark:hover:bg-neutral-700/40 transition-colors select-none shrink-0 ${
          isResizing ? 'bg-gray-300/40 dark:bg-neutral-700/40' : ''
        }`}
      />

      {/* RIGHT PANEL — GENERATION HISTORY FEED */}
      <main
        id="ideogram-right-panel"
        className="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative font-['Plus_Jakarta_Sans',sans-serif]"
      >
        {/* Batch Selection Bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#202020] shrink-0">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteAssets(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div
          id="ideogram-assets-viewport"
          className="flex-1 w-full overflow-y-auto p-4 sm:p-6 space-y-6 ideogram-custom-scroll bg-white dark:bg-[#191919]"
        >
          {/* Loading Skeleton In-Progress Asset Group (1:1 from head_index.html) */}
          {isGenerating && (
            <div
              id="ideogram-in-progress-card"
              className="ideogram-asset-group w-full mb-7 transition-all animate-in fade-in duration-300"
            >
              <div className="flex items-start justify-between gap-4 w-full pb-1">
                <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                      <span className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                        {activeWorkflowLabel}
                      </span>
                      <span className="text-slate-300 dark:text-neutral-600">•</span>
                      <span
                        id="ideogram-progress-model-pill"
                        className="inline-flex items-center gap-1 text-[14px] font-normal text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]"
                      >
                        <ModelIcon
                          modelId={state.workflow === 'precise-edit' ? state.editModel : state.model}
                        />
                        <span id="ideogram-progress-model-badge">
                          {getModelDisplayName(
                            state.workflow === 'precise-edit' ? state.editModel : state.model
                          )}
                        </span>
                      </span>
                      <span className="text-slate-300 dark:text-neutral-600">•</span>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-normal text-neutral-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-800 dark:bg-neutral-200" />
                        </span>
                        <span id="ideogram-progress-status-text">Generating...</span>
                      </span>
                    </div>
                    {state.prompt && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <h3
                          id="ideogram-progress-prompt-text"
                          className="text-[12.5px] font-normal text-neutral-600 dark:text-neutral-400 leading-snug cursor-pointer select-text truncate"
                        >
                          {state.prompt}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                id="ideogram-progress-skeletons"
                className={`variations-grid mt-2.5 ${
                  state.count === 1
                    ? 'w-[360px] max-w-full'
                    : state.count === 2
                      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-[620px] w-full'
                      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-[1100px] w-full'
                }`}
              >
                {Array.from({ length: Math.max(1, state.count) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="remove-bg-placeholder-wrapper relative w-[360px] max-w-full aspect-square rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center p-6 shadow-xs select-none"
                  >
                    <div className="remove-bg-placeholder-shimmer" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                      <div className="relative w-6 h-6">
                        <div className="w-6 h-6 rounded-full border-[1.5px] border-neutral-200 dark:border-neutral-700" />
                        <div className="w-6 h-6 rounded-full border-[1.5px] border-neutral-900 dark:border-white border-t-transparent animate-spin absolute inset-0" />
                      </div>
                      <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                        Generating image...
                      </span>
                      <div className="w-24 h-[2px] rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full w-full bg-neutral-800 dark:bg-neutral-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && assets.length === 0 && (
            <div
              id="ideogram-empty-state"
              className="flex-1 h-full min-h-[400px] flex flex-col items-center justify-center text-center px-4 my-auto select-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight mb-1">
                No generations yet
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                Your generated images will appear here.
              </p>
            </div>
          )}

          {/* Chronological Generation History Feed (1:1 from head_index.html) */}
          <div id="ideogram-asset-groups-feed" className="space-y-7">
            {assets.map((asset) => {
              const isRemoveBg = Boolean(
                asset.isRemoveBg ||
                  asset.tool === 'remove-background' ||
                  asset.model === 'remove-background'
              );
              const isUpscale = Boolean(
                !isRemoveBg &&
                  (asset.isUpscale ||
                    asset.tool === 'upscale-image' ||
                    asset.model === 'upscale-image')
              );
              const isPreciseEdit = Boolean(
                !isRemoveBg &&
                  !isUpscale &&
                  (asset.isPreciseEdit || asset.tool === 'precise-edit')
              );

              const modeLabel = isRemoveBg
                ? 'Remove Background'
                : isUpscale
                  ? 'Upscale Image'
                  : isPreciseEdit
                    ? 'Precise Edit'
                    : 'Generate Image';
              const modelLabel = asset.modelName || getModelDisplayName(asset.model);
              const displayPrompt = asset.originalPrompt || asset.prompt;
              const isSelected = selectedIds.has(asset.id);
              const isCopied = copiedId === asset.id;
              const aspectClass = getAspectClass(asset.aspectRatio);
              const badgeText = isRemoveBg
                ? 'PNG'
                : isUpscale
                  ? asset.scale || '2x'
                  : asset.aspectRatio || '1:1';

              return (
                <div key={asset.id} className="ideogram-asset-group w-full mb-7 transition-all">
                  {/* Asset Group Header */}
                  <div className="flex items-start justify-between gap-4 w-full pb-1">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                      <label
                        className="group-select-checkbox-label pt-0.5 cursor-pointer shrink-0 flex items-center"
                        title="Select generation group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(asset.id)}
                          aria-label="Select generation"
                          className="group-select-checkbox rounded border-slate-300 dark:border-white/30 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      {isRemoveBg || isUpscale ? (
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 dark:text-neutral-200">
                              {modeLabel}
                            </span>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                              {formatAssetTime(asset.createdAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 dark:text-neutral-200">
                              {modeLabel}
                            </span>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <span className="inline-flex items-center gap-1 text-[14px] font-normal text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                              <ModelIcon modelId={asset.model} />
                              <span>{modelLabel}</span>
                            </span>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <span className="text-[12.5px] font-normal text-neutral-400">
                              {formatAssetTime(asset.createdAt)}
                            </span>
                          </div>
                          {displayPrompt && (
                            <div className="flex items-center gap-2 pt-0.5 group/prompt-row">
                              <h3 className="text-[12.5px] font-normal text-neutral-600 dark:text-neutral-400 leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-text group-prompt-title truncate">
                                {displayPrompt}
                              </h3>
                              <button
                                type="button"
                                onClick={() => {
                                  onCopyPrompt(displayPrompt);
                                  setCopiedId(asset.id);
                                  window.setTimeout(() => setCopiedId(null), 1500);
                                }}
                                className="btn-group-copy-prompt p-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer shrink-0 opacity-70 hover:opacity-100"
                                title="Copy Prompt"
                              >
                                {isCopied ? (
                                  <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Top-Right Asset Group Actions (Ideogram Boxed Style) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isRemoveBg && !isUpscale && (
                        <button
                          type="button"
                          onClick={() => onRegenerateAsset(asset)}
                          className="btn-group-regenerate p-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
                          title="Regenerate / Retry"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                            <path d="M3 21v-5h5" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDownloadAsset(asset)}
                        className="btn-group-download p-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
                        title="Download"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Variation Card */}
                  <div className="variations-grid w-[360px] max-w-full mt-2.5">
                    <div
                      onClick={() => onOpenLightbox(asset)}
                      className={`ideogram-variation-card group/card relative rounded-xl overflow-hidden ${
                        isRemoveBg ? 'transparent-checkerboard-bg' : 'bg-slate-100 dark:bg-[#151c24]'
                      } ${aspectClass} max-h-[360px] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between w-full cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-blue-500/10' : ''
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={displayPrompt || modeLabel}
                        loading="lazy"
                        className={
                          isRemoveBg
                            ? 'w-full h-full object-contain p-2 group-hover/card:scale-102 transition-transform duration-500'
                            : 'w-full h-full object-cover group-hover/card:scale-102 transition-transform duration-500'
                        }
                      />

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                        <label
                          className="pointer-events-auto cursor-pointer p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(asset.id)}
                            aria-label="Select image"
                            className="variation-checkbox rounded border-slate-300 dark:border-white/30 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </label>
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11.5px] font-semibold tracking-wide text-white pointer-events-none font-['Plus_Jakarta_Sans',sans-serif]">
                          {badgeText}
                        </span>
                      </div>

                      {isRemoveBg ? (
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-end z-10">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onDownloadAsset(asset)}
                              className="btn-card-download p-1.5 rounded-lg bg-black/50 hover:bg-black/75 active:scale-90 text-white backdrop-blur-md transition-all duration-150 ease-out cursor-pointer shadow-xs"
                              title="Download PNG"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : isUpscale || isPreciseEdit ? (
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-end z-10">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onDownloadAsset(asset)}
                              className="btn-card-download p-1.5 rounded-lg bg-black/50 hover:bg-black/75 active:scale-90 text-white backdrop-blur-md transition-all duration-150 ease-out cursor-pointer shadow-xs"
                              title="Download image"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditInPreciseEdit(asset)}
                              className="btn-card-edit p-1.5 rounded-lg bg-black/50 hover:bg-black/75 active:scale-90 text-white backdrop-blur-md transition-all duration-150 ease-out cursor-pointer shadow-xs"
                              title="Edit in Precise Edit"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-between z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (displayPrompt) onCopyPrompt(displayPrompt);
                            }}
                            className="btn-card-magic-prompt inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 active:scale-95 text-white/95 hover:text-white backdrop-blur-md transition-all duration-150 text-[11px] font-medium border border-white/10 shadow-xs cursor-pointer"
                            title="View / Copy Magic Prompt"
                          >
                            <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                              <path d="M5 3v4" />
                              <path d="M19 17v4" />
                            </svg>
                            <span className="magic-prompt-text">Magic Prompt</span>
                          </button>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onDownloadAsset(asset)}
                              className="btn-card-download p-1.5 rounded-lg bg-black/50 hover:bg-black/75 active:scale-90 text-white backdrop-blur-md transition-all duration-150 ease-out cursor-pointer shadow-xs"
                              title="Download image"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditInPreciseEdit(asset)}
                              className="btn-card-edit p-1.5 rounded-lg bg-black/50 hover:bg-black/75 active:scale-90 text-white backdrop-blur-md transition-all duration-150 ease-out cursor-pointer shadow-xs"
                              title="Edit in Precise Edit"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
