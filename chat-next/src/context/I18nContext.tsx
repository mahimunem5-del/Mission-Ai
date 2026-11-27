import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

interface MestrioI18nGlobal {
  getLanguage?: () => string;
  setLanguage?: (code: string) => void;
  t?: (key: string, fallback?: string) => string;
  getSupportedLanguages?: () => LanguageOption[];
  isRtl?: (code?: string) => boolean;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false }
];

const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur']);

interface I18nContextValue {
  language: string;
  isRtl: boolean;
  languages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
  setLanguage: (code: string) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  isRtl: false,
  languages: DEFAULT_LANGUAGES,
  t: (_key, fallback) => fallback || '',
  setLanguage: () => {}
});

function getGlobalI18n(): MestrioI18nGlobal | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { MestrioI18n?: MestrioI18nGlobal }).MestrioI18n;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    const g = getGlobalI18n();
    if (g?.getLanguage) return g.getLanguage();
    try {
      return window.localStorage.getItem('mestrio_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const languages = useMemo(() => {
    const g = getGlobalI18n();
    const list = g?.getSupportedLanguages?.();
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_LANGUAGES;
  }, [language]);

  const isRtl = useMemo(() => {
    const g = getGlobalI18n();
    if (g?.isRtl) return g.isRtl(language);
    return RTL_CODES.has(language);
  }, [language]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = useCallback((code: string) => {
    const g = getGlobalI18n();
    if (g?.setLanguage) {
      g.setLanguage(code);
    } else {
      try {
        window.localStorage.setItem('mestrio_lang', code);
      } catch {
        // Ignore
      }
    }
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const g = getGlobalI18n();
      if (g?.t) {
        const translated = g.t(key, fallback);
        if (translated && translated !== key) return translated;
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, isRtl, languages, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
