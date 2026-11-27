import React, { useEffect } from 'react';
import type { ImageAsset } from './ImageWorkspace';
import { getModelDisplayName } from './imageStudioConstants';

interface ImageLightboxModalProps {
  asset: ImageAsset | null;
  groupAssets?: ImageAsset[];
  onSelectAsset?: (asset: ImageAsset) => void;
  onClose: () => void;
  onEditInPreciseEdit: (asset: ImageAsset) => void;
  onDownload: (asset: ImageAsset) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  asset,
  groupAssets = [],
  onSelectAsset,
  onClose,
  onEditInPreciseEdit,
  onDownload,
}) => {
  const list = groupAssets.length > 0 ? groupAssets : asset ? [asset] : [];
  const currentIndex = asset ? Math.max(0, list.findIndex((i) => i.id === asset.id)) : 0;

  useEffect(() => {
    if (!asset) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && list.length > 1 && onSelectAsset) {
        const prevIdx = (currentIndex - 1 + list.length) % list.length;
        onSelectAsset(list[prevIdx]);
      } else if (e.key === 'ArrowRight' && list.length > 1 && onSelectAsset) {
        const nextIdx = (currentIndex + 1) % list.length;
        onSelectAsset(list[nextIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [asset, currentIndex, list, onClose, onSelectAsset]);

  if (!asset) return null;

  const isRemoveBg = Boolean(
    asset.isRemoveBg || asset.tool === 'remove-background' || asset.model === 'remove-background'
  );
  const isUpscale = Boolean(
    !isRemoveBg && (asset.isUpscale || asset.tool === 'upscale-image' || asset.model === 'upscale-image')
  );
  const displayPrompt = asset.originalPrompt || asset.prompt || '';
  const modelLabel = asset.modelName || getModelDisplayName(asset.model);
  const ratioLabel = isRemoveBg
    ? 'PNG'
    : isUpscale
      ? 'Upscale'
      : asset.aspectRatio || '1:1';

  return (
    <div
      id="studio-lightbox-modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none transition-opacity duration-200 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      {/* Lightbox Top Navigation Bar */}
      <div
        className="w-full max-w-6xl flex items-center justify-between mb-2 px-2 z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0 pr-4">
          <span
            id="studio-lightbox-counter"
            className="px-2.5 py-0.5 rounded-md bg-white/15 text-[11px] font-mono text-white"
          >
            {currentIndex + 1} / {Math.max(1, list.length)}
          </span>
          <span
            id="studio-lightbox-model"
            className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-slate-200 font-mono"
          >
            {modelLabel}
          </span>
          <span
            id="studio-lightbox-ratio"
            className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-mono text-slate-300"
          >
            {ratioLabel}
          </span>
          <h3
            id="studio-lightbox-title"
            className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md hidden md:inline"
          >
            {isRemoveBg ? 'Remove Background' : isUpscale ? 'Upscale Image' : displayPrompt}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isRemoveBg && (
            <button
              type="button"
              id="studio-lightbox-edit-btn"
              onClick={() => {
                onEditInPreciseEdit(asset);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
              title="Precise Edit"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              <span className="hidden sm:inline">Precise Edit</span>
            </button>
          )}
          <button
            type="button"
            id="studio-lightbox-download-btn"
            onClick={() => onDownload(asset)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
            title="Download image"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            id="studio-lightbox-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
            title="Close preview (Esc)"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lightbox Image Viewport with Next/Prev Arrow Controls */}
      <div
        id="studio-lightbox-backdrop"
        className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden relative"
      >
        {list.length > 1 && onSelectAsset && (
          <button
            type="button"
            id="studio-lightbox-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              const prevIdx = (currentIndex - 1 + list.length) % list.length;
              onSelectAsset(list[prevIdx]);
            }}
            className="absolute left-3 sm:left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            title="Previous variation (Left Arrow)"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {list.length > 1 && onSelectAsset && (
          <button
            type="button"
            id="studio-lightbox-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              const nextIdx = (currentIndex + 1) % list.length;
              onSelectAsset(list[nextIdx]);
            }}
            className="absolute right-3 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            title="Next variation (Right Arrow)"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <div
          id="studio-lightbox-img-frame"
          onClick={(e) => e.stopPropagation()}
          className={
            isRemoveBg
              ? 'p-6 sm:p-10 rounded-2xl transparent-checkerboard-bg bg-white dark:bg-[#141414] shadow-2xl flex items-center justify-center transition-all duration-300'
              : 'flex items-center justify-center transition-all duration-300'
          }
        >
          <img
            id="studio-lightbox-img"
            src={asset.url}
            alt={displayPrompt || 'Preview image'}
            className="max-h-[82vh] max-w-[88vw] w-auto object-contain rounded-xl shadow-2xl transition-all duration-200"
          />
        </div>
      </div>

      {/* Bottom Prompt Caption Overlay */}
      <div className="w-full max-w-4xl px-4 py-2 text-center text-xs text-slate-300 font-medium truncate select-text">
        <span id="studio-lightbox-prompt-caption">{displayPrompt}</span>
      </div>
    </div>
  );
};
