import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { ConversationSummary } from '../types/universal';

interface SidebarProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  isLoading: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  isLoading,
  isOpenMobile = false,
  onCloseMobile,
  onSelect,
  onNewChat,
  onDelete
}) => {
  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${
          isOpenMobile ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'
        } h-full w-64 shrink-0 flex-col border-r border-border bg-muted/95 backdrop-blur md:static md:flex md:bg-muted/30`}
      >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">Mestrio AI</span>
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          aria-label="New chat"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="px-2 py-4 text-xs text-muted-foreground">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="px-2 py-4 text-xs text-muted-foreground">No saved conversations yet.</div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelect(conv.id)}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-background font-medium text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{conv.title || 'New Chat'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(conv.id)}
                    className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Delete ${conv.title || 'conversation'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
        <a href="/" className="hover:text-foreground hover:underline">
          Switch to Classic Workspace
        </a>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
