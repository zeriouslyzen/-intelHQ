"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import en from "@/locales/en.json";
import tr from "@/locales/tr.json";
import es from "@/locales/es.json";
import ja from "@/locales/ja.json";

export type Locale = "en" | "tr" | "es" | "ja";

const STORAGE_KEY = "worldsignals_locale";

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  tr: tr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  ja: ja as Record<string, unknown>,
};

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "tr" || raw === "es" || raw === "ja" || raw === "en") return raw;
  return "en";
}

function lookup(obj: unknown, path: string): string | undefined {
  const value = path
    .split(".")
    .reduce((o: unknown, k) => (o != null && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
  return typeof value === "string" ? value : undefined;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!mounted) {
        return lookup(dictionaries.en, key) ?? key;
      }
      const dict = dictionaries[locale];
      return lookup(dict, key) ?? lookup(dictionaries.en, key) ?? key;
    },
    [locale, mounted]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
