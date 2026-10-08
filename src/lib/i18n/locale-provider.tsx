"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { localeDir, localeCookieMaxAge, localeCookieName, locales, type Locale } from "./config";
import { createT, getDictionary, type TFunction } from "./index";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** Current path, used by the language switcher to return to the same page. */
  pathname: string;
  t: TFunction;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [prevInitialLocale, setPrevInitialLocale] = useState(initialLocale);

  // Sync state if initialLocale changes from server render
  if (prevInitialLocale !== initialLocale) {
    setPrevInitialLocale(initialLocale);
    setLocaleState(initialLocale);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDir(locale);
  }, [locale]);

  const t = useMemo(() => createT(getDictionary(locale)), [locale]);

  /**
   * Writes the cookie client-side, updates HTML lang & dir immediately,
   * then performs a document navigation through /api/locale with the full path & query.
   */
  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.cookie = `${localeCookieName}=${next}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = localeDir(next);
      setLocaleState(next);
      const target =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname || "/";
      window.location.href = `/api/locale?l=${next}&next=${encodeURIComponent(target)}`;
    },
    [locale, pathname],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir: localeDir(locale), pathname: pathname || "/", t, setLocale }),
    [locale, pathname, t, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export const useT = (): TFunction => useLocale().t;

export { locales };
