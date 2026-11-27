import React, { useEffect, useRef, useState } from 'react';
import {
  ASPECT_RATIOS,
  IMAGE_MODELS,
  ModelIcon,
  ROTATING_PLACEHOLDERS,
  STUDIO_WORKFLOWS,
  getModelDisplayName,
  type ImageStudioWorkflowId,
} from './imageStudioConstants';
import {
  DESIGN_CATEGORIES,
  fetchTemplatesApi,
  getDesignTemplates,
  type DesignCategory,
  type DesignTemplate,
} from '../../data/designTemplates';
import { TemplatePreviewModal } from './TemplatePreviewModal';

export interface HomeGeneratePayload {
  prompt: string;
  aspectRatio: string;
  count: number;
  model: string;
  referenceImages: string[];
}

interface ImageHomeViewProps {
  onSubmitPrompt: (payload: HomeGeneratePayload) => void;
  onSelectWorkflow: (workflow: ImageStudioWorkflowId) => void;
  onSelectTemplate: (template: DesignTemplate) => void;
  onOpenStudio?: () => void;
}

export const ImageHomeView: React.FC<ImageHomeViewProps> = ({
  onSubmitPrompt,
  onSelectWorkflow,
  onSelectTemplate,
  onOpenStudio,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [count, setCount] = useState(1);
  const [model, setModel] = useState('auto');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [activePopover, setActivePopover] = useState<'ratio' | 'count' | 'model' | null>(null);

  // Word-by-word typewriter placeholder state (48ms/word -> 4s hold -> 260ms fade -> next)
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [showTabBadge, setShowTabBadge] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [templates, setTemplates] = useState<DesignTemplate[]>(() => getDesignTemplates());
  const [activeCategory, setActiveCategory] = useState<DesignCategory>('All');
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [templateToast, setTemplateToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTemplatesApi().then((loaded) => {
      if (mounted && loaded.length > 0) {
        setTemplates(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Exact word-by-word streaming placeholder rotation from head_index.html
  useEffect(() => {
    if (prompt.trim().length > 0) {
      return;
    }

    let cancelled = false;
    let wordTimer: number | null = null;
    let holdTimer: number | null = null;
    let fadeTimer: number | null = null;

    const phrase = ROTATING_PLACEHOLDERS[placeholderIndex] || '';
    const words = phrase.split(' ');
    let wordIdx = 0;

    setOverlayVisible(true);
    setShowTabBadge(false);
    setStreamedText('');

    const streamNextWord = () => {
      if (cancelled) return;
      if (wordIdx < words.length) {
        wordIdx += 1;
        setStreamedText(words.slice(0, wordIdx).join(' '));
        wordTimer = window.setTimeout(streamNextWord, 48);
      } else {
        setShowTabBadge(true);
        holdTimer = window.setTimeout(() => {
          if (cancelled) return;
          setOverlayVisible(false);
          fadeTimer = window.setTimeout(() => {
            if (cancelled) return;
            setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
          }, 260);
        }, 4000);
      }
    };

    streamNextWord();

    return () => {
      cancelled = true;
      if (wordTimer !== null) window.clearTimeout(wordTimer);
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      if (fadeTimer !== null) window.clearTimeout(fadeTimer);
    };
  }, [placeholderIndex, prompt]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, Math.max(0, 10 - referenceImages.length)).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReferenceImages((prev) => (prev.length < 10 ? [...prev, reader.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmitPrompt({
      prompt: trimmed,
      aspectRatio,
      count,
      model,
      referenceImages,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !prompt.trim()) {
      e.preventDefault();
      setPrompt(ROTATING_PLACEHOLDERS[placeholderIndex] || '');
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirmTemplate = (template: DesignTemplate) => {
    setPreviewTemplate(null);
    setTemplateToast(`Loaded "${template.title}" template`);
    window.setTimeout(() => {
      setTemplateToast(null);
    }, 3000);
    onSelectTemplate(template);
  };

  const filteredTemplates =
    activeCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const selectedRatioObj = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[1];

  return (
    <div
      id="image-home-view"
      className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-sans ideogram-custom-scroll"
    >
      {/* DEDICATED STANDALONE MOBILE IMAGES WORKSPACE UI (< 768px, block md:hidden) */}
      <div
        id="mobile-image-home-container"
        className="block md:hidden min-h-[100dvh] w-full bg-[#FFFFFF] dark:bg-[#191919] flex flex-col justify-start overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] antialiased relative z-20 pb-28"
      >
        {onOpenStudio && (
          <button
            type="button"
            id="mobile-image-creations-btn"
            onClick={onOpenStudio}
            className="fixed top-3.5 right-4 z-30 text-[13.5px] font-medium text-slate-700 dark:text-neutral-200 hover:text-slate-900 bg-[#FFFFFF]/95 dark:bg-[#222222]/95 backdrop-blur-xs border-0 px-2.5 py-1 rounded-full active:scale-95 transition-all md:hidden cursor-pointer select-none"
          >
            Creations
          </button>
        )}

        <div className="pt-8 pb-4 px-4 text-center select-none">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-slate-900 dark:text-white leading-tight">
            Image Workspace
          </h1>
          <p className="text-[13.5px] text-slate-500 dark:text-neutral-400 mt-1">
            Create, edit, and enhance images with AI
          </p>
        </div>

        <div className="px-4 mt-2 w-full select-none">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {STUDIO_WORKFLOWS.map((wf) => (
              <button
                key={`mobile-${wf.id}`}
                type="button"
                onClick={() => onSelectWorkflow(wf.id)}
                className="flex items-center gap-3 py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/10 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
              >
                <img
                  src={wf.image}
                  alt={wf.title}
                  className="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"
                />
                <span className="text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">
                  {wf.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 px-4 pb-28 w-full select-none">
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white mb-3">Templates</h2>
          <div id="mobile-image-home-templates-grid" className="grid grid-cols-2 gap-3 w-full">
            {filteredTemplates.map((tmpl) => (
              <button
                key={`mobile-tmpl-${tmpl.id}`}
                type="button"
                onClick={() => setPreviewTemplate(tmpl)}
                className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 text-left cursor-pointer"
                style={{ aspectRatio: (tmpl.aspectRatio || '1:1').replace(':', '/') }}
              >
                <img src={tmpl.imageUrl} alt={tmpl.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Floating Pill Prompt Box */}
      <div
        id="mobile-image-composer-container"
        className="fixed bottom-3 left-3 right-3 z-30 md:hidden font-['Plus_Jakarta_Sans',sans-serif]"
      >
        <input
          ref={mobileFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-full box-border min-h-[48px] rounded-full bg-[#FFFFFF] dark:bg-[#222222] border border-slate-200/85 dark:border-white/10 shadow-[0_8px_28px_rgba(15,23,42,0.10)] px-3 py-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => mobileFileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-slate-600 dark:text-neutral-300 hover:bg-slate-100/70 shrink-0 cursor-pointer"
            aria-label="Attach reference photo"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </button>
          <textarea
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Create image..."
            className="flex-1 min-w-0 resize-none bg-transparent text-[15px] leading-[22px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none border-0 p-0 m-0"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="w-9 h-9 rounded-full bg-blue-600 text-white disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Generate Image"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Atmospheric Studio Backdrop */}
      <div className="hidden md:block pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden -z-0 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_25%,rgba(56,189,248,0.085)_0%,rgba(99,102,241,0.05)_50%,rgba(255,255,255,0)_100%)] dark:bg-[radial-gradient(ellipse_75%_65%_at_50%_25%,rgba(56,189,248,0.12)_0%,rgba(99,102,241,0.08)_50%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.055)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_35%,black_20%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_65%_55%_at_50%_35%,black_20%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-[#191919]" />
      </div>

      {/* Main Scrollable Desktop Content */}
      <div className="hidden md:flex flex-1 w-full pb-16 flex-col relative z-10">
        {/* Hero Prompt Section */}
        <div className="w-full max-w-[760px] mx-auto flex flex-col items-center pt-12 pb-10 px-4 relative z-40">
          <div className="text-center mb-6 select-none">
            <h1 className="flex items-baseline justify-center flex-wrap leading-tight">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-neutral-900 dark:text-white">
                Imagine it.
              </span>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent ml-2">
                Craft it.
              </span>
            </h1>
            <p className="mt-1.5 text-[13.5px] font-normal text-neutral-500 dark:text-neutral-400 tracking-[-0.005em]">
              Describe your vision or start from a studio workflow.
            </p>
          </div>

          {/* Commanding Generate Box */}
          <div
            ref={composerRef}
            className="w-full max-w-[760px] mx-auto bg-white/85 dark:bg-[#1E2024]/85 backdrop-blur-xl rounded-2xl border border-slate-900/[0.07] dark:border-white/[0.08] focus-within:border-sky-400/50 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.11),0_4px_12px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.4),0_4px_12px_-2px_rgba(0,0,0,0.2)] transition-all duration-200 relative z-40 flex flex-col justify-between"
          >
            <input
              ref={fileInputRef}
              type="file"
              id="image-home-file-input"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {referenceImages.length > 0 && (
              <div id="image-home-ref-preview" className="flex items-center gap-2 pt-4 px-4 mb-1">
                {referenceImages.map((src, idx) => (
                  <div
                    key={`${idx}-${src.slice(0, 20)}`}
                    className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-2xs"
                  >
                    <img src={src} alt="Reference" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setReferenceImages((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))
                      }
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      title="Remove reference"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Prompt Input Container with Exact Word-by-Word Typewriter Overlay */}
            <div
              className="relative w-full min-h-[72px] flex items-start cursor-text pt-4 px-4"
              id="image-home-input-wrapper"
              onClick={() => promptInputRef.current?.focus()}
            >
              <div
                id="image-home-placeholder-overlay"
                className={`pointer-events-none absolute left-4 top-4 right-4 flex items-start select-none text-[14.5px] leading-relaxed text-neutral-400 dark:text-neutral-500 transition-opacity duration-200 z-0 ${
                  prompt.trim().length > 0 || !overlayVisible ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <span id="image-home-placeholder-text">{streamedText}</span>
                <span
                  id="image-home-tab-badge"
                  className={`inline-flex items-center ml-2 text-[10px] font-medium tracking-wide text-neutral-400 bg-neutral-100/90 border border-neutral-200/70 rounded px-1.5 py-0.5 shrink-0 select-none uppercase transition-opacity duration-300 align-baseline dark:text-neutral-400 dark:bg-white/10 dark:border-white/10 ${
                    showTabBadge && prompt.trim().length === 0 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  Tab
                </span>
              </div>

              <textarea
                ref={promptInputRef}
                id="image-home-prompt-input"
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent resize-none border-0 p-0 m-0 min-h-[72px] max-h-[160px] text-[14.5px] leading-relaxed text-neutral-800 dark:text-white placeholder:text-neutral-400 font-normal focus:outline-none focus:ring-0 block overflow-hidden relative z-10"
                spellCheck={false}
              />
            </div>

            {/* Bottom Control Bar */}
            <div className="px-3.5 pb-3 pt-2 flex items-center justify-between mt-auto shrink-0 relative z-40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="image-home-ref-slot"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 rounded-xl border border-neutral-200/85 dark:border-white/10 bg-neutral-50/90 dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/[0.08] text-neutral-500 dark:text-neutral-400 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Add reference image"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                <div className="relative z-50" id="image-home-ratio-wrapper">
                  <button
                    type="button"
                    id="image-home-ratio-btn"
                    onClick={() => setActivePopover((p) => (p === 'ratio' ? null : 'ratio'))}
                    className="h-8 px-2.5 rounded-xl border border-neutral-200/85 bg-neutral-50/90 hover:bg-neutral-100 text-neutral-700 text-[12.5px] font-medium tabular-nums inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300"
                    title={`Aspect Ratio: ${selectedRatioObj.label}`}
                  >
                    <span
                      id="image-home-ratio-icon"
                      className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300"
                    >
                      <div
                        className="studio-ratio-wireframe border-[1.5px] border-current rounded-xs shrink-0"
                        style={{
                          width: `${Math.max(9, Math.round(selectedRatioObj.w * 0.85))}px`,
                          height: `${Math.max(9, Math.round(selectedRatioObj.h * 0.85))}px`,
                        }}
                      />
                    </span>
                    <span id="image-home-ratio-label">{selectedRatioObj.label}</span>
                  </button>

                  {activePopover === 'ratio' && (
                    <div
                      id="image-home-ratio-popover"
                      className="absolute left-0 top-full mt-2 w-max min-w-[104px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-64 overflow-y-auto ideogram-custom-scroll"
                    >
                      <div className="space-y-0.5">
                        {ASPECT_RATIOS.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setAspectRatio(r.id);
                              setActivePopover(null);
                            }}
                            className={`image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-normal cursor-pointer transition-colors text-left group ${
                              aspectRatio === r.id
                                ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white'
                                : 'hover:bg-neutral-100/60 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                <div
                                  className="studio-ratio-wireframe border-[1.5px] border-current rounded-xs shrink-0"
                                  style={{ width: `${r.w}px`, height: `${r.h}px` }}
                                />
                              </div>
                              <span className="truncate text-[12.5px] font-normal">{r.label}</span>
                            </div>
                            {aspectRatio === r.id && (
                              <svg className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-50" id="image-home-count-wrapper">
                  <button
                    type="button"
                    id="image-home-count-btn"
                    onClick={() => setActivePopover((p) => (p === 'count' ? null : 'count'))}
                    className="h-8 px-2.5 rounded-xl border border-neutral-200/85 bg-neutral-50/90 hover:bg-neutral-100 text-neutral-700 text-[12.5px] font-medium tabular-nums inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300"
                    title={`Variations: ${count}`}
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300">
                      <svg className="w-3.5 h-3.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 22H4a2 2 0 0 1-2-2V6" />
                        <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
                        <circle cx="12" cy="8" r="2" />
                        <rect width="16" height="16" x="6" y="2" rx="2" />
                      </svg>
                    </span>
                    <span id="image-home-count-label">{count}</span>
                  </button>

                  {activePopover === 'count' && (
                    <div
                      id="image-home-count-popover"
                      className="absolute left-0 top-full mt-2 w-max min-w-[76px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200"
                    >
                      <div className="space-y-0.5">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setCount(num);
                              setActivePopover(null);
                            }}
                            className={`image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-normal cursor-pointer transition-colors text-left group ${
                              count === num
                                ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white'
                                : 'hover:bg-neutral-100/60 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-[12.5px] font-normal">{num}</span>
                            {count === num && (
                              <svg className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative z-50" id="image-home-model-wrapper">
                  <button
                    type="button"
                    id="image-home-model-btn"
                    onClick={() => setActivePopover((p) => (p === 'model' ? null : 'model'))}
                    className="h-8 px-2.5 rounded-xl hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-950 text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none dark:hover:bg-white/10 dark:text-neutral-300 dark:hover:text-white"
                    title={`Model: ${getModelDisplayName(model)}`}
                  >
                    <ModelIcon modelId={model} className="w-3.5 h-3.5 shrink-0" />
                    <span id="image-home-model-label">{getModelDisplayName(model)}</span>
                    <svg className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {activePopover === 'model' && (
                    <div
                      id="image-home-model-popover"
                      className="absolute right-0 top-full mt-2 w-max min-w-[180px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-72 overflow-y-auto ideogram-custom-scroll"
                    >
                      <div className="space-y-0.5">
                        {IMAGE_MODELS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setModel(m.id);
                              setActivePopover(null);
                            }}
                            className={`image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12.5px] font-normal cursor-pointer transition-colors group text-left ${
                              model === m.id
                                ? 'bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white'
                                : 'hover:bg-neutral-100/60 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ModelIcon modelId={m.id} className="w-3.5 h-3.5 shrink-0" />
                              <span className="image-home-model-name text-[12.5px] font-normal truncate">
                                {m.name}
                              </span>
                            </div>
                            {model === m.id && (
                              <svg className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="image-home-submit-btn"
                  disabled={!prompt.trim()}
                  onClick={handleSubmit}
                  className={
                    prompt.trim().length > 0
                      ? 'h-8 w-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 hover:opacity-90 shrink-0'
                      : 'h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-xs shrink-0'
                  }
                  title="Generate"
                  aria-label="Generate"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Creative Workflows Full-Width Slim Ideogram Row */}
        <div id="creative-workflows-section" className="w-full px-6 relative z-0">
          <div id="creative-workflows-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full select-none">
            {STUDIO_WORKFLOWS.map((wf) => (
              <div
                key={wf.id}
                role="button"
                tabIndex={0}
                data-workflow-tool={wf.id}
                onClick={() => onSelectWorkflow(wf.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectWorkflow(wf.id);
                  }
                }}
                className="workflow-carousel-card group relative h-[112px] px-5 py-3.5 rounded-2xl bg-white/85 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.06] backdrop-blur-xl border border-slate-900/[0.07] hover:border-slate-900/[0.12] dark:border-white/[0.08] dark:hover:border-white/[0.14] shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.08)] transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden cursor-pointer select-none"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug truncate">
                    {wf.title}
                  </span>
                  <span className="text-[13px] font-normal text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                    {wf.subtitle}
                  </span>
                </div>
                <div className="w-[82px] h-[82px] aspect-square shrink-0 relative overflow-visible select-none">
                  <div className="split-slice-top absolute inset-0 rounded-xl overflow-hidden pointer-events-none select-none transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <img
                      src={wf.image}
                      alt={wf.title}
                      loading="eager"
                      decoding="sync"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="split-slice-bottom absolute inset-0 rounded-xl overflow-hidden pointer-events-none select-none transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <img
                      src={wf.image}
                      alt=""
                      loading="eager"
                      decoding="sync"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design Templates Section */}
        <div id="design-templates-section" className="w-full px-6 mt-7 flex flex-col pb-16">
          <div className="flex items-center">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Templates
            </h2>
          </div>

          <div id="tmpl-category-filter-bar" className="mt-3 mb-4 flex items-center gap-1.5 flex-wrap">
            {DESIGN_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                data-category={category}
                onClick={() => setActiveCategory(category)}
                className={`tmpl-filter-pill shrink-0 rounded-lg px-3 py-1.5 text-[13px] cursor-pointer transition-colors ${
                  activeCategory === category
                    ? 'active font-medium bg-slate-900/[0.08] text-neutral-900 dark:bg-white/10 dark:text-white'
                    : 'font-normal text-neutral-500 hover:text-neutral-900 hover:bg-slate-900/[0.04] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div id="image-home-templates-grid" className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewTemplate(tmpl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewTemplate(tmpl);
                  }
                }}
                className="group relative rounded-md overflow-hidden break-inside-avoid mb-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer select-none"
                style={{ aspectRatio: (tmpl.aspectRatio || '1:1').replace(':', '/') }}
              >
                <div className="relative w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={tmpl.imageUrl}
                    alt={tmpl.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover block group-hover:scale-[1.03] transition-transform duration-300 z-[1]"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[2]">
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 z-[3]">
                    <span className="text-white text-[12.5px] font-semibold leading-snug tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] line-clamp-1">
                      {tmpl.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* White-Theme Template Preview Modal (#template-white-preview-modal) */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={handleConfirmTemplate}
      />

      {/* Exact Studio Toast Banner */}
      {templateToast && (
        <div
          id="studio-toast-banner"
          role="status"
          className="fixed bottom-5 right-5 z-[99999] px-4 py-2.5 rounded-xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-medium shadow-2xl backdrop-blur-md border border-white/10 dark:border-black/10 flex items-center gap-2 select-none"
        >
          <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{templateToast}</span>
        </div>
      )}
    </div>
  );
};
