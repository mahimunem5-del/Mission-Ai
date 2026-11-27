import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { SlideTemplate } from '../../services/slidesService';

interface SlidesTemplateModalProps {
  template: SlideTemplate | null;
  onClose: () => void;
  onUseTemplate: (template: SlideTemplate) => void;
}

const TOTAL_PREVIEW_SLIDES = 8;

export const SlidesTemplateModal: React.FC<SlidesTemplateModalProps> = ({
  template,
  onClose,
  onUseTemplate
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [template]);

  useEffect(() => {
    if (!template) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setSlideIndex((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight')
        setSlideIndex((i) => Math.min(TOTAL_PREVIEW_SLIDES - 1, i + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [template, onClose]);

  if (!template) return null;

  const renderPreviewSlide = () => {
    switch (slideIndex) {
      case 0:
        return (
          <>
            <div className="absolute inset-0">
              <img
                src={template.img}
                alt={template.title}
                className="w-full h-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/25" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold tracking-wider uppercase">
                  {template.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    template.isPro ? 'bg-amber-500/80' : 'bg-emerald-500/80'
                  } text-white text-[10px] font-bold uppercase tracking-wider`}
                >
                  {template.isPro ? 'PRO' : 'FREE'}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">16:9 HD</span>
            </div>
            <div className="relative z-10 my-auto py-3">
              <span className="text-[11px] sm:text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
                Presentation Deck
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {template.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                {template.description}
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10">
              <span>AI Presentation Engine</span>
              <span>Click &quot;Use Template&quot; to begin</span>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Executive Summary
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Strategic Scope &amp; Objectives
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">02 / 08</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto py-2">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4">
                <div className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Core Baseline
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Evaluation of target scope, stakeholder alignment requirements, and key operational
                  delivery objectives.
                </p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4">
                <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Expected Value
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Measurable acceleration in production velocity, streamlined workflows, and unified
                  leadership visibility.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Confidential &amp; Proprietary</span>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Core Pillars
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Strategic Architecture &amp; Framework
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">03 / 08</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 my-auto py-2">
              {[
                { num: '1', title: 'Discovery', desc: 'In-depth stakeholder audit and capability mapping.', color: 'bg-blue-500/20 text-blue-400' },
                { num: '2', title: 'Execution', desc: 'Rapid phased deployment with automated validation.', color: 'bg-indigo-500/20 text-indigo-400' },
                { num: '3', title: 'Scale', desc: 'Long-term performance tracking and automated scaling.', color: 'bg-emerald-500/20 text-emerald-400' }
              ].map((p) => (
                <div key={p.num} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3">
                  <div className={`w-6 h-6 rounded-lg ${p.color} flex items-center justify-center text-xs font-bold mb-1.5`}>
                    {p.num}
                  </div>
                  <div className="text-xs font-bold text-white">{p.title}</div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Methodology Overview</span>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Metrics &amp; Performance
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Quantifiable Target Benchmarks
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">04 / 08</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-auto py-2">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-400">+140%</div>
                <div className="text-[11px] font-bold text-white mt-1">Growth Index</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Year-over-year acceleration</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">85%</div>
                <div className="text-[11px] font-bold text-white mt-1">Efficiency Gain</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Automated workflow execution</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-400">99.9%</div>
                <div className="text-[11px] font-bold text-white mt-1">Reliability SLA</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Enterprise availability uptime</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Verified Quantitative Data</span>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Implementation Roadmap
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Phased Rollout Schedule
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">05 / 08</span>
            </div>
            <div className="space-y-2 my-auto py-2">
              {[
                { phase: 'Phase 1', title: 'Environment Setup & Architecture Design', sub: 'Security posture, core service provisioning, team onboarding', cls: 'bg-blue-500/20 text-blue-400' },
                { phase: 'Phase 2', title: 'Staged Integration & Pilot Delivery', sub: 'Component rollout, automated tests, feedback validation', cls: 'bg-indigo-500/20 text-indigo-400' },
                { phase: 'Phase 3', title: 'Full Production Deployment & Scale', sub: 'Global availability, SLA governance, continuous monitoring', cls: 'bg-emerald-500/20 text-emerald-400' }
              ].map((item) => (
                <div key={item.phase} className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-2 sm:p-2.5">
                  <span className={`px-2 py-0.5 rounded ${item.cls} text-[10px] font-bold shrink-0`}>
                    {item.phase}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Milestone Roadmap</span>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  System Architecture
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  End-to-End Operational Pipeline
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">06 / 08</span>
            </div>
            <div className="grid grid-cols-2 gap-3 my-auto py-2">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold text-sky-400 uppercase block mb-1">
                  Inputs &amp; Triggering
                </span>
                <ul className="text-[10px] text-slate-300 space-y-1">
                  <li>• Structured prompt ingest &amp; context enrichment</li>
                  <li>• Multi-modal reference alignment</li>
                  <li>• Governance &amp; compliance filter pass</li>
                </ul>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                  Outputs &amp; Governance
                </span>
                <ul className="text-[10px] text-slate-300 space-y-1">
                  <li>• High-fidelity 16:9 responsive slide decks</li>
                  <li>• Structured export &amp; outline download</li>
                  <li>• Persistent revision version control</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Process Blueprint</span>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Stakeholder Alignment
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Roles &amp; Governance Structure
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">07 / 08</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 my-auto py-2">
              {[
                { init: 'EO', role: 'Executive Sponsor', desc: 'Strategic Oversight', cls: 'bg-blue-500/20 text-blue-400' },
                { init: 'TL', role: 'Technical Lead', desc: 'Architecture & Systems', cls: 'bg-indigo-500/20 text-indigo-400' },
                { init: 'PM', role: 'Product Lead', desc: 'Roadmap & Delivery', cls: 'bg-emerald-500/20 text-emerald-400' }
              ].map((r) => (
                <div key={r.init} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                  <div className={`w-7 h-7 rounded-full ${r.cls} flex items-center justify-center text-xs font-bold mx-auto mb-1`}>
                    {r.init}
                  </div>
                  <div className="text-xs font-bold text-white">{r.role}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{r.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span>{template.title}</span>
              <span>Governance Model</span>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/40" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold tracking-wider uppercase">
                {template.category}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">08 / 08</span>
            </div>
            <div className="relative z-10 text-center my-auto py-3">
              <span className="text-[11px] sm:text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
                Action Plan &amp; Next Steps
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Thank You</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                Open for questions, architectural feedback, and next steps on implementation.
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10">
              <span>{template.title}</span>
              <span>Click &quot;Use Template&quot; to generate</span>
            </div>
          </>
        );
    }
  };

  return (
    <div
      id="slides-template-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        id="slides-template-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#202020]">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="14" x="3" y="5" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="slides-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 truncate"
                >
                  {template.title}
                </h3>
                <span
                  id="slides-modal-badge"
                  className={
                    template.isPro
                      ? 'px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold uppercase tracking-wider shrink-0'
                      : 'px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold uppercase tracking-wider shrink-0'
                  }
                >
                  {template.isPro ? 'PRO' : 'FREE'}
                </span>
              </div>
              <p id="slides-modal-desc" className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {template.description}
              </p>
            </div>
          </div>
          <button
            id="slides-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Canvas */}
        <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-[#191919] flex-1 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div
              id="slides-modal-canvas"
              className="relative w-full aspect-[16/9] bg-slate-950 text-white rounded-2xl shadow-xl border border-slate-800 overflow-hidden p-5 sm:p-7 flex flex-col justify-between select-none transition-all duration-200"
            >
              {renderPreviewSlide()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-white dark:bg-[#202020] border-t border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl border border-slate-200/60 dark:border-neutral-700">
              <button
                id="slides-modal-prev-btn"
                type="button"
                disabled={slideIndex === 0}
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span
                id="slides-modal-counter"
                className="text-xs font-semibold px-2 text-slate-700 dark:text-neutral-200 min-w-[55px] text-center"
              >
                {slideIndex + 1} / {TOTAL_PREVIEW_SLIDES}
              </span>
              <button
                id="slides-modal-next-btn"
                type="button"
                disabled={slideIndex === TOTAL_PREVIEW_SLIDES - 1}
                onClick={() => setSlideIndex((i) => Math.min(TOTAL_PREVIEW_SLIDES - 1, i + 1))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
              Browse template slides
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="slides-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 text-xs font-medium text-slate-600 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="slides-modal-use-btn"
              type="button"
              onClick={() => {
                onUseTemplate(template);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span>Use Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
