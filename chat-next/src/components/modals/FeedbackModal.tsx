import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';

const CATEGORIES = [
  'Incorrect or incomplete',
  'Not what I asked for',
  'Slow or buggy',
  'Style or tone',
  'Safety or legal concern',
  'Other'
];

export const FeedbackModal: React.FC = () => {
  const { activeModal, openModal } = useAppShell();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const isOpen = activeModal === 'feedback';

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setDetails('');
      return;
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openModal(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, openModal]);

  if (!isOpen) return null;

  return (
    <div
      id="chatgpt-feedback-modal"
      onClick={() => openModal(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-neutral-100">
            Share feedback
          </h3>
          <button
            type="button"
            id="feedback-modal-close-btn"
            onClick={() => openModal(null)}
            className="text-zinc-400 hover:text-zinc-700 w-5 h-5 cursor-pointer flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2" id="feedback-chips-container">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(active ? null : cat)}
                className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 dark:border-neutral-700 text-zinc-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <textarea
          id="feedback-details-textarea"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Share details (optional)"
          className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-transparent text-xs text-zinc-800 dark:text-neutral-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
        />

        <div className="p-2.5 rounded-lg bg-gray-100/80 dark:bg-neutral-800 text-[11px] text-zinc-500 dark:text-neutral-400 leading-relaxed">
          Your conversation will be included with your feedback to help improve the system.
        </div>

        <button
          type="button"
          id="feedback-modal-submit-btn"
          disabled={!selectedCategory && !details.trim()}
          onClick={() => openModal(null)}
          className="self-end px-4 py-1.5 rounded-full text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
