import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Menu,
  MessageSquare,
  Plus,
  Presentation,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload
} from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import {
  downloadLibraryItem,
  formatLibrarySize,
  getLibraryItemsFromStorage,
  isFileItem,
  isImageItem,
  saveLibraryItemsToStorage,
  type LibraryItem,
  type LibrarySortBy,
  type LibrarySourceFilter,
  type LibraryTab,
  type LibraryViewMode
} from '../../services/libraryStorage';
import {
  LibraryDeleteModal,
  LibraryPreviewModal,
  LibraryPromptModal
} from './LibraryModals';

export const LibraryWorkspace: React.FC = () => {
  const { navigateToWorkspace, setMobileSidebarOpen } = useAppShell();

  const [items, setItems] = useState<LibraryItem[]>(() => getLibraryItemsFromStorage());
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [sourceFilter, setSourceFilter] = useState<LibrarySourceFilter>('all');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('modified');
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const [openMenu, setOpenMenu] = useState<'new' | 'filter' | 'sort' | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const updateItems = (next: LibraryItem[]) => {
    setItems(next);
    saveLibraryItemsToStorage(next);
  };

  const filteredItems = useMemo(() => {
    let list = [...items];

    if (activeTab === 'favourites') {
      list = list.filter((it) => Boolean(it.isFavorite || it.favourite));
    } else if (activeTab === 'images') {
      list = list.filter((it) => isImageItem(it));
    } else if (activeTab === 'files') {
      list = list.filter((it) => isFileItem(it));
    }

    if (sourceFilter === 'uploaded') {
      list = list.filter(
        (it) => it.source === 'uploaded' || (!it.source && it.type !== 'prompt' && !it.isGenerated)
      );
    } else if (sourceFilter === 'generated') {
      list = list.filter(
        (it) => it.source === 'generated' || it.type === 'prompt' || Boolean(it.isGenerated)
      );
    } else if (sourceFilter === 'images') {
      list = list.filter((it) => isImageItem(it));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (it) =>
          (it.name || '').toLowerCase().includes(q) ||
          (it.title || '').toLowerCase().includes(q) ||
          (it.content || '').toLowerCase().includes(q) ||
          (it.fileExt || '').toLowerCase().includes(q) ||
          (Array.isArray(it.tags) && it.tags.some((t) => String(t).toLowerCase().includes(q)))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || a.title || '').localeCompare(b.name || b.title || '');
      }
      if (sortBy === 'size') {
        const sA = Number(a.size) || (a.content ? a.content.length : 0);
        const sB = Number(b.size) || (b.content ? b.content.length : 0);
        return sB - sA;
      }
      const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tB - tA;
    });

    return list;
  }, [items, activeTab, sourceFilter, searchQuery, sortBy]);

  const previewItem = useMemo(
    () => items.find((i) => i.id === previewItemId) || null,
    [items, previewItemId]
  );

  const handleToggleFavourite = (id: string) => {
    const next = items.map((it) => {
      if (it.id !== id) return it;
      const fav = !(it.isFavorite || it.favourite);
      return {
        ...it,
        isFavorite: fav,
        favourite: fav,
        updatedAt: new Date().toISOString()
      };
    });
    updateItems(next);
  };

  const handleSavePrompt = (title: string, content: string) => {
    const now = new Date().toISOString();
    const newItem: LibraryItem = {
      id: `lib_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: title,
      title,
      type: 'prompt',
      source: 'generated',
      content,
      size: content.length,
      isFavorite: false,
      favourite: false,
      createdAt: now,
      updatedAt: now,
      tags: ['prompt']
    };
    updateItems([newItem, ...items]);
    showToast('Prompt saved to library');
  };

  const handleFilesUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const ext = file.name.includes('.')
          ? file.name.split('.').pop()?.toUpperCase() || 'FILE'
          : 'FILE';
        const now = new Date().toISOString();
        const isImg = file.type.startsWith('image/');
        const newItem: LibraryItem = {
          id: `lib_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          title: file.name,
          type: isImg ? 'image' : 'file',
          mimeType: file.type,
          fileExt: ext,
          source: 'uploaded',
          url: isImg ? result : undefined,
          content: !isImg && result.length < 200000 ? result : undefined,
          size: file.size,
          isFavorite: false,
          favourite: false,
          createdAt: now,
          updatedAt: now
        };
        setItems((prev) => {
          const next = [newItem, ...prev];
          saveLibraryItemsToStorage(next);
          return next;
        });
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    showToast('Uploaded to library');
  };

  const handleDeleteItem = (id: string) => {
    updateItems(items.filter((it) => it.id !== id));
    if (previewItemId === id) setPreviewItemId(null);
    showToast('Item deleted');
  };

  return (
    <div
      id="library-workspace"
      className="flex-1 flex flex-col h-full overflow-y-auto min-w-0 bg-white dark:bg-[#191919] px-8 pt-5 pb-8"
    >
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-md border border-slate-200 dark:border-neutral-700 p-1.5 text-slate-600 dark:text-neutral-300"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100">Library</span>
        <div className="w-7" />
      </div>

      <div ref={toolbarRef} className="max-w-6xl w-full mx-auto">
        {/* 1. Header & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Library
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse saved prompts, templates, and generated assets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="library-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-full outline-none focus:border-slate-300 transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="library-search-clear"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* "+ New" Button & Dropdown */}
            <div className="relative" id="library-new-wrapper">
              <button
                type="button"
                id="library-new-btn"
                onClick={() => setOpenMenu(openMenu === 'new' ? null : 'new')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-medium shadow-sm transition-all flex items-center gap-1.5 text-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {openMenu === 'new' && (
                <div
                  id="library-new-dropdown"
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium"
                >
                  <button
                    type="button"
                    id="library-opt-upload-file"
                    onClick={() => {
                      setOpenMenu(null);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>New upload</span>
                  </button>
                  <button
                    type="button"
                    id="library-opt-save-prompt"
                    onClick={() => {
                      setOpenMenu(null);
                      setIsPromptModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Save prompt</span>
                  </button>
                  <button
                    type="button"
                    id="library-opt-new-chat"
                    onClick={() => {
                      setOpenMenu(null);
                      navigateToWorkspace('chat');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>New chat</span>
                  </button>
                  <button
                    type="button"
                    id="library-opt-gen-image"
                    onClick={() => {
                      setOpenMenu(null);
                      navigateToWorkspace('images');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Generate image</span>
                  </button>
                  <button
                    type="button"
                    id="library-opt-slides"
                    onClick={() => {
                      setOpenMenu(null);
                      navigateToWorkspace('slides');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Presentation className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Slides</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                id="library-file-input"
                className="hidden"
                multiple
                accept="*/*"
                onChange={(e) => {
                  handleFilesUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Filter Tabs & View Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" id="library-tabs-list">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'favourites', label: 'Favourites' },
                { id: 'images', label: 'Images' },
                { id: 'files', label: 'Files' }
              ] as Array<{ id: LibraryTab; label: string }>
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`library-tab-btn px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-slate-500">
            {/* Filter Dropdown */}
            <div className="relative" id="library-filter-wrapper">
              <button
                type="button"
                id="library-filter-btn"
                onClick={() => setOpenMenu(openMenu === 'filter' ? null : 'filter')}
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer text-slate-600"
                title="Filter assets"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'filter' && (
                <div
                  id="library-filter-dropdown"
                  className="absolute right-0 top-full mt-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium"
                >
                  <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Filter By
                  </div>
                  {(
                    [
                      { id: 'all', label: 'All Sources' },
                      { id: 'uploaded', label: 'Uploaded' },
                      { id: 'generated', label: 'Generated' },
                      { id: 'images', label: 'Images' }
                    ] as Array<{ id: LibrarySourceFilter; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSourceFilter(opt.id);
                        setOpenMenu(null);
                      }}
                      className="lib-filter-opt w-full flex items-center justify-between px-3.5 py-1.5 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      {sourceFilter === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" id="library-sort-wrapper">
              <button
                type="button"
                id="library-sort-btn"
                onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer text-slate-600"
                title="Sort assets"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'sort' && (
                <div
                  id="library-sort-dropdown"
                  className="absolute right-0 top-full mt-2 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium"
                >
                  <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sort By
                  </div>
                  {(
                    [
                      { id: 'name', label: 'Name' },
                      { id: 'modified', label: 'Modified' },
                      { id: 'size', label: 'Size' }
                    ] as Array<{ id: LibrarySortBy; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setOpenMenu(null);
                      }}
                      className="lib-sort-opt w-full flex items-center justify-between px-3.5 py-1.5 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / List Switcher */}
            <div className="flex items-center p-0.5 border border-slate-200 rounded-full bg-white ml-1">
              <button
                type="button"
                id="library-view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="library-view-list-btn"
                onClick={() => setViewMode('list')}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Empty State / Grid View / List View */}
        {filteredItems.length === 0 ? (
          <div
            id="library-empty-state"
            className="w-full rounded-2xl py-12 px-6 text-center mb-6 flex items-center justify-center"
          >
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-md">
              Nothing here yet. Anything you upload or generate will appear in your library.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            id="library-grid-view"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
          >
            {filteredItems.map((item) => {
              const isFav = Boolean(item.isFavorite || item.favourite);
              const isImg = isImageItem(item);
              const badge = item.fileExt || (item.type === 'prompt' ? 'PROMPT' : 'FILE');

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItemId(item.id)}
                  className="card group relative rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Preview Area */}
                  <div className="h-36 bg-slate-50 dark:bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                    {isImg && item.url ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : item.type === 'prompt' ? (
                      <div className="p-3.5 w-full h-full flex flex-col justify-between bg-gradient-to-br from-purple-50/60 to-blue-50/40 dark:from-neutral-900 dark:to-neutral-800">
                        <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-700 text-[10px] font-bold uppercase">
                          <Sparkles className="w-2.5 h-2.5" /> Prompt
                        </span>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400">
                        <FileText className="w-8 h-8 stroke-[1.5]" />
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[10px] font-bold uppercase">
                          {badge}
                        </span>
                      </div>
                    )}

                    {/* Top-right Star */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(item.id);
                      }}
                      aria-label={`Favourite ${item.name}`}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center transition-colors ${
                        isFav ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Card Footer */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-neutral-100 truncate">
                      {item.name || item.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatLibrarySize(item.size)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadLibraryItem(item);
                          }}
                          className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                          aria-label={`Delete ${item.name}`}
                          className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div id="library-list-view" className="flex flex-col space-y-2 mb-6">
            {filteredItems.map((item) => {
              const isFav = Boolean(item.isFavorite || item.favourite);
              const isImg = isImageItem(item);
              const badge = item.fileExt || (item.type === 'prompt' ? 'PROMPT' : 'FILE');

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItemId(item.id)}
                  className="card flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200/90 bg-white hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {isImg && item.url ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : isImg ? (
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                      ) : item.type === 'prompt' ? (
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 dark:text-neutral-100 truncate">
                        {item.name || item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {badge} • {formatLibrarySize(item.size)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(item.id);
                      }}
                      aria-label={`Favourite ${item.name}`}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 ${
                        isFav ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadLibraryItem(item);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      aria-label={`Delete ${item.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <LibraryPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSave={handleSavePrompt}
      />
      <LibraryPreviewModal
        item={previewItem}
        onClose={() => setPreviewItemId(null)}
        onToggleFavourite={handleToggleFavourite}
      />
      <LibraryDeleteModal
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteItem}
      />

      {toastMsg && (
        <div
          id="studio-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default LibraryWorkspace;
