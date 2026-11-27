import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { useChatSession } from '../../context/ChatSessionContext';
import { useAppShell } from '../../context/AppShellContext';
import { useI18n } from '../../context/I18nContext';
import type { ConversationSummary } from '../../types/universal';

export const RecentChatsList: React.FC = () => {
  const {
    conversations,
    activeConvId,
    isLoadingHistory,
    pinnedIds,
    togglePinConversation,
    sortMode,
    selectConversation,
    deleteConversationById,
    renameConversationLocal
  } = useChatSession();
  const { navigateToWorkspace } = useAppShell();
  const { t } = useI18n();

  const [menuTarget, setMenuTarget] = useState<{
    conv: ConversationSummary;
    top: number;
    left: number;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const sortedConversations = useMemo(() => {
    const pinnedSet = new Set(pinnedIds);
    const list = [...conversations];
    list.sort((a, b) => {
      const aPinned = pinnedSet.has(a.id);
      const bPinned = pinnedSet.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      if (sortMode === 'alpha') {
        return (a.title || 'New Chat').localeCompare(b.title || 'New Chat');
      }
      return 0;
    });
    return list;
  }, [conversations, pinnedIds, sortMode]);

  useEffect(() => {
    if (!menuTarget) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuTarget(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuTarget(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuTarget]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, conv: ConversationSummary) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuTarget({
      conv,
      top: Math.min(rect.bottom + 4, window.innerHeight - 160),
      left: Math.min(rect.left, window.innerWidth - 190)
    });
  };

  const commitRename = (id: string) => {
    if (renameDraft.trim()) {
      renameConversationLocal(id, renameDraft.trim());
    }
    setRenamingId(null);
  };

  if (isLoadingHistory) {
    return (
      <div id="recent-chats-list" className="recent-chats-list flex-1 overflow-y-auto space-y-0.5 pr-1 mt-1">
        <div className="px-3 py-2 text-xs text-slate-400">Loading...</div>
      </div>
    );
  }

  if (sortedConversations.length === 0) {
    return (
      <div id="recent-chats-list" className="recent-chats-list flex-1 overflow-y-auto space-y-0.5 pr-1 mt-1">
        <div className="px-3 py-2 text-xs text-slate-400">
          {t('nav.noRecents', 'No recent chats yet')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        id="recent-chats-list"
        className="recent-chats-list flex-1 overflow-y-auto space-y-0.5 pr-1 mt-1"
      >
        {sortedConversations.map((conv) => {
          const isActive = conv.id === activeConvId;
          const isPinned = pinnedIds.includes(conv.id);

          if (renamingId === conv.id) {
            return (
              <div key={conv.id} className="px-2 py-1">
                <input
                  type="text"
                  autoFocus
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => commitRename(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(conv.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            );
          }

          return (
            <div
              key={conv.id}
              data-chat-id={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                navigateToWorkspace('chat');
                selectConversation(conv.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToWorkspace('chat');
                  selectConversation(conv.id);
                }
              }}
              className={`chat-item group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors relative cursor-pointer ${
                isActive
                  ? 'bg-slate-200/70 text-slate-900 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isPinned && <Pin className="w-3 h-3 text-slate-400 shrink-0" />}
                <span className="truncate text-sm chat-title-text">
                  {conv.title || 'New Chat'}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleOpenMenu(e, conv)}
                className="chat-item-menu-trigger opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-opacity shrink-0"
                aria-label={`Actions for ${conv.title || 'chat'}`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Context Menu */}
      {menuTarget && (
        <div
          ref={menuRef}
          id="chat-item-context-menu"
          style={{ top: menuTarget.top, left: menuTarget.left }}
          className="fixed z-[9999] w-44 bg-white rounded-xl border border-slate-200/90 shadow-lg ring-1 ring-black/5 py-1 text-xs select-none"
        >
          <button
            type="button"
            id="menu-action-pin"
            onClick={() => {
              togglePinConversation(menuTarget.conv.id);
              setMenuTarget(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
          >
            {pinnedIds.includes(menuTarget.conv.id) ? (
              <>
                <PinOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Unpin</span>
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Pin</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="menu-action-rename"
            onClick={() => {
              setRenamingId(menuTarget.conv.id);
              setRenameDraft(menuTarget.conv.title || 'New Chat');
              setMenuTarget(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Rename</span>
          </button>

          <div className="border-t border-slate-100 dark:border-neutral-800 my-1" />

          <button
            type="button"
            id="menu-action-delete"
            onClick={() => {
              setDeleteTarget(menuTarget.conv);
              setMenuTarget(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          id="recent-chat-delete-modal"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-neutral-100">
                Delete chat?
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                This will delete{' '}
                <span className="font-medium text-slate-800 dark:text-neutral-200">
                  {deleteTarget.title || 'New Chat'}
                </span>
                . This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConversationById(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
