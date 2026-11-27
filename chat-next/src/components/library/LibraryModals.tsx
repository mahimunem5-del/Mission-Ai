import React, { useEffect, useState } from 'react';
import { Download, FileText, Sparkles, Star, X } from 'lucide-react';
import {
  downloadLibraryItem,
  formatLibrarySize,
  isImageItem,
  type LibraryItem
} from '../../services/libraryStorage';

interface LibraryPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
}

export const LibraryPromptModal: React.FC<LibraryPromptModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="library-prompt-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Save Prompt Template
              </h3>
              <p className="text-[11px] text-slate-400">
                Add a reusable prompt to your personal library
              </p>
            </div>
          </div>
          <button
            type="button"
            id="library-modal-close-x"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          id="library-prompt-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !content.trim()) return;
            onSave(title.trim(), content.trim());
            onClose();
          }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="library-prompt-name"
              className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
            >
              Prompt Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="library-prompt-name"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., REST API Architecture or Landing Copy"
              required
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-slate-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="library-prompt-content"
              className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
            >
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="library-prompt-content"
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the full prompt text here..."
              className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-slate-400 resize-none transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              id="library-modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Save to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LibraryPreviewModalProps {
  item: LibraryItem | null;
  onClose: () => void;
  onToggleFavourite: (id: string) => void;
}

export const LibraryPreviewModal: React.FC<LibraryPreviewModalProps> = ({
  item,
  onClose,
  onToggleFavourite
}) => {
  useEffect(() => {
    if (!item) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [item, onClose]);

  if (!item) return null;

  const isFav = Boolean(item.isFavorite || item.favourite);
  const badge = item.fileExt || (item.type === 'prompt' ? 'PROMPT' : 'FILE');

  return (
    <div
      id="library-preview-modal"
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] shrink-0">
          <div className="flex items-center gap-3 min-w-0 mr-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-neutral-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="lib-preview-title"
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-neutral-100 truncate"
              >
                {item.name || item.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  id="lib-preview-badge"
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 uppercase"
                >
                  {badge}
                </span>
                <span id="lib-preview-meta" className="text-xs text-slate-400">
                  {formatLibrarySize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="lib-preview-download-btn"
              onClick={() => downloadLibraryItem(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 text-slate-700 dark:text-neutral-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
              title="Download asset"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              id="lib-preview-fav-btn"
              onClick={() => onToggleFavourite(item.id)}
              className={`w-8 h-8 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 flex items-center justify-center transition-all cursor-pointer ${
                isFav ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
              }`}
              title="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              id="lib-preview-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          id="lib-preview-body"
          className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-neutral-50/50 dark:bg-[#191919] min-h-[300px]"
        >
          {isImageItem(item) && item.url ? (
            <img
              src={item.url}
              alt={item.name}
              className="max-h-[60vh] max-w-full rounded-xl shadow-md object-contain"
            />
          ) : item.content ? (
            <pre className="w-full text-xs text-slate-700 dark:text-neutral-200 whitespace-pre-wrap font-mono bg-white dark:bg-[#202020] p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-2xs">
              {item.content}
            </pre>
          ) : (
            <div className="text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs text-slate-400">
                {item.name} ({formatLibrarySize(item.size)})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LibraryDeleteModalProps {
  item: LibraryItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const LibraryDeleteModal: React.FC<LibraryDeleteModalProps> = ({
  item,
  onClose,
  onConfirm
}) => {
  if (!item) return null;

  return (
    <div
      id="library-delete-modal"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-neutral-100 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
            Delete item?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-700 dark:text-neutral-200">
              {item.name || item.title}
            </span>{' '}
            from your library? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            id="lib-delete-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="lib-delete-confirm-btn"
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer shadow-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
