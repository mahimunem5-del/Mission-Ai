import React, { useEffect, useState } from 'react';
import type { DesignTemplate } from '../../data/designTemplates';

interface TemplatePreviewModalProps {
  template: DesignTemplate | null;
  onClose: () => void;
  onUseTemplate: (template: DesignTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onUseTemplate,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!template) return;
    setCopied(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [template, onClose]);

  if (!template) return null;

  const handleCopyPrompt = () => {
    if (!template.prompt || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(template.prompt).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = template.imageUrl;
    a.download = `${template.id || 'template'}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div
      id="template-white-preview-modal"
      className="fixed inset-0 z-[90] md:z-[10000] bg-black/40 backdrop-blur-[1px] md:bg-black/65 md:backdrop-blur-sm flex flex-col md:flex-row items-center justify-center p-3.5 md:p-8 overflow-y-auto md:overflow-hidden transition-all duration-200 font-['Plus_Jakarta_Sans',sans-serif]"
      role="dialog"
      aria-modal="true"
      aria-label={template.title}
    >
      <div
        id="tmpl-modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-pointer"
      />

      <div
        id="tmpl-modal-card-container"
        className="relative w-full max-w-[420px] md:max-w-5xl h-auto max-h-[92dvh] md:max-h-[92vh] bg-white text-neutral-900 rounded-3xl md:rounded-2xl shadow-2xl border border-slate-200/80 md:border-neutral-200 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-left circular close (×) button */}
        <button
          type="button"
          id="tmpl-modal-close-btn"
          onClick={onClose}
          className="absolute top-3.5 left-4 z-40 md:absolute md:top-4 md:left-4 md:z-20 w-9 h-9 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 md:border-neutral-200 text-slate-800 md:text-neutral-700 hover:bg-slate-50 md:hover:bg-neutral-100 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          title="Close preview"
          aria-label="Close preview"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image Stage */}
        <div
          id="tmpl-modal-img-container"
          className="w-full md:flex-1 flex items-center justify-center p-0 md:p-2.5 bg-neutral-100/40 overflow-hidden min-h-0 md:min-h-[520px] max-h-[46dvh] md:max-h-none relative shrink-0 md:shrink"
        >
          <img
            id="tmpl-modal-img"
            src={template.imageUrl}
            alt={template.title}
            className="w-full h-auto max-h-[46dvh] md:max-h-[82vh] md:w-auto md:max-w-full rounded-none md:rounded-lg object-contain relative z-10"
          />
        </div>

        {/* Details Panel */}
        <div className="w-full md:w-[360px] border-t border-slate-100 md:border-t-0 md:border-l md:border-neutral-200 px-5 pt-3.5 pb-6 md:p-6 flex flex-col justify-between bg-white shrink-0 overflow-y-auto">
          <div className="flex flex-col flex-1 min-h-0">
            <h3 id="tmpl-modal-title" className="text-[18px] font-semibold text-slate-900 tracking-tight leading-snug mb-2">
              {template.title}
            </h3>

            <div id="tmpl-modal-prompt-section" className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-900">Prompt</span>
                <button
                  type="button"
                  id="tmpl-modal-copy-prompt-btn"
                  onClick={handleCopyPrompt}
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Copy prompt"
                >
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                  <span className="copy-label">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p
                id="tmpl-modal-prompt-text"
                className="text-xs text-neutral-700 leading-relaxed break-words select-text overflow-y-auto pr-1 max-h-[30vh] ideogram-custom-scroll"
              >
                {template.prompt}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-3 flex flex-col w-full">
            <div className="w-full flex items-center gap-2.5">
              <button
                type="button"
                id="tmpl-modal-cta-btn"
                onClick={() => onUseTemplate(template)}
                className="h-10 px-5 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-medium transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm flex-1"
              >
                <span id="tmpl-modal-cta-text">
                  {template.targetWorkflow === 'precise-edit' ? 'Try with Photo' : 'Use Prompt'}
                </span>
              </button>
              <button
                type="button"
                id="tmpl-modal-download-btn"
                onClick={handleDownload}
                className="h-10 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

