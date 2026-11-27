import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CreditCard,
  Globe,
  Menu,
  Monitor,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
  X
} from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { useChatSession } from '../../context/ChatSessionContext';
import { useI18n } from '../../context/I18nContext';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
import { deleteConversation } from '../../lib/apiClient';

type SettingsTab =
  | 'general'
  | 'appearance'
  | 'language'
  | 'notifications'
  | 'subscription'
  | 'privacy'
  | 'account';

const WORKSPACE_PREF_KEY = 'ai_default_workspace';

export const SettingsModal: React.FC = () => {
  const { activeModal, openModal } = useAppShell();
  const { userName, userEmail, planLabel, avatarInitial, updateUserName, logout } =
    useAuthProfile();
  const { theme, setTheme } = useTheme();
  const { language, languages, isRtl, setLanguage, t } = useI18n();
  const { conversations, setConversations, createNewChat } = useChatSession();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [defaultWorkspace, setDefaultWorkspace] = useState<string>(() => {
    try {
      return window.localStorage.getItem(WORKSPACE_PREF_KEY) || 'chat';
    } catch {
      return 'chat';
    }
  });
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const [notifyUpdates, setNotifyUpdates] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem('ai_notify_updates');
      return v !== null ? v === 'true' : true;
    } catch {
      return true;
    }
  });
  const [notifySecurity, setNotifySecurity] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem('ai_notify_security');
      return v !== null ? v === 'true' : true;
    } catch {
      return true;
    }
  });
  const [saveHistory, setSaveHistory] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem('ai_chat_history_enabled');
      return v !== null ? v === 'true' : true;
    } catch {
      return true;
    }
  });
  const [confirmClearChats, setConfirmClearChats] = useState(false);

  const isOpen = activeModal === 'settings';

  useEffect(() => {
    if (isOpen) {
      setNameDraft(userName);
      setIsEditingName(false);
      setConfirmClearChats(false);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openModal(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, openModal]);

  const filteredLanguages = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [languages, langSearch]);

  const activeLangObj = useMemo(
    () => languages.find((l) => l.code === language) || languages[0],
    [languages, language]
  );

  if (!isOpen) return null;

  const navTabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'general', label: t('settings.general', 'General'), icon: <Menu className="w-4 h-4 shrink-0" /> },
    { id: 'appearance', label: t('settings.appearance', 'Appearance'), icon: <Sun className="w-4 h-4 shrink-0" /> },
    { id: 'language', label: t('settings.language', 'Language'), icon: <Globe className="w-4 h-4 shrink-0" /> },
    { id: 'notifications', label: t('settings.notifications', 'Notifications'), icon: <Bell className="w-4 h-4 shrink-0" /> },
    { id: 'subscription', label: t('settings.subscription', 'Subscription'), icon: <CreditCard className="w-4 h-4 shrink-0" /> },
    { id: 'privacy', label: t('settings.privacy', 'Privacy & Data'), icon: <Shield className="w-4 h-4 shrink-0" /> },
    { id: 'account', label: t('settings.account', 'Account'), icon: <User className="w-4 h-4 shrink-0" /> }
  ];

  const workspaceLabels: Record<string, string> = {
    chat: 'Main Chat / Home',
    'slides-studio': 'Slides Studio',
    projects: 'Projects',
    library: 'Library'
  };

  const handleToggle = (
    key: string,
    next: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(next);
    try {
      window.localStorage.setItem(key, String(next));
    } catch {
      // Ignore
    }
  };

  const handleExportChats = () => {
    const exportData = {
      application: 'AI Mestrio',
      version: '2.4',
      exportedAt: new Date().toISOString(),
      user: userName,
      plan: planLabel,
      conversations
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mestrio-conversations-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleClearAllChats = async () => {
    const ids = conversations.map((c) => c.id);
    setConversations([]);
    createNewChat();
    try {
      window.localStorage.setItem('hasClearedChats', 'true');
      window.localStorage.removeItem('mestrio_platform_chats_v1');
      window.localStorage.removeItem('mestrio_pinned_chats');
    } catch {
      // Ignore
    }
    setConfirmClearChats(false);
    await Promise.allSettled(ids.map((id) => deleteConversation(id)));
  };

  return (
    <div
      id="settings-modal"
      onClick={() => openModal(null)}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col md:flex-row h-[590px] max-h-[92vh]"
      >
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 bg-slate-50/70 border-b md:border-b-0 md:border-r border-slate-200/80 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-2.5 py-1 mb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700 dark:text-neutral-200" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t('settings.title', 'Settings')}
                </h2>
              </div>
            </div>

            <nav
              className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0"
              id="settings-nav-list"
            >
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-tab={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-nav-tab w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'font-semibold text-slate-900 bg-white shadow-2xs border border-slate-200/80'
                        : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {tab.icon}
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-3 border-t border-slate-200/60 px-1">
            <p className="text-[10px] text-slate-400">AI Mestrio · Preferences</p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          <button
            type="button"
            id="close-settings-modal-btn"
            onClick={() => openModal(null)}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
            title="Close"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8" id="settings-panels-container">
            {/* PANEL 1: GENERAL */}
            {activeTab === 'general' && (
              <div id="settings-panel-general" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('settings.general', 'General')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your profile identity and workspace defaults.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">Display name</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Your display name shown in chats, sidebar, and account menu.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditingName ? (
                        <div id="settings-name-view" className="flex items-center gap-2">
                          <span
                            id="settings-name-val"
                            className="text-xs font-semibold text-slate-800 dark:text-neutral-100"
                          >
                            {userName}
                          </span>
                          <button
                            type="button"
                            id="settings-name-edit-btn"
                            onClick={() => {
                              setNameDraft(userName);
                              setIsEditingName(true);
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div id="settings-name-edit-form" className="flex items-center gap-1.5">
                          <input
                            type="text"
                            id="settings-name-input"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            maxLength={32}
                            className="px-3 py-1 text-xs rounded-lg border border-blue-500 ring-2 ring-blue-500/10 focus:outline-none text-slate-800 dark:text-neutral-100 dark:bg-neutral-900 w-40"
                          />
                          <button
                            type="button"
                            id="settings-name-save-btn"
                            onClick={async () => {
                              await updateUserName(nameDraft);
                              setIsEditingName(false);
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            id="settings-name-cancel-btn"
                            onClick={() => setIsEditingName(false)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">Email address</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        The primary email associated with this account.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        id="settings-email-val"
                        className="text-xs text-slate-600 dark:text-neutral-300 font-medium"
                      >
                        {userEmail || 'Not signed in'}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">
                        Default workspace
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Preferred view when opening AI Mestrio.
                      </p>
                    </div>
                    <div className="relative" id="workspace-dropdown-wrapper">
                      <button
                        type="button"
                        id="workspace-dropdown-btn"
                        onClick={() => setIsWsDropdownOpen((p) => !p)}
                        className="flex items-center justify-between gap-3 px-3 py-1.5 min-w-[170px] text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{workspaceLabels[defaultWorkspace] || 'Main Chat / Home'}</span>
                      </button>
                      {isWsDropdownOpen && (
                        <div
                          id="workspace-dropdown-menu"
                          className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#202020] rounded-xl border border-slate-200/90 shadow-xl p-1 text-xs z-50"
                        >
                          {Object.entries(workspaceLabels).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setDefaultWorkspace(key);
                                try {
                                  window.localStorage.setItem(WORKSPACE_PREF_KEY, key);
                                } catch {
                                  // Ignore
                                }
                                setIsWsDropdownOpen(false);
                              }}
                              className="workspace-opt w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 text-left cursor-pointer"
                            >
                              <span>{label}</span>
                              {defaultWorkspace === key && (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div id="settings-panel-appearance" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('settings.appearance', 'Appearance')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize how AI Mestrio looks on your screen.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <label className="text-xs font-semibold text-slate-800 mb-3 block">
                    Color theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          mode: 'light' as ThemeMode,
                          label: 'Light',
                          desc: 'Crisp, clean layout',
                          icon: <Sun className="w-4 h-4" />,
                          iconCls: 'bg-amber-50 border-amber-200/70 text-amber-600'
                        },
                        {
                          mode: 'dark' as ThemeMode,
                          label: 'Dark',
                          desc: 'Deep slate tones',
                          icon: <Moon className="w-4 h-4" />,
                          iconCls: 'bg-slate-100 border-slate-300 text-slate-800'
                        },
                        {
                          mode: 'system' as ThemeMode,
                          label: 'System',
                          desc: 'Matches OS settings',
                          icon: <Monitor className="w-4 h-4" />,
                          iconCls: 'bg-blue-50 border-blue-200/70 text-blue-600'
                        }
                      ] as const
                    ).map((item) => {
                      const active = theme === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          data-theme={item.mode}
                          onClick={() => setTheme(item.mode)}
                          className={`settings-appearance-card flex flex-col items-start p-4 rounded-2xl border transition-all text-left cursor-pointer relative ${
                            active
                              ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/30'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-3 ${item.iconCls}`}
                          >
                            {item.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{item.label}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                          {active && (
                            <Check className="w-4 h-4 text-blue-600 absolute top-3.5 right-3.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: LANGUAGE */}
            {activeTab === 'language' && (
              <div id="settings-panel-language" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('settings.language', 'Language')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interface language preferences for AI Mestrio.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div
                    id="settings-current-lang-card"
                    className="flex items-center justify-between p-4 rounded-2xl border border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                        {activeLangObj?.code || 'EN'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {activeLangObj?.nativeName || 'English'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isRtl ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Supported languages ({languages.length})
                      </label>
                      <div className="relative w-48">
                        <input
                          type="text"
                          id="settings-lang-search"
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          placeholder="Search languages..."
                          className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-neutral-100 placeholder-slate-400"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div
                      id="settings-languages-grid"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1"
                    >
                      {filteredLanguages.map((lang) => {
                        const active = lang.code === language;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguage(lang.code)}
                            className={`settings-lang-card flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              active
                                ? 'border-blue-600 bg-blue-50/40'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 dark:text-neutral-100 truncate">
                                {lang.nativeName}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {lang.name} {lang.rtl ? '· RTL' : ''}
                              </div>
                            </div>
                            {active && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div id="settings-panel-notifications" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage how and when you receive product notifications.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-5">
                  <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">
                        Product updates &amp; new models
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Receive in-app announcements when new frontier models and studio tools
                        launch.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-toggle-updates"
                      role="switch"
                      aria-checked={notifyUpdates}
                      onClick={() =>
                        handleToggle('ai_notify_updates', !notifyUpdates, setNotifyUpdates)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifyUpdates ? 'bg-blue-600' : 'bg-slate-200 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                          notifyUpdates ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">
                        Security &amp; subscription alerts
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Important notifications regarding account access, subscription status, and
                        billing.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-toggle-security"
                      role="switch"
                      aria-checked={notifySecurity}
                      onClick={() =>
                        handleToggle('ai_notify_security', !notifySecurity, setNotifySecurity)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifySecurity ? 'bg-blue-600' : 'bg-slate-200 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                          notifySecurity ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 5: SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div id="settings-panel-subscription" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Subscription</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View your current active plan and manage rate limit tier.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-slate-500 font-medium">Active Plan:</span>
                        <span
                          id="settings-sub-plan-badge"
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 border border-slate-200"
                        >
                          {planLabel}
                        </span>
                      </div>
                      <p id="settings-sub-plan-desc" className="text-[11px] text-slate-500 max-w-md">
                        Standard rate limits and frontier reasoning models for everyday tasks.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-sub-action-btn"
                      onClick={() => openModal('upgrade')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Upgrade plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 6: PRIVACY & DATA */}
            {activeTab === 'privacy' && (
              <div id="settings-panel-privacy" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Privacy &amp; Data</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control data retention, export your history, and manage local chats.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-5">
                  <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">
                        Save chat history
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Save chat threads and project discussions to local storage for future
                        sessions.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-toggle-history"
                      role="switch"
                      aria-checked={saveHistory}
                      onClick={() =>
                        handleToggle('ai_chat_history_enabled', !saveHistory, setSaveHistory)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        saveHistory ? 'bg-blue-600' : 'bg-slate-200 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                          saveHistory ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">
                        Export chat data
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Download an archive of all your conversations in JSON format.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-export-chats-btn"
                      onClick={handleExportChats}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                    >
                      Export JSON
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="text-xs font-semibold text-red-600">
                        Delete all conversations
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Permanently erase all chat history and active conversations from this
                        browser.
                      </p>
                    </div>
                    {!confirmClearChats ? (
                      <button
                        type="button"
                        id="settings-clear-chats-btn"
                        onClick={() => setConfirmClearChats(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Delete All
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setConfirmClearChats(false)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          id="settings-confirm-clear-chats-btn"
                          onClick={handleClearAllChats}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 7: ACCOUNT */}
            {activeTab === 'account' && (
              <div id="settings-panel-account" className="settings-panel space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Account</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View your profile details and manage your active session.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-5">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        id="settings-account-avatar"
                        className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0"
                      >
                        {avatarInitial}
                      </div>
                      <div>
                        <span
                          id="settings-account-name"
                          className="text-xs font-bold text-slate-900 block"
                        >
                          {userName}
                        </span>
                        <span id="settings-account-email" className="text-[11px] text-slate-400 block">
                          {userEmail || 'Not signed in'}
                        </span>
                        <span
                          id="settings-account-plan-badge"
                          className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full"
                        >
                          {planLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="settings-account-edit-profile-btn"
                      onClick={() => setActiveTab('general')}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Edit profile
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">Session</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sign out of your account on this device.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="settings-account-logout-btn"
                      onClick={() => {
                        logout();
                        openModal(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-xs font-semibold text-red-600">Delete account</label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Permanently delete your account and all associated workspace data.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="settings-account-delete-btn"
                        onClick={() => openModal('delete-account')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Delete account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
