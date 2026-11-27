import React from 'react';
import { ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import type { SlideItem } from '../../services/slidesService';

interface SlidesDeckViewerProps {
  deck: SlideItem[];
  activeSlideIndex: number;
  tone: string;
  onSelectSlide: (index: number) => void;
  onNewDeck: () => void;
  onDownload: () => void;
}

export const SlidesDeckViewer: React.FC<SlidesDeckViewerProps> = ({
  deck,
  activeSlideIndex,
  tone,
  onSelectSlide,
  onNewDeck,
  onDownload
}) => {
  const slide = deck[activeSlideIndex];
  if (!slide) return null;

  return (
    <div id="slides-presentation-deck" className="max-w-4xl mx-auto w-full space-y-4">
      {/* Top Deck Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="slides-deck-prev"
              type="button"
              disabled={activeSlideIndex === 0}
              onClick={() => onSelectSlide(Math.max(0, activeSlideIndex - 1))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              id="slides-deck-counter"
              className="text-xs font-semibold px-2 text-slate-700 min-w-[80px] text-center"
            >
              Slide {activeSlideIndex + 1} of {deck.length}
            </span>
            <button
              id="slides-deck-next"
              type="button"
              disabled={activeSlideIndex === deck.length - 1}
              onClick={() => onSelectSlide(Math.min(deck.length - 1, activeSlideIndex + 1))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span
            id="slides-deck-meta-badge"
            className="hidden sm:inline-block text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg"
          >
            {tone} • {deck.length} Slides
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="slides-new-deck-btn"
            type="button"
            onClick={onNewDeck}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            New Presentation
          </button>
          <button
            id="slides-export-btn"
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 shadow-xs transition-colors text-xs font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Active Slide Display (16:9) */}
      <div
        id="slides-active-canvas"
        className="relative w-full aspect-[16/9] bg-slate-950 text-white rounded-2xl shadow-xl border border-slate-800 overflow-hidden p-6 sm:p-10 flex flex-col justify-between"
      >
        {slide.type === 'cover' && (
          <>
            <div className="h-full w-full flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {slide.pill}
                </span>
                <span className="text-xs text-slate-400 font-mono tracking-wider">AI SLIDES</span>
              </div>
              <div className="my-auto max-w-2xl py-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{slide.meta}</span>
                <span>{slide.footerNote}</span>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {slide.type === 'overview' && (
          <div className="h-full w-full flex flex-col justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
                {slide.pill}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto py-3">
              {slide.points.map((p, idx) => (
                <div
                  key={p.label}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold mb-2">
                    0{idx + 1}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-200 mb-1">
                    {p.label}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Slide {activeSlideIndex + 1} of {deck.length}
              </span>
              <span>Mestrio AI Studio</span>
            </div>
          </div>
        )}

        {slide.type === 'features' && (
          <div className="h-full w-full flex flex-col justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
                {slide.pill}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto py-3">
              {slide.cards.map((c) => (
                <div
                  key={c.title}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-900 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5">{c.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Slide {activeSlideIndex + 1} of {deck.length}
              </span>
              <span>Mestrio AI Studio</span>
            </div>
          </div>
        )}

        {slide.type === 'process' && (
          <div className="h-full w-full flex flex-col justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
                {slide.pill}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto py-3">
              {slide.phases.map((p) => (
                <div
                  key={p.step}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
                >
                  <div className="text-blue-400 font-mono font-bold text-sm mb-1">{p.step}</div>
                  <div className="text-xs font-bold text-slate-200 mb-1">{p.title}</div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
                    {p.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Slide {activeSlideIndex + 1} of {deck.length}
              </span>
              <span>Mestrio AI Studio</span>
            </div>
          </div>
        )}

        {slide.type === 'metrics' && (
          <div className="h-full w-full flex flex-col justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
                {slide.pill}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto py-3">
              {slide.stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 text-center hover:border-emerald-500/40 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-1">{s.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Slide {activeSlideIndex + 1} of {deck.length}
              </span>
              <span>Mestrio AI Studio</span>
            </div>
          </div>
        )}

        {slide.type === 'conclusion' && (
          <div className="h-full w-full flex flex-col justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-purple-400 uppercase">
                {slide.pill}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
            <div className="space-y-2.5 my-auto max-w-xl py-2">
              {slide.actions.map((act) => (
                <div
                  key={act}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <span className="text-xs text-slate-200 font-medium">{act}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{slide.contact}</span>
              <span>
                Slide {activeSlideIndex + 1} of {deck.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Slide Thumbnails Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Slide Overview
        </div>
        <div id="slides-thumbnail-strip" className="flex gap-2.5 overflow-x-auto pb-1 snap-x">
          {deck.map((s, idx) => {
            const isCur = idx === activeSlideIndex;
            return (
              <button
                key={`${s.type}-${idx}`}
                type="button"
                onClick={() => onSelectSlide(idx)}
                className={`flex-shrink-0 w-28 sm:w-32 aspect-[16/9] rounded-xl border-2 text-left ${
                  isCur
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-900'
                    : 'border-slate-200 bg-slate-800 hover:border-slate-300'
                } p-2 flex flex-col justify-between text-white cursor-pointer transition-all snap-start select-none`}
              >
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono w-full">
                  <span>#0{idx + 1}</span>
                  <span className="text-[8px] uppercase tracking-wider text-blue-300">{s.type}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-200 truncate leading-snug w-full">
                  {s.title}
                </div>
                <div className="w-full bg-slate-700/60 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${((idx + 1) / deck.length) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
