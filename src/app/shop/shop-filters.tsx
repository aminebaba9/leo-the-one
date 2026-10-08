"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CATEGORIES, COLORS, SIZES, cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/locale-provider";
import { translateColor } from "@/lib/i18n";
import { Search, SlidersHorizontal, X } from "lucide-react";

const SORT_KEYS = ["filters.sortNew", "filters.sortAsc", "filters.sortDesc"] as const;
const SORT_VALUES = ["newest", "price-asc", "price-desc"];

/**
 * URL-driven catalogue filters. Every change updates the query string, and
 * the server re-renders the filtered grid.
 */
export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const category = searchParams.get("category") ?? "";
  const size = searchParams.get("size") ?? "";
  const color = searchParams.get("color") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const q = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const update = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => {
      router.replace(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== q) update({ q: query });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = category || size || color || q;

  return (
    <div className={cn("space-y-5", isPending && "opacity-70")}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filters.search")}
          className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted">
          <SlidersHorizontal className="h-3.5 w-3.5" /> {t("filters.filter")}
        </span>
        <button
          type="button"
          onClick={() => update({ category: "" })}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
            !category
              ? "border-ink bg-ink text-paper"
              : "border-line bg-white hover:border-ink",
          )}
        >
          {t("filters.all")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => update({ category: category === c.value ? "" : c.value })}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              category === c.value
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white hover:border-ink",
            )}
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update({ size: size === s ? "" : s })}
            className={cn(
              "h-9 min-w-9 rounded-full border px-3 text-xs font-bold transition-colors",
              size === s
                ? "border-accent bg-accent text-white"
                : "border-line bg-white hover:border-ink",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => update({ color: color === c ? "" : c })}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-bold transition-colors",
              color === c
                ? "border-accent bg-accent text-white"
                : "border-line bg-white hover:border-ink",
            )}
          >
            {translateColor(t, c)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-accent"
        >
          {SORT_VALUES.map((value, i) => (
            <option key={value} value={value}>
              {t(SORT_KEYS[i])}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.replace("/shop", { scroll: false })}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
          >
            <X className="h-3.5 w-3.5" /> {t("filters.clear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
