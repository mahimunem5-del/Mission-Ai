import React, { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, MessageSquare, Search, SquarePen } from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import { useChatSession } from '../../context/ChatSessionContext';

export const CommandPaletteModal: React.FC = () => {
  const { isSearchModalOpen, setSearchModalOpen, navigateToWorkspace } = useAppShell();
  const { conversations, selectConversation, createNewChat } = useChatSession();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isSearchModalOpen) {
      setQuery('');
      return;
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchModalOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations.slice(0, 20);
    return conversations.filter((c) => (c.title || 'New Chat').toLowerCase().includes(q));
  }, [conversations, query]);

  if (!isSearchModalOpen) return null;

  return (
    <div
      id="chat-search-modal-overlay"
      onClick={() => setSearchModalOpen(false)}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-start justify-center pt-20 px-4"
    >
      <div
        id="chat-search-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[740px] min-h-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-slate-100 dark:border-neutral-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            id="command-palette-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-base text-slate-800 dark:text-neutral-100 placeholder-slate-400 font-normal focus:ring-0 p-0"
            placeholder="Search chats..."
            autoComplete="off"
          />
        </div>

        <div
          id="command-palette-results"
          className="command-palette-results flex-1 max-h-[420px] overflow-y-auto p-2.5 space-y-1"
        >
          <button
            type="button"
            onClick={() => {
              navigateToWorkspace('chat');
              createNewChat();
              setSearchModalOpen(false);
            }}
            className="command-palette-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <SquarePen className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">Start a new chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigateToWorkspace('images');
              setSearchModalOpen(false);
            }}
            className="command-palette-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">Open Images Studio</span>
          </button>

          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => {
                navigateToWorkspace('chat');
                selectConversation(conv.id);
                setSearchModalOpen(false);
              }}
              className="command-palette-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{conv.title || 'New Chat'}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No matching conversations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
