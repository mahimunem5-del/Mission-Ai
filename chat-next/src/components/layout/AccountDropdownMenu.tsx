import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sparkles,
  Sun
} from 'lucide-react';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useAppShell } from '../../context/AppShellContext';

interface AccountDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDropdownMenu: React.FC<AccountDropdownMenuProps> = ({ isOpen, onClose }) => {
  const { userName, userEmail, planLabel, avatarInitial, logout } = useAuthProfile();
  const { theme, setTheme } = useTheme();
  const { language, languages, setLanguage, t } = useI18n();
  const { openModal } = useAppShell();

  const [submenu, setSubmenu] = useState<'appearance' | 'language' | null>(null);
  const [langQuery, setLangQuery] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSubmenu(null);
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const trigger = document.getElementById('sidebar-account-btn');
        if (trigger && trigger.contains(e.target as Node)) return;
        onClose();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLanguages = languages.filter((l) => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q);
  });

  const currentLangObj = languages.find((l) => l.code === language);

  return (
    <div
      ref={menuRef}
      id="account-dropdown-menu"
      className="absolute bottom-16 left-3 right-3 z-[9999] bg-white rounded-2xl border border-slate-200/90 shadow-xl ring-1 ring-black/5 py-1.5 text-xs select-none"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 dark:border-neutral-800">
        <div
          id="account-menu-avatar"
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0"
        >
          {avatarInitial}
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <span className="text-xs font-semibold text-slate-800 dark:text-neutral-100 truncate">
            {userName}
          </span>
          {userEmail && (
            <span className="text-[11px] text-slate-400 truncate">{userEmail}</span>
          )}
          <span className="text-[10px] font-medium text-slate-400">{planLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          type="button"
          id="account-menu-settings"
          onClick={() => {
            onClose();
            openModal('settings');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{t('account.settings', 'Settings')}</span>
        </button>

        {/* Appearance Submenu Trigger */}
        <div className="relative" id="account-menu-appearance-wrapper">
          <button
            type="button"
            id="account-menu-appearance"
            onClick={() => setSubmenu(submenu === 'appearance' ? null : 'appearance')}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : theme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>{t('account.appearance', 'Appearance')}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {submenu === 'appearance' && (
            <div
              id="appearance-submenu"
              className="mt-1 mx-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 p-1 space-y-0.5"
            >
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 capitalize"
                >
                  <span>{mode}</span>
                  {theme === mode && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Submenu Trigger */}
        <div className="relative" id="account-menu-language-wrapper">
          <button
            type="button"
            id="account-menu-language"
            onClick={() => setSubmenu(submenu === 'language' ? null : 'language')}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {currentLangObj?.nativeName || 'English'}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {submenu === 'language' && (
            <div
              id="language-submenu"
              className="mt-1 mx-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 p-1.5"
            >
              <input
                type="text"
                value={langQuery}
                onChange={(e) => setLangQuery(e.target.value)}
                placeholder="Search language..."
                className="w-full mb-1 px-2 py-1 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[11px] outline-none"
              />
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setSubmenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-md text-left text-slate-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800"
                  >
                    <span className="truncate">{lang.nativeName}</span>
                    {language === lang.code && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          id="account-menu-help"
          onClick={() => {
            onClose();
            openModal('feedback');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100/70 transition-colors text-left"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{t('account.help', 'Help & Feedback')}</span>
        </button>

        <button
          type="button"
          id="account-menu-upgrade"
          onClick={() => {
            onClose();
            openModal('upgrade');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-slate-100/70 transition-colors text-left font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{t('account.upgrade', 'Upgrade plan')}</span>
        </button>

        <div className="border-t border-slate-100 dark:border-neutral-800 my-1" />

        <button
          type="button"
          id="account-menu-logout"
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>{t('account.logout', 'Log out')}</span>
        </button>
      </div>
    </div>
  );
};
