import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AssistantChatTransport } from '@assistant-ui/ai-sdk';
import { useChat } from '@ai-sdk/react';
import {
  ArrowLeft,
  Brain,
  Edit3,
  FileText,
  Folder,
  FolderGit2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  Send,
  Square,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { getAuthHeaders } from '../../lib/auth';
import {
  formatProjectFileSize,
  getProjectFiles,
  getProjectMemory,
  loadProjectChats,
  saveProjectChats,
  saveProjectFiles,
  setProjectMemory,
  type ProjectChatThread,
  type ProjectFileItem,
  type ProjectItem
} from '../../services/projectsStorage';
import { ProjectFilePreviewModal } from './ProjectModals';

interface ProjectDetailViewProps {
  project: ProjectItem;
  onBack: () => void;
  onTogglePin: (id: string) => void;
  onOpenEdit: (project: ProjectItem) => void;
  onOpenDelete: (project: ProjectItem) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onShowToast: (msg: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onTogglePin,
  onOpenEdit,
  onOpenDelete,
  onUpdateInstructions,
  onShowToast
}) => {
  const [activeChat, setActiveChat] = useState<ProjectChatThread | null>(null);
  const [chats, setChats] = useState<ProjectChatThread[]>(() => loadProjectChats(project.id));
  const [files, setFiles] = useState<ProjectFileItem[]>(() => getProjectFiles(project.id));
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => getProjectMemory(project.id));

  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructionsDraft, setInstructionsDraft] = useState(project.instructions || '');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectFileItem | null>(null);

  const [landingInput, setLandingInput] = useState('');
  const [activeInput, setActiveInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const instructionsRef = useRef(project.instructions || '');
  instructionsRef.current = project.instructions || '';

  useEffect(() => {
    setChats(loadProjectChats(project.id));
    setFiles(getProjectFiles(project.id));
    setMemoryEnabled(getProjectMemory(project.id));
    setInstructionsDraft(project.instructions || '');
    setIsEditingInstructions(false);
    setActiveChat(null);
  }, [project.id, project.instructions]);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/chat/ui-stream',
        headers: () => getAuthHeaders(),
        body: () => ({
          model: 'gpt-4o-mini',
          searchMode: 'none',
          projectId: project.id,
          projectInstructions: instructionsRef.current || undefined
        })
      }),
    [project.id]
  );

  const { messages, status, sendMessage, stop, setMessages } = useChat({
    transport
  });

  const isStreaming = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages.length, isStreaming]);

  // Persist streamed messages back to proj_chats_<projectId>
  useEffect(() => {
    if (!activeChat || isStreaming || messages.length === 0) return;
    const mapped = messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('\n'),
      createdAt: new Date().toISOString()
    }));
    setChats((prev) => {
      const next = prev.map((c) => (c.id === activeChat.id ? { ...c, messages: mapped } : c));
      saveProjectChats(project.id, next);
      return next;
    });
  }, [isStreaming, messages, activeChat, project.id]);

  const handleOpenChat = (chat: ProjectChatThread) => {
    setActiveChat(chat);
    setMessages(
      (chat.messages || []).map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text' as const, text: m.content }]
      }))
    );
  };

  const handleStartNewChat = async () => {
    const trimmed = landingInput.trim();
    if (!trimmed || isStreaming) return;

    const newThread: ProjectChatThread = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed.length > 50 ? `${trimmed.slice(0, 50)}…` : trimmed,
      projectId: project.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: trimmed,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    const nextChats = [newThread, ...chats];
    setChats(nextChats);
    saveProjectChats(project.id, nextChats);
    setLandingInput('');
    setActiveChat(newThread);
    setMessages([]);
    await sendMessage({ text: trimmed });
  };

  const handleSendFollowUp = async () => {
    const trimmed = activeInput.trim();
    if (!trimmed || isStreaming) return;
    setActiveInput('');
    await sendMessage({ text: trimmed });
  };

  const handleDeleteChat = (chatId: string) => {
    const next = chats.filter((c) => c.id !== chatId);
    setChats(next);
    saveProjectChats(project.id, next);
    if (activeChat?.id === chatId) setActiveChat(null);
    onShowToast('Chat deleted');
  };

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const item: ProjectFileItem = {
          id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: file.type.startsWith('image/') ? result : undefined,
          textContent: !file.type.startsWith('image/') && result.length < 200000 ? result : undefined,
          addedAt: new Date().toISOString()
        };
        setFiles((prev) => {
          const next = [item, ...prev];
          saveProjectFiles(project.id, next);
          return next;
        });
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    onShowToast('File(s) added to project');
  };

  const totalMessagesCount = useMemo(
    () => chats.reduce((acc, c) => acc + (c.messages?.length || 0), 0),
    [chats]
  );

  return (
    <div id="project-detail-view" className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
      {!activeChat ? (
        /* ── LANDING VIEW ── */
        <div id="project-landing-view" className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Breadcrumb */}
          <div className="px-8 md:px-10 py-2.5 border-b border-slate-100 dark:border-neutral-800 shrink-0 flex items-center">
            <button
              type="button"
              id="btn-back-to-projects"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Projects</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-w-0">
            {/* Left Content */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#191919]">
              <div className="max-w-2xl mx-auto px-8 pt-5 pb-12">
                {/* Title Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2
                          id="project-detail-title"
                          className="text-xl font-bold text-slate-900 tracking-tight truncate"
                        >
                          {project.name}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                          Centralize instructions, knowledge files, and chat sessions for this
                          workspace.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      <button
                        type="button"
                        id="btn-project-pin"
                        onClick={() => onTogglePin(project.id)}
                        title={project.isPinned ? 'Unpin project' : 'Pin project'}
                        className={
                          project.isPinned
                            ? 'p-2 rounded-xl text-blue-600 bg-blue-50/80 border border-blue-200 shadow-2xs transition-colors cursor-pointer'
                            : 'p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100'
                        }
                      >
                        <Pin className={`w-4 h-4 ${project.isPinned ? 'fill-blue-600' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsHeaderMenuOpen((p) => !p)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        aria-label="Project options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isHeaderMenuOpen && (
                        <div
                          id="project-header-dropdown"
                          className="absolute right-0 top-10 z-30 w-40 bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-neutral-700 shadow-lg py-1 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsHeaderMenuOpen(false);
                              onOpenEdit(project);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 text-left"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit project</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsHeaderMenuOpen(false);
                              onOpenDelete(project);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Prompt Composer */}
                <div className="mb-8 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-[#202020] p-4 shadow-xs">
                  <textarea
                    id="project-chat-input"
                    rows={2}
                    value={landingInput}
                    onChange={(e) => setLandingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleStartNewChat();
                      }
                    }}
                    placeholder={`New chat in ${project.name}...`}
                    className="w-full resize-none border-0 outline-none focus:ring-0 bg-transparent text-sm text-slate-800 dark:text-neutral-100 placeholder-slate-400"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800 mt-2">
                    <span className="text-[11px] text-slate-400">
                      Scoped with project instructions
                    </span>
                    <button
                      type="button"
                      disabled={!landingInput.trim() || isStreaming}
                      onClick={handleStartNewChat}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Start chat</span>
                    </button>
                  </div>
                </div>

                {/* Project Chats List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Project Chats ({chats.length})
                  </h3>

                  {chats.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 p-8 text-center">
                      <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                        No chats in this project yet
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ask a question above to start an organized chat thread in this workspace.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => handleOpenChat(chat)}
                          className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-slate-300 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 dark:text-neutral-100 truncate">
                                {chat.title || 'Project Chat'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {chat.messages?.length || 0} messages
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            aria-label="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Instructions, Files & Memory */}
            <div
              id="project-instructions-panel"
              className="w-full md:w-[285px] border-t md:border-t-0 md:border-l border-[#EBEBEB] flex flex-col h-auto md:h-full shrink-0 overflow-y-auto"
            >
              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Instructions Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      Instructions
                    </span>
                    <div className="flex items-center gap-1">
                      {!isEditingInstructions ? (
                        <button
                          type="button"
                          id="btn-edit-instructions"
                          onClick={() => setIsEditingInstructions(true)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Guidelines"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          id="btn-save-instructions"
                          onClick={() => {
                            onUpdateInstructions(project.id, instructionsDraft);
                            setIsEditingInstructions(false);
                            onShowToast('Instructions saved');
                          }}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
                    Custom instructions tailor every model&apos;s responses inside this project.
                  </p>
                  <textarea
                    id="project-instructions-textarea"
                    readOnly={!isEditingInstructions}
                    rows={4}
                    value={instructionsDraft}
                    onChange={(e) => setInstructionsDraft(e.target.value)}
                    placeholder="No instructions set yet. Click edit to add guidelines..."
                    className={`w-full text-xs text-slate-700 dark:text-neutral-200 placeholder-slate-400 leading-relaxed rounded-xl transition-all bg-transparent ${
                      isEditingInstructions
                        ? 'border border-blue-400 p-2 outline-none'
                        : 'border-0 outline-none resize-none'
                    }`}
                  />
                </div>

                {/* Files Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-500" />
                      Files
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    Drop briefs, docs, and code referenced across chats.
                  </p>
                  <div
                    id="project-files-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFilesAdded(e.dataTransfer.files);
                    }}
                    className="project-panel-dropzone p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 group-hover:text-blue-600 mx-auto mb-2 transition-all shadow-2xs">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-neutral-200">
                      Add document, text or PDF
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Drag &amp; drop or click to upload
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="project-panel-file-input"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      handleFilesAdded(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  {files.length > 0 && (
                    <div id="project-uploaded-files-list" className="flex flex-col gap-1.5 mt-2.5">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setPreviewFile(f)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-700 dark:text-neutral-200 truncate">
                              {f.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatProjectFileSize(f.size)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = files.filter((x) => x.id !== f.id);
                              setFiles(next);
                              saveProjectFiles(project.id, next);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            aria-label={`Remove ${f.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Memory & Stats Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="project-account-memory-toggle"
                      className="text-xs font-semibold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5 text-blue-500" />
                      Account Memory
                    </label>
                    <button
                      type="button"
                      id="project-account-memory-toggle"
                      role="switch"
                      aria-checked={memoryEnabled}
                      onClick={() => {
                        const next = !memoryEnabled;
                        setMemoryEnabled(next);
                        setProjectMemory(project.id, next);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        memoryEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          memoryEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p
                    id="project-account-memory-subtext"
                    className="text-[11px] text-slate-400 leading-relaxed mb-3"
                  >
                    {memoryEnabled
                      ? 'Account memory is enabled for this project.'
                      : 'Account memory is off. Turning this on enables it for your account too.'}
                  </p>
                  <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span>Created</span>
                      <span className="font-medium text-slate-700 dark:text-neutral-200">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Messages</span>
                      <span className="font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-100/60 dark:border-blue-900">
                        {totalMessagesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── ACTIVE CHAT VIEW ── */
        <div
          id="project-active-chat-view"
          className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-white dark:bg-[#191919]"
        >
          <div className="px-8 md:px-10 py-2.5 border-b border-slate-100 dark:border-neutral-800 shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              id="btn-back-to-project-landing"
              onClick={() => setActiveChat(null)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span id="breadcrumb-project-name">{project.name}</span>
            </button>
            <span className="text-slate-300 text-xs">·</span>
            <span
              id="breadcrumb-chat-title"
              className="text-xs text-slate-700 dark:text-neutral-200 font-medium truncate max-w-[260px]"
            >
              {activeChat.title}
            </span>
          </div>

          <div
            id="project-chat-messages"
            className="w-full flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 min-h-0 max-w-3xl mx-auto"
          >
            {messages.map((m) => {
              const text = m.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('\n');
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100'
                        : 'text-slate-800 dark:text-neutral-100'
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 px-4 pb-3 pt-2 w-full" id="project-composer-bar-wrapper">
            <div
              id="project-active-composer-inner"
              className="w-full max-w-2xl mx-auto bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-[#2e2e2e] shadow-sm p-3 flex items-end gap-2"
            >
              <textarea
                id="project-active-chat-input"
                rows={1}
                value={activeInput}
                onChange={(e) => setActiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendFollowUp();
                  }
                }}
                placeholder="Ask a follow-up..."
                className="flex-1 resize-none border-0 outline-none focus:ring-0 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 text-sm bg-transparent leading-snug min-h-[24px]"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="p-2 rounded-xl bg-slate-900 text-white"
                  aria-label="Stop"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!activeInput.trim()}
                  onClick={handleSendFollowUp}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ProjectFilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};
