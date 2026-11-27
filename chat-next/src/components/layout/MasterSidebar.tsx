import React, { useState } from 'react';
import {
  ArrowUpDown,
  ChevronsUpDown,
  Folder,
  Image as ImageIcon,
  Library,
  PanelLeft,
  Presentation,
  Search,
  SquarePen
} from 'lucide-react';
import { isWorkspaceHiddenInSidebar, type WorkspaceId } from '../../config/workspaces';
import { useAppShell } from '../../context/AppShellContext';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { useChatSession } from '../../context/ChatSessionContext';
import { useI18n } from '../../context/I18nContext';
import { AccountDropdownMenu } from './AccountDropdownMenu';
import { RecentChatsList } from './RecentChatsList';

export const MasterSidebar: React.FC = () => {
  const {
    activeWorkspace,
    navigateToWorkspace,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    setSearchModalOpen
  } = useAppShell();
  const { userName, planLabel, avatarInitial } = useAuthProfile();
  const { createNewChat, sortMode, setSortMode } = useChatSession();
  const { t } = useI18n();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems: Array<{
    id: WorkspaceId;
    domId: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    {
      id: 'chat',
      domId: 'new-chat-btn',
      label: t('nav.newChat', 'New chat'),
      icon: <SquarePen className="w-4 h-4 shrink-0" />,
      onClick: () => {
        navigateToWorkspace('chat');
        createNewChat();
      }
    },
    {
      id: 'images',
      domId: 'sidebar-nav-images',
      label: t('nav.images', 'Images'),
      icon: <ImageIcon className="w-4 h-4 shrink-0" />,
      onClick: () => navigateToWorkspace('images')
    },
    {
      id: 'slides',
      domId: 'sidebar-nav-slides',
      label: t('nav.slides', 'Slides'),
      icon: <Presentation className="w-4 h-4 shrink-0" />,
      onClick: () => navigateToWorkspace('slides')
    },
    {
      id: 'projects',
      domId: 'sidebar-nav-projects',
      label: t('nav.projects', 'Projects'),
      icon: <Folder className="w-4 h-4 shrink-0" />,
      onClick: () => navigateToWorkspace('projects')
    },
    {
      id: 'library',
      domId: 'sidebar-nav-library',
      label: t('nav.library', 'Library'),
      icon: <Library className="w-4 h-4 shrink-0" />,
      onClick: () => navigateToWorkspace('library')
    }
  ];

  const asideClasses = [
    'relative w-64 bg-white dark:bg-[#191919] border-r border-neutral-200/50 dark:border-neutral-800/50 flex flex-col h-screen z-50 shrink-0 select-none pointer-events-auto',
    isSidebarCollapsed ? 'sidebar-collapsed' : '',
    isMobileSidebarOpen ? 'mobile-open' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        id="sidebar-overlay"
        onClick={() => setMobileSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${
          isMobileSidebarOpen ? 'block pointer-events-auto' : 'hidden pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside id="sidebar" className={asideClasses}>
        {/* Brand Header */}
        <div className="sidebar-header-area flex items-center justify-between px-4 py-3">
          <a
            href="/"
            id="sidebar-brand-logo"
            onClick={(e) => {
              e.preventDefault();
              navigateToWorkspace('chat');
              createNewChat();
            }}
            className="flex items-center overflow-hidden w-9 h-9 justify-center cursor-pointer"
            title="AI Mestrio"
          >
            <img
              src="/public/logo.png"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.retried) {
                  img.dataset.retried = '1';
                  img.src = '/logo.png';
                }
              }}
              alt="Mestrio"
              className="w-9 h-9 object-contain scale-150 origin-center hover:opacity-85 transition-transform"
            />
          </a>

          <div className="sidebar-header-actions flex items-center gap-1.5 text-slate-400">
            <button
              id="sidebar-search-btn"
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="sidebar-search-trigger p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              id="sidebar-toggle-btn"
              type="button"
              onClick={() => {
                if (isMobileSidebarOpen) {
                  setMobileSidebarOpen(false);
                } else {
                  toggleSidebarCollapsed();
                }
              }}
              className="p-1.5 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer border-0 outline-none"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-2 space-y-1">
          {navItems
            .filter((item) => !isWorkspaceHiddenInSidebar(item.id))
            .map((item) => {
              const isActive = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={item.domId}
                  onClick={item.onClick}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors cursor-pointer text-left border-0 outline-none ${
                    isActive
                      ? 'text-neutral-900 font-medium bg-neutral-200/70'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  {item.icon}
                  <span className="sidebar-label">{item.label}</span>
                </button>
              );
            })}
        </div>

        {/* Recents Chat History */}
        <div className="flex-1 flex flex-col min-h-0 px-2 mt-4 relative">
          <div className="sidebar-section-header flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
            <span>{t('nav.recents', 'Recents')}</span>
            <button
              type="button"
              onClick={() => setSortMode(sortMode === 'recent' ? 'alpha' : 'recent')}
              className="p-0.5 rounded hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
              title={sortMode === 'recent' ? 'Sort A–Z' : 'Sort by Recent'}
              aria-label="Sort recent chats"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
          <RecentChatsList />
        </div>

        {/* Account Dropdown Menu */}
        <AccountDropdownMenu
          isOpen={isAccountMenuOpen}
          onClose={() => setIsAccountMenuOpen(false)}
        />

        {/* Sidebar Bottom: Profile Section */}
        <div className="p-3 border-t border-slate-100/80 dark:border-zinc-800/40 mt-auto bg-white dark:bg-[#191919]">
          <div
            className="sidebar-profile-area flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            id="sidebar-account-btn"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsAccountMenuOpen((prev) => !prev);
              }
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                id="sidebar-user-avatar"
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0"
              >
                {avatarInitial}
              </div>
              <div className="sidebar-profile-name flex flex-col min-w-0">
                <span
                  className="text-xs font-semibold text-slate-800 leading-tight truncate"
                  id="sidebar-user-name"
                >
                  {userName}
                </span>
                <span
                  className="text-[11px] text-slate-400 leading-tight truncate"
                  id="sidebar-user-plan-label"
                >
                  {planLabel}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 sidebar-profile-name shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default MasterSidebar;
