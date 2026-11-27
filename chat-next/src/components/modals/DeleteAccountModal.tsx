import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { useChatSession } from '../../context/ChatSessionContext';

export const DeleteAccountModal: React.FC = () => {
  const { activeModal, openModal } = useAppShell();
  const { logout } = useAuthProfile();
  const { setConversations, createNewChat } = useChatSession();

  const isOpen = activeModal === 'delete-account';

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openModal(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, openModal]);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    setConversations([]);
    createNewChat();
    try {
      window.localStorage.clear();
    } catch {
      // Ignore
    }
    logout();
    openModal(null);
  };

  return (
    <div
      id="delete-account-modal"
      onClick={() => openModal(null)}
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 flex flex-col"
      >
        <button
          type="button"
          id="delete-account-close-btn"
          onClick={() => openModal(null)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4 shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-2">Delete account?</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Are you sure you want to permanently delete your account? All chats, files, and project
          assets will be cleared.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <button
            type="button"
            id="delete-account-cancel-btn"
            onClick={() => openModal(null)}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-account-confirm-btn"
            onClick={handleConfirmDelete}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
};
