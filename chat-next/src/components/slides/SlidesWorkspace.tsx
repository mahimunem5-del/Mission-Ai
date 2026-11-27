import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  Paperclip,
  Plus,
  Search,
  Wand2,
  X
} from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import {
  buildDemoDeck,
  downloadSlidesDeck,
  formatSlidesFileSize,
  SLIDES_TEMPLATES,
  type SlideAttachedFile,
  type SlideItem,
  type SlideTemplate
} from '../../services/slidesService';
import { SlidesDeckViewer } from './SlidesDeckViewer';
import { SlidesTemplateModal } from './SlidesTemplateModal';

const COUNT_OPTIONS = ['Auto', '4', '6', '8', '10', '12'];
const TONE_OPTIONS = ['Default', 'Casual', 'Professional', 'Funny', 'Educational', 'Sales Pitch'];
const STYLE_OPTIONS = ['Standard', 'Visual', 'Minimal', 'Detailed'];
const VISUAL_OPTIONS = ['Stock', 'AI Visual', 'Minimal', 'None'];

type DropdownKey = 'count' | 'tone' | 'style' | 'visual' | null;

export const SlidesWorkspace: React.FC = () => {
  const { setMobileSidebarOpen } = useAppShell();

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('Auto');
  const [slideCount, setSlideCount] = useState('Auto');
  const [tone, setTone] = useState('Professional');
  const [style, setStyle] = useState('Standard');
  const [visuals, setVisuals] = useState('Stock');
  const [selectedTemplate, setSelectedTemplate] = useState<SlideTemplate | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<SlideAttachedFile[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  const [promptError, setPromptError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState({
    percent: '28%',
    widthClass: 'w-1/4',
    title: 'Understanding your topic & audience...',
    subtitle: 'Extracting narrative structure and target audience...'
  });

  const [currentDeck, setCurrentDeck] = useState<SlideItem[] | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<SlideTemplate | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsBarRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (controlsBarRef.current && !controlsBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SLIDES_TEMPLATES;
    return SLIDES_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const canGenerate =
    !isGenerating &&
    (prompt.trim().length > 0 || selectedTemplate !== null || attachedFiles.length > 0);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: SlideAttachedFile[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type
    }));
    setAttachedFiles((prev) => [...prev, ...next]);
    setPromptError(false);
  };

  const handleUseTemplate = (tmpl: SlideTemplate) => {
    setSelectedTemplate(tmpl);
    setPrompt(tmpl.defaultPrompt);
    setTone(tmpl.defaultTone);
    setMode(tmpl.defaultMode);
    setPromptError(false);
    showToast(`Template "${tmpl.title}" applied`);
  };

  const handleGenerate = () => {
    if (!prompt.trim() && !selectedTemplate && attachedFiles.length === 0) {
      setPromptError(true);
      return;
    }
    setPromptError(false);
    setIsGenerating(true);
    setCurrentDeck(null);

    const effectivePrompt =
      prompt.trim() ||
      (selectedTemplate
        ? `${selectedTemplate.title}: ${selectedTemplate.description}`
        : `Presentation based on ${attachedFiles.map((f) => f.name).join(', ')}`);

    setLoadingStep({
      percent: '28%',
      widthClass: 'w-[28%]',
      title: 'Understanding your topic & audience...',
      subtitle: 'Extracting narrative structure and target audience...'
    });

    const t1 = window.setTimeout(() => {
      setLoadingStep({
        percent: '64%',
        widthClass: 'w-[64%]',
        title: 'Planning your presentation structure...',
        subtitle: 'Designing slides layout and content hierarchy...'
      });
    }, 600);

    const t2 = window.setTimeout(() => {
      setLoadingStep({
        percent: '92%',
        widthClass: 'w-[92%]',
        title: 'Designing your slides & visuals...',
        subtitle: 'Applying visual styling, typography, and transitions...'
      });
    }, 1200);

    const t3 = window.setTimeout(() => {
      const deck = buildDemoDeck(effectivePrompt, mode, tone, slideCount);
      setCurrentDeck(deck);
      setActiveSlideIndex(0);
      setIsGenerating(false);
      showToast('Presentation generated successfully!');
    }, 1800);

    timersRef.current = [t1, t2, t3];
  };

  return (
    <div
      id="slides-studio-workspace"
      className="flex-1 flex flex-col h-full overflow-y-auto min-w-0 bg-white dark:bg-[#191919] relative"
    >
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 relative z-20">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-md border border-slate-200 dark:border-neutral-700 p-1.5 text-slate-600 dark:text-neutral-300"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100">Slides</span>
        <div className="w-7" />
      </div>

      {/* 1. Decorative Ambient Slides Background */}
      <div className="absolute top-0 inset-x-0 h-80 sm:h-96 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-b from-blue-400/20 via-indigo-500/10 to-transparent blur-[100px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-start justify-center pt-2">
          <div className="relative flex items-center justify-center gap-3 sm:gap-4 py-2 opacity-35 blur-[0.4px] max-w-5xl mx-auto">
            <div className="hidden md:block w-52 lg:w-60 h-32 lg:h-36 rounded-xl border border-slate-200/80 bg-white shadow-lg overflow-hidden transform -rotate-3 scale-95">
              <div className="h-full w-full relative">
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80"
                  alt="Pitch Deck"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-[9px] uppercase tracking-wider text-blue-300 font-semibold">
                    Series A Pitch
                  </span>
                  <span className="text-xs font-bold leading-tight">Venture Capital Overview</span>
                </div>
              </div>
            </div>
            <div className="w-48 sm:w-56 lg:w-64 h-32 sm:h-36 lg:h-40 rounded-xl border border-slate-200/80 bg-white shadow-xl overflow-hidden transform -rotate-1 sm:-translate-y-1">
              <div className="h-full w-full relative">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
                  alt="Financial Metrics"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                    Q3 Growth
                  </span>
                  <span className="text-xs font-bold leading-tight">+140% ARR Metrics</span>
                </div>
              </div>
            </div>
            <div className="w-60 sm:w-72 lg:w-84 h-38 sm:h-44 lg:h-50 rounded-2xl border-2 border-blue-400/30 bg-white shadow-2xl overflow-hidden transform z-10 -translate-y-2">
              <div className="h-full w-full relative bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80"
                  alt="Strategic Pillars"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
                  <div className="text-[10px] text-blue-300 font-medium">Strategic Roadmap 2026</div>
                  <div className="text-sm sm:text-base font-bold leading-snug">
                    Global AI Platform Architecture
                  </div>
                </div>
              </div>
            </div>
            <div className="w-48 sm:w-56 lg:w-64 h-32 sm:h-36 lg:h-40 rounded-xl border border-slate-200/80 bg-white shadow-xl overflow-hidden transform rotate-1 sm:-translate-y-1">
              <div className="h-full w-full relative">
                <img
                  src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80"
                  alt="Product Launch"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-[9px] uppercase tracking-wider text-purple-300 font-semibold">
                    Product Deck
                  </span>
                  <span className="text-xs font-bold leading-tight">Next-Gen Interface</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block w-52 lg:w-60 h-32 lg:h-36 rounded-xl border border-slate-200/80 bg-white shadow-lg overflow-hidden transform rotate-3 scale-95">
              <div className="h-full w-full relative">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80"
                  alt="UX Wireframes"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-[9px] uppercase tracking-wider text-amber-300 font-semibold">
                    User Experience
                  </span>
                  <span className="text-xs font-bold leading-tight">Customer Journey Map</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-[#191919]/70 dark:to-[#191919]" />
      </div>

      {/* 2. Main Content */}
      <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-7 pt-7 sm:pt-9 pb-20 z-10">
        {/* Heading */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            What presentation do you need?
          </h1>
          <p className="text-slate-500 text-sm sm:text-[15px] mt-2">
            Describe your idea and we&apos;ll help turn it into a presentation.
          </p>
        </div>

        {/* Prompt Composer */}
        <div className="relative w-full max-w-4xl mx-auto z-10">
          <div
            id="slides-composer-box"
            className={`w-full bg-white rounded-2xl border ${
              promptError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-neutral-200/90'
            } shadow-sm p-4 sm:p-5 relative transition-all focus-within:border-neutral-300 outline-none`}
          >
            {/* Attachments & Template Chip */}
            {(selectedTemplate || attachedFiles.length > 0) && (
              <div id="slides-attachments-container" className="flex flex-wrap items-center gap-2 mb-2.5">
                {selectedTemplate && (
                  <div
                    id="slides-selected-template-badge"
                    className="inline-flex items-center gap-2.5 pl-1.5 pr-2 py-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 w-fit shadow-2xs transition-all"
                  >
                    <div className="w-8 h-5.5 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200/80">
                      <img
                        src={selectedTemplate.img}
                        alt={selectedTemplate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0">
                        {selectedTemplate.category}
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-[260px]">
                        {selectedTemplate.title}
                      </span>
                    </div>
                    <button
                      id="slides-template-clear-btn"
                      type="button"
                      onClick={() => setSelectedTemplate(null)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5 cursor-pointer shrink-0"
                      title="Remove template"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  >
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="font-medium truncate max-w-[140px]">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {formatSlidesFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))
                      }
                      className="text-slate-400 hover:text-rose-600"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea */}
            <textarea
              id="slides-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (promptError && e.target.value.trim()) setPromptError(false);
              }}
              placeholder="Describe your presentation — topic, audience, and what it should cover..."
              className="w-full resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 text-[15px] sm:text-base bg-transparent leading-relaxed"
            />

            {promptError && (
              <div
                id="slides-prompt-error"
                className="flex items-center gap-1.5 text-xs text-rose-500 font-medium py-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please describe your presentation idea before creating slides.</span>
              </div>
            )}

            {/* Controls Bar */}
            <div
              ref={controlsBarRef}
              className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 mt-2"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  id="slides-add-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer flex items-center justify-center shadow-2xs"
                  title="Add attachment (PDF, DOCX, PPTX, images)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="slides-file-input"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  multiple
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                  }}
                />

                {/* Slide Count */}
                <div className="relative" id="slides-count-wrapper">
                  <button
                    id="slides-count-btn"
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'count' ? null : 'count')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <span id="slides-count-label">
                      {slideCount === 'Auto' ? 'Auto' : `${slideCount} Slides`}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {openDropdown === 'count' && (
                    <div
                      id="slides-count-dropdown"
                      className="absolute bottom-full mb-2 left-0 w-36 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30"
                    >
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Slide Count
                      </div>
                      {COUNT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSlideCount(opt);
                            setOpenDropdown(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                        >
                          <span>{opt === 'Auto' ? 'Auto' : `${opt} Slides`}</span>
                          {slideCount === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tone */}
                <div className="relative" id="slides-tone-wrapper">
                  <button
                    id="slides-tone-btn"
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'tone' ? null : 'tone')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <span id="slides-tone-label">{tone}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {openDropdown === 'tone' && (
                    <div
                      id="slides-tone-dropdown"
                      className="absolute bottom-full mb-2 left-0 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30"
                    >
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Tone
                      </div>
                      {TONE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setTone(opt);
                            setOpenDropdown(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                        >
                          <span>{opt}</span>
                          {tone === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Style */}
                <div className="relative" id="slides-style-wrapper">
                  <button
                    id="slides-style-btn"
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <span id="slides-style-label">{style}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {openDropdown === 'style' && (
                    <div
                      id="slides-style-dropdown"
                      className="absolute bottom-full mb-2 left-0 w-40 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30"
                    >
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Content Style
                      </div>
                      {STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStyle(opt);
                            setOpenDropdown(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                        >
                          <span>{opt}</span>
                          {style === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visuals */}
                <div className="relative" id="slides-visual-wrapper">
                  <button
                    id="slides-visual-btn"
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'visual' ? null : 'visual')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <span id="slides-visual-label">{visuals}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {openDropdown === 'visual' && (
                    <div
                      id="slides-visual-dropdown"
                      className="absolute bottom-full mb-2 left-0 w-36 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30"
                    >
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Visuals
                      </div>
                      {VISUAL_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setVisuals(opt);
                            setOpenDropdown(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                        >
                          <span>{opt}</span>
                          {visuals === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Create Slides CTA */}
              <button
                id="slides-generate-btn"
                type="button"
                disabled={!canGenerate}
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm shadow-blue-500/25 cursor-pointer ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className={`w-4 h-4 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
                <span id="slides-generate-text">
                  {isGenerating ? 'Generating...' : 'Create Slides'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Loading State */}
        {isGenerating && (
          <div
            id="slides-loading-state"
            className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div id="slides-loading-title" className="text-sm font-semibold text-slate-800">
                  {loadingStep.title}
                </div>
                <div id="slides-loading-subtitle" className="text-xs text-slate-400">
                  {loadingStep.subtitle}
                </div>
              </div>
              <span
                id="slides-loading-percent"
                className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"
              >
                {loadingStep.percent}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                id="slides-progress-bar"
                className={`h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-300 ${loadingStep.widthClass}`}
              />
            </div>
          </div>
        )}

        {/* 4. Generated Presentation Deck Viewer */}
        {currentDeck && !isGenerating && (
          <SlidesDeckViewer
            deck={currentDeck}
            activeSlideIndex={activeSlideIndex}
            tone={tone}
            onSelectSlide={setActiveSlideIndex}
            onNewDeck={() => {
              setCurrentDeck(null);
              setPrompt('');
              setSelectedTemplate(null);
              setAttachedFiles([]);
            }}
            onDownload={() => downloadSlidesDeck(currentDeck, prompt, tone)}
          />
        )}

        {/* 5. Templates Gallery */}
        <div id="slides-templates-section" className="pt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Templates</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Start from a professionally designed deck structure
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                id="slides-template-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl outline-none focus:border-neutral-300 text-slate-800 placeholder-slate-400 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  id="slides-search-clear"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div
              id="slides-templates-empty"
              className="py-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-slate-800">No templates found.</div>
              <p className="text-xs text-slate-400">Try adjusting your search terms.</p>
              <button
                id="slides-empty-reset-btn"
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-blue-600 transition-colors shadow-2xs cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div
              id="slides-templates-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setPreviewTemplate(tmpl)}
                    className={`group relative rounded-2xl border ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-200/90'
                    } bg-white overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
                  >
                    <div className="h-36 sm:h-40 w-full overflow-hidden bg-slate-900 relative">
                      <img
                        src={tmpl.img}
                        alt={tmpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wide uppercase">
                        {tmpl.category}
                      </span>
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-[10px] font-bold text-white shadow-xs">
                            Selected
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            tmpl.isPro ? 'bg-amber-500/95' : 'bg-emerald-500/95'
                          } text-[10px] font-bold text-white shadow-2xs`}
                        >
                          {tmpl.isPro ? 'PRO' : 'FREE'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {tmpl.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">8 Slides</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(tmpl);
                          }}
                          className="slides-card-use-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>Use</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      <SlidesTemplateModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Toast */}
      {toastMsg && (
        <div
          id="studio-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default SlidesWorkspace;
