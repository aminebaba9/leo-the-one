"use client";

import { locales, localeLabels } from "./config";
import { useLocale } from "./locale-provider";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

/**
 * FR / عربي toggle button.
 *
 * Preserves the full URL path and search params. Triggers client-side cookie & dir
 * updates immediately while reloading via /api/locale to ensure complete server sync.
 */
export default function LanguageSwitcher() {
  const { locale, pathname, setLocale } = useLocale();

  const search = typeof window !== "undefined" ? window.location.search : "";
  const targetPath = `${pathname || "/"}${search}`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
      <Globe className="ml-1 mr-0.5 h-3.5 w-3.5 text-muted" />
      {locales.map((l) => {
        const active = locale === l;
        const href = `/api/locale?l=${l}&next=${encodeURIComponent(targetPath)}`;
        return (
          <a
            key={l}
            href={href}
            onClick={(e) => {
              if (active) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              setLocale(l);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-black transition-colors cursor-pointer select-none",
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
