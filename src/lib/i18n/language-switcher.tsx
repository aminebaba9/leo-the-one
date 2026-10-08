"use client";

import { locales, localeLabels, type Locale } from "./config";
import { useLocale } from "./locale-provider";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

/**
 * FR / عربي toggle.
 *
 * Uses a real navigation to /api/locale so the cookie is written by the
 * server and a fresh document is loaded in the new language. This fixes the
 * bug where tapping Arabic briefly switched then snapped back to French.
 */
export default function LanguageSwitcher() {
  const { locale, pathname } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
      <Globe className="ml-1 mr-0.5 h-3.5 w-3.5 text-muted" />
      {locales.map((l) => {
        const active = locale === l;
        const href = `/api/locale?l=${l}&next=${encodeURIComponent(pathname || "/")}`;
        return (
          <a
            key={l}
            href={href}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-black transition-colors",
              active ? "bg-ink text-paper" : "text-muted hover:text-ink",
            )}
            aria-label={localeLabels[l]}
            aria-current={active ? "true" : undefined}
          >
            {localeLabels[l]}
          </a>
        );
      })}
    </div>
  );
}
