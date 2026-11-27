import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { listConversations } from '../lib/apiClient';
import type { ConversationSummary } from '../types/universal';

export type RecentsSortMode = 'recent' | 'alpha';

interface ChatHandlers {
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

interface ChatSessionContextValue {
  conversations: ConversationSummary[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;
  activeConvId: string | null;
  setActiveConvId: (id: string | null) => void;
  isLoadingHistory: boolean;
  setIsLoadingHistory: (loading: boolean) => void;
  pinnedIds: string[];
  togglePinConversation: (id: string) => void;
  sortMode: RecentsSortMode;
  setSortMode: (mode: RecentsSortMode) => void;
  registerHandlers: (handlers: ChatHandlers) => void;
  selectConversation: (id: string) => void;
  createNewChat: () => void;
  deleteConversationById: (id: string) => void;
  renameConversationLocal: (id: string, title: string) => void;
}

const PINNED_KEY = 'mestrio_pinned_chats';
const CONVERSATIONS_CACHE_KEY = 'mestrio_conversations_cache_v1';

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

export const ChatSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(CONVERSATIONS_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    listConversations(50)
      .then((convs) => {
        if (!mounted) return;
        const list = Array.isArray(convs) ? convs : [];
        setConversations(list);
        try {
          window.localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(list.slice(0, 50)));
        } catch {
          // Ignore quota errors
        }
      })
      .catch(() => {
        // Keep cached conversations if fetch fails
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingHistory(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  const [sortMode, setSortMode] = useState<RecentsSortMode>('recent');
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(PINNED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const handlersRef = useRef<ChatHandlers>({
    onSelectConversation: () => {},
    onNewChat: () => {},
    onDeleteConversation: () => {}
  });

  const registerHandlers = useCallback((handlers: ChatHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const selectConversation = useCallback((id: string) => {
    handlersRef.current.onSelectConversation(id);
  }, []);

  const createNewChat = useCallback(() => {
    handlersRef.current.onNewChat();
  }, []);

  const deleteConversationById = useCallback((id: string) => {
    handlersRef.current.onDeleteConversation(id);
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        window.localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const renameConversationLocal = useCallback((id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: clean } : c)));
  }, []);

  return (
    <ChatSessionContext.Provider
      value={{
        conversations,
        setConversations,
        activeConvId,
        setActiveConvId,
        isLoadingHistory,
        setIsLoadingHistory,
        pinnedIds,
        togglePinConversation,
        sortMode,
        setSortMode,
        registerHandlers,
        selectConversation,
        createNewChat,
        deleteConversationById,
        renameConversationLocal
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};

export function useChatSession(): ChatSessionContextValue {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error('useChatSession must be used inside ChatSessionProvider');
  }
  return ctx;
}
