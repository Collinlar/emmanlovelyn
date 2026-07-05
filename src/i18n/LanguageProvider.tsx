import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./types";
import {
  getNestedValue,
  interpolate,
  persistLocale,
  resolveInitialLocale,
  syncLocaleToUrl,
  translations,
} from "./translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    syncLocaleToUrl(next);
  }, []);

  useEffect(() => {
    persistLocale(locale);
    syncLocaleToUrl(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const raw = getNestedValue(translations[locale], key);
      return values ? interpolate(raw, values) : raw;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
