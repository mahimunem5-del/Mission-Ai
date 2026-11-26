import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AssistantRuntimeProvider,
  useAuiState,
  type AssistantRuntime
} from '@assistant-ui/react';
import { AssistantChatTransport, useAISDKRuntime } from '@assistant-ui/ai-sdk';
import { useChat, type UIMessage } from '@ai-sdk/react';
import {
  Check,
  Copy,
  Globe,
  KeyRound,
  Menu,
  Mic,
  MicOff,
  Paperclip,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Wrench,
  X
} from 'lucide-react';
import {
  createConversation,
  deleteConversation,
  extractFileContent,
  fetchModelsCatalog,
  fetchToolsCatalog,
  listConversations,
  mapRestoredToUniversalMessages,
  restoreConversation,
  saveMessage,
  transcribeAudio
} from '../lib/apiClient';
import { getAuthHeaders, getAuthToken, sanitizeClientError, setAuthToken } from '../lib/auth';
import {
  threadMessageToUniversalMessage,
  universalToUIMessage
} from '../adapters/uiMessageMapper';
import {
  extractTextFromParts,
  type ChatMode,
  type ConversationSummary,
  type ModelCatalogItem,
  type SearchMode,
  type ToolCatalogItem,
  type UniversalMessage
} from '../types/universal';
import { Sidebar } from './Sidebar';
import { UniversalMessageRenderer } from './UniversalMessageRenderer';

const MODE_HINTS: Record<ChatMode, string> = {
  general: '',
  coding: 'Focus on clean, production-grade code, edge cases, and concise technical explanations.',
  reasoning: 'Think step by step, verify assumptions, and present clear structured reasoning.'
};

interface InnerWorkspaceProps {
  runtime: AssistantRuntime;
  setSdkMessages: (messages: UIMessage[]) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  chatMode: ChatMode;
  setChatMode: (m: ChatMode) => void;
  searchMode: SearchMode;
  setSearchMode: React.Dispatch<React.SetStateAction<SearchMode>>;
  toolsCatalog: ToolCatalogItem[];
  selectedTools: string[];
  setSelectedTools: React.Dispatch<React.SetStateAction<string[]>>;
  models: ModelCatalogItem[];
  conversations: ConversationSummary[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;
  activeConvId: string | null;
  setActiveConvId: (id: string | null) => void;
  isLoadingHistory: boolean;
  authRequired: boolean;
  setAuthRequired: (v: boolean) => void;
  workspaceError: string | null;
  setWorkspaceError: (err: string | null) => void;
  onReloadData: () => void;
}

const InnerChatWorkspace: React.FC<InnerWorkspaceProps> = ({
  runtime,
  setSdkMessages,
  selectedModel,
  setSelectedModel,
  chatMode,
  setChatMode,
  searchMode,
  setSearchMode,
  toolsCatalog,
  selectedTools,
  setSelectedTools,
  models,
  conversations,
  setConversations,
  activeConvId,
  setActiveConvId,
  isLoadingHistory,
  authRequired,
  setAuthRequired,
  workspaceError,
  setWorkspaceError,
  onReloadData
}) => {
  const threadRuntime = runtime.thread;
  const threadMessages = useAuiState((s) => s.thread.messages);
  const isStreaming = useAuiState((s) => s.thread.isRunning);

  const [input, setInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<
    Array<{ fileName: string; mimeType: string; sizeBytes: number; extractedText: string }>
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [restoredOverlays, setRestoredOverlays] = useState<Record<string, UniversalMessage>>({});

  const activeModelMeta = useMemo(
    () => models.find((m) => (m.openRouterModel || m.id) === selectedModel),
    [models, selectedModel]
  );
  const modelSupportsTools = Boolean(activeModelMeta?.capabilities?.tools);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const persistedIdsRef = useRef<Set<string>>(new Set());
  const sendingLockRef = useRef(false);

  useEffect(() => {
    if (!isToolsMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsToolsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isToolsMenuOpen]);

  const universalMessages = useMemo(
    () =>
      threadMessages.map((tm) =>
        threadMessageToUniversalMessage(tm, activeConvId || 'draft', restoredOverlays[tm.id])
      ),
    [threadMessages, activeConvId, restoredOverlays]
  );

  // Persist completed or interrupted assistant messages once streaming settles
  useEffect(() => {
    if (isStreaming || !activeConvId || universalMessages.length === 0) return;
    const last = universalMessages[universalMessages.length - 1];
    if (last.role !== 'assistant' || persistedIdsRef.current.has(last.id)) return;
    const rawText = extractTextFromParts(last.parts);
    if (!rawText && last.parts.length === 0) return;

    persistedIdsRef.current.add(last.id);
    saveMessage(activeConvId, {
      id: last.id,
      role: 'assistant',
      content: rawText,
      type: 'text',
      metadata: { ...last.metadata, status: last.status },
      parts: last.parts
    }).catch(() => {});
  }, [isStreaming, activeConvId, universalMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [universalMessages.length, isStreaming]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (isStreaming) threadRuntime.cancelRun();
      setActiveConvId(id);
      setIsLoadingThread(true);
      setWorkspaceError(null);
      try {
        const restored = await restoreConversation(id);
        if (restored) {
          const mapped = mapRestoredToUniversalMessages(restored);
          const overlayMap: Record<string, UniversalMessage> = {};
          for (const m of mapped) {
            overlayMap[m.id] = m;
            persistedIdsRef.current.add(m.id);
          }
          setRestoredOverlays(overlayMap);
          setSdkMessages(mapped.map(universalToUIMessage));
          if (restored.model_id) setSelectedModel(restored.model_id);
        } else {
          setRestoredOverlays({});
          setSdkMessages([]);
        }
      } catch (err: any) {
        setWorkspaceError(sanitizeClientError(err?.message || 'Failed to restore conversation'));
      } finally {
        setIsLoadingThread(false);
      }
    },
    [isStreaming, setActiveConvId, setSdkMessages, setSelectedModel, setWorkspaceError, threadRuntime]
  );

  const handleNewChat = useCallback(() => {
    if (isStreaming) threadRuntime.cancelRun();
    setActiveConvId(null);
    setRestoredOverlays({});
    persistedIdsRef.current.clear();
    setSdkMessages([]);
    setPendingAttachments([]);
    setWorkspaceError(null);
  }, [isStreaming, setActiveConvId, setSdkMessages, setWorkspaceError, threadRuntime]);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConvId === id) {
          handleNewChat();
        }
      } catch (err: any) {
        setWorkspaceError(sanitizeClientError(err?.message || 'Failed to delete conversation'));
      }
    },
    [activeConvId, handleNewChat, setConversations, setWorkspaceError]
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isStreaming || sendingLockRef.current) return;
    sendingLockRef.current = true;
    setWorkspaceError(null);

    let convId = activeConvId;
    try {
      if (!convId) {
        const created = await createConversation({
          title: trimmed.slice(0, 60) || 'New Chat',
          model_id: selectedModel,
          mode: chatMode
        });
        convId = created.id;
        setActiveConvId(convId);
        setConversations((prev) => [created, ...prev]);
      }

      const attachmentContext = pendingAttachments
        .map((a) => `\n\n[Attached File: ${a.fileName}]\n${a.extractedText}`)
        .join('');
      const fullContent = `${trimmed}${attachmentContext}`.trim() || '[Attached file(s)]';

      const userMsgId = crypto.randomUUID();
      persistedIdsRef.current.add(userMsgId);

      setInput('');
      setPendingAttachments([]);

      await saveMessage(convId, {
        id: userMsgId,
        role: 'user',
        content: trimmed || '[Attached file(s)]',
        type: 'text',
        parts: [{ partIndex: 0, partType: 'text', payload: { text: trimmed || '[Attached file(s)]' } }],
        attachments: pendingAttachments.map((a) => ({
          file_name: a.fileName,
          mime_type: a.mimeType,
          size_bytes: a.sizeBytes
        }))
      });

      threadRuntime.append({
        role: 'user',
        content: [{ type: 'text', text: fullContent }]
      });
    } catch (err: any) {
      if (err?.status === 401) setAuthRequired(true);
      setWorkspaceError(sanitizeClientError(err?.message || 'Failed to send message'));
    } finally {
      sendingLockRef.current = false;
    }
  }, [
    activeConvId,
    chatMode,
    input,
    isStreaming,
    pendingAttachments,
    selectedModel,
    setActiveConvId,
    setAuthRequired,
    setConversations,
    setWorkspaceError,
    threadRuntime
  ]);

  const handleStop = useCallback(() => {
    threadRuntime.cancelRun();
  }, [threadRuntime]);

  const handleRegenerate = useCallback(() => {
    if (isStreaming || threadMessages.length === 0) return;
    const lastUser = [...threadMessages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    threadRuntime.startRun({ parentId: lastUser.id, sourceId: null });
  }, [isStreaming, threadMessages, threadRuntime]);

  const handleCopy = useCallback(async (msg: UniversalMessage) => {
    const text = extractTextFromParts(msg.parts);
    if (!text) return;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        copied = false;
      }
    }
    if (copied) {
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId((prev) => (prev === msg.id ? null : prev)), 1500);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        const extractedText = await extractFileContent(dataUrl, file.name, file.type);
        setPendingAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            extractedText
          }
        ]);
      } catch (err: any) {
        setWorkspaceError(sanitizeClientError(err?.message || 'File extraction failed'));
      }
    },
    [setWorkspaceError]
  );

  const handleToggleMic = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setWorkspaceError('Microphone recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = String(reader.result || '').split(',')[1] || '';
          if (!base64) return;
          try {
            const text = await transcribeAudio(base64, blob.type || 'audio/webm');
            if (text) setInput((prev) => (prev ? `${prev} ${text}` : text));
          } catch (err: any) {
            setWorkspaceError(sanitizeClientError(err?.message || 'Transcription failed'));
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setWorkspaceError('Microphone permission denied.');
    }
  }, [isRecording, setWorkspaceError]);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthToken(tokenInput.trim() || null);
    setTokenInput('');
    onReloadData();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        isLoading={isLoadingHistory}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelect={(id) => {
          setIsMobileSidebarOpen(false);
          handleSelectConversation(id);
        }}
        onNewChat={() => {
          setIsMobileSidebarOpen(false);
          handleNewChat();
        }}
        onDelete={handleDeleteConversation}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 md:gap-3 md:px-5">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <label className="sr-only" htmlFor="model-select">
              Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isStreaming}
              className="max-w-[170px] truncate rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-foreground sm:max-w-none"
            >
              {models.length === 0 ? (
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              ) : (
                models.map((m) => (
                  <option key={m.id} value={m.openRouterModel || m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))
              )}
            </select>

            <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              {(['general', 'coding', 'reasoning'] as ChatMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChatMode(mode)}
                  className={`rounded px-2.5 py-1 capitalize transition-colors ${
                    chatMode === mode
                      ? 'bg-background font-medium text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsToolsMenuOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors ${
                isToolsMenuOpen || (modelSupportsTools && selectedTools.length > 0)
                  ? 'border-foreground/40 bg-muted/60 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Toggle tools menu"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>
                Tools{modelSupportsTools ? ` (${selectedTools.length})` : ' (Off)'}
              </span>
            </button>

            {isToolsMenuOpen && (
              <div className="absolute right-0 top-10 z-30 w-72 rounded-xl border border-border bg-background p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-semibold text-foreground">Unified AI Tools</span>
                  <button
                    type="button"
                    onClick={() => setIsToolsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close tools menu"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {!modelSupportsTools && (
                  <div className="mb-2 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                    Selected model does not support tool calling. Select GPT-4o Mini, GPT-4o, or o3-mini to use tools.
                  </div>
                )}
                <div className="max-h-60 space-y-1.5 overflow-y-auto">
                  {toolsCatalog.map((toolItem) => {
                    const checked = selectedTools.includes(toolItem.name);
                    const disabled = !toolItem.implemented || toolItem.status !== 'active' || !modelSupportsTools;
                    return (
                      <label
                        key={toolItem.name}
                        className={`flex items-start justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11px] ${
                          disabled ? 'opacity-60' : 'cursor-pointer hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checked && toolItem.implemented && modelSupportsTools}
                            disabled={disabled}
                            onChange={() => {
                              setSelectedTools((prev) =>
                                prev.includes(toolItem.name)
                                  ? prev.filter((t) => t !== toolItem.name)
                                  : [...prev, toolItem.name]
                              );
                            }}
                            className="mt-0.5"
                          />
                          <div>
                            <div className="font-medium text-foreground">{toolItem.displayName}</div>
                            <div className="text-[10px] text-muted-foreground">{toolItem.category}</div>
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">
                          {toolItem.implemented ? toolItem.status : toolItem.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSearchMode((m) => (m === 'web-search' ? 'none' : 'web-search'))}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors ${
                searchMode === 'web-search'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Web Search</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchMode((m) => (m === 'deep-research' ? 'none' : 'deep-research'))}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors ${
                searchMode === 'deep-research'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deep Research</span>
            </button>
          </div>
        </header>

        {authRequired && (
          <form
            onSubmit={handleSaveToken}
            className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-2.5 text-xs"
          >
            <div className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>Authentication required. Paste a valid Bearer session token to continue:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Bearer JWT token"
                className="w-64 rounded border border-border bg-background px-2.5 py-1 text-xs"
              />
              <button
                type="submit"
                className="rounded bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                Connect
              </button>
            </div>
          </form>
        )}

        {workspaceError && (
          <div className="flex items-center justify-between border-b border-red-200 bg-red-50 px-5 py-2 text-xs text-red-700">
            <span>{workspaceError}</span>
            <button type="button" onClick={() => setWorkspaceError(null)} aria-label="Dismiss error">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {isLoadingThread ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Restoring conversation...
              </div>
            ) : universalMessages.length === 0 ? (
              <div className="py-20 text-center">
                <h1 className="text-lg font-semibold text-foreground">Mestrio Universal Chat</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Powered by Vercel AI SDK v7 &amp; assistant-ui. Ask a question, attach a file, or
                  enable Web Search / Deep Research.
                </p>
              </div>
            ) : (
              universalMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isLastAssistant = !isUser && idx === universalMessages.length - 1;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${
                      idx > 0 ? 'border-t border-border/40 pt-6' : ''
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
                            M
                          </span>
                          <span>Mestrio AI</span>
                        </span>
                        {msg.metadata.resolvedModel && (
                          <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
                            {msg.metadata.resolvedModel}
                          </span>
                        )}
                        {msg.metadata.provider && (
                          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {msg.metadata.provider}
                          </span>
                        )}
                        {msg.status === 'streaming' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                            <span>Responding</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={
                        isUser
                          ? 'max-w-[85%] rounded-2xl border border-border bg-muted/60 px-4 py-2.5 text-sm text-foreground sm:max-w-[80%]'
                          : 'w-full text-foreground'
                      }
                    >
                      <UniversalMessageRenderer message={msg} />
                    </div>

                    {!isUser && msg.status !== 'streaming' && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {isLastAssistant && (
                          <button
                            type="button"
                            onClick={handleRegenerate}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Regenerate response"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Regenerate</span>
                          </button>
                        )}
                        {msg.metadata.provider && (
                          <span className="ml-1 text-[11px] text-muted-foreground">
                            {msg.metadata.provider}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border bg-background px-4 py-3">
          <div className="mx-auto max-w-3xl">
            {pendingAttachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {pendingAttachments.map((att, idx) => (
                  <span
                    key={`${att.fileName}-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs"
                  >
                    <span className="max-w-[160px] truncate">{att.fileName}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label={`Remove ${att.fileName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:ring-1 focus-within:ring-foreground">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message Mestrio AI..."
                className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              <button
                type="button"
                onClick={handleToggleMic}
                disabled={isStreaming}
                className={`rounded-lg p-2 transition-colors disabled:opacity-40 ${
                  isRecording
                    ? 'bg-red-100 text-red-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start voice transcription'}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                  aria-label="Stop generation"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() && pendingAttachments.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Auth: {getAuthToken() ? 'Session token active' : 'Dev / unauthenticated'}</span>
              <span>Press Enter to send, Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ChatWorkspace: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [models, setModels] = useState<ModelCatalogItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [searchMode, setSearchMode] = useState<SearchMode>('none');
  const [toolsCatalog, setToolsCatalog] = useState<ToolCatalogItem[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const modelRef = useRef(selectedModel);
  const searchModeRef = useRef(searchMode);
  const chatModeRef = useRef(chatMode);
  const selectedToolsRef = useRef(selectedTools);
  modelRef.current = selectedModel;
  searchModeRef.current = searchMode;
  chatModeRef.current = chatMode;
  selectedToolsRef.current = selectedTools;

  const loadInitialData = useCallback(async () => {
    setIsLoadingHistory(true);
    setWorkspaceError(null);
    try {
      const [catalog, toolsList] = await Promise.all([
        fetchModelsCatalog(),
        fetchToolsCatalog().catch(() => [])
      ]);
      setModels(catalog);
      setToolsCatalog(toolsList);
      setSelectedTools(
        toolsList
          .filter((t) => t.implemented && t.status === 'active' && t.enabledByDefault)
          .map((t) => t.name)
      );
      if (catalog.length > 0) {
        const preferred =
          catalog.find((m) => m.id === 'gpt-4o-mini') ||
          catalog.find((m) => m.provider === 'openai' && !m.isLocked) ||
          catalog[0];
        if (preferred) setSelectedModel(preferred.openRouterModel || preferred.id);
      }
      const convs = await listConversations(50);
      setConversations(convs);
      setAuthRequired(false);
    } catch (err: any) {
      if (err?.status === 401) setAuthRequired(true);
      else setWorkspaceError(sanitizeClientError(err?.message || 'Failed to load workspace data'));
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/chat/ui-stream',
        headers: () => getAuthHeaders(),
        body: () => ({
          model: modelRef.current,
          searchMode: searchModeRef.current,
          enabledTools: selectedToolsRef.current,
          ...(MODE_HINTS[chatModeRef.current] ? { systemPrompt: MODE_HINTS[chatModeRef.current] } : {})
        })
      }),
    []
  );

  const chatHelpers = useChat({
    transport,
    onError: (err) => {
      const msg = sanitizeClientError(err?.message || 'Streaming error');
      if (msg.toLowerCase().includes('authentication') || msg.includes('401')) {
        setAuthRequired(true);
      }
      setWorkspaceError(msg);
    }
  });

  const runtime = useAISDKRuntime(chatHelpers);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <InnerChatWorkspace
        runtime={runtime}
        setSdkMessages={chatHelpers.setMessages}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        chatMode={chatMode}
        setChatMode={setChatMode}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        toolsCatalog={toolsCatalog}
        selectedTools={selectedTools}
        setSelectedTools={setSelectedTools}
        models={models}
        conversations={conversations}
        setConversations={setConversations}
        activeConvId={activeConvId}
        setActiveConvId={setActiveConvId}
        isLoadingHistory={isLoadingHistory}
        authRequired={authRequired}
        setAuthRequired={setAuthRequired}
        workspaceError={workspaceError}
        setWorkspaceError={setWorkspaceError}
        onReloadData={loadInitialData}
      />
    </AssistantRuntimeProvider>
  );
};

export default ChatWorkspace;
