"use client";

import {
  createContext,
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

  // Keep in sync when the server renders a different locale (after switching).
  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const t = useMemo(() => createT(getDictionary(locale)), [locale]);

  /**
   * Writes the cookie client-side for optimistic UI, then performs a FULL
   * document navigation through /api/locale. The server re-writes the cookie
   * and returns a redirect, so the rendered HTML is always the chosen
   * language. This avoids the cached-RSC bug that flipped Arabic back to
   * French.
   */
  const setLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
    setLocaleState(next);
    const target = pathname && pathname !== "" ? pathname : "/";
    window.location.href = `/api/locale?l=${next}&next=${encodeURIComponent(target)}`;
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir: localeDir(locale), pathname, t, setLocale }),
    [locale, pathname, t],
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
