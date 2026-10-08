import type { Locale } from "@/lib/i18n/config";
import type { TFunction } from "@/lib/i18n";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats a DZD amount for display: "3 200 DA" (fr) / "3 200 دج" (ar). */
export function formatDZD(amount: number, locale: Locale = "fr"): string {
  const formatted = amount.toLocaleString("fr-FR");
  return locale === "ar" ? `${formatted} دج` : `${formatted} DA`;
}

/** Formats a date for display in admin tables etc. */
export function formatDate(value: Date | string, locale: Locale = "fr"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function discountPercent(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export const SIZES = ["S", "M", "L", "XL", "2XL"];
export const COLORS = ["Black", "White", "Sand", "Grey", "Olive", "Brown"];
export const CATEGORIES = [
  { value: "tshirt", labelKey: "categories.tshirt" },
  { value: "hoodie", labelKey: "categories.hoodie" },
];

export const ORDER_STATUSES = [
  { value: "pending", labelKey: "status.pending", color: "bg-amber-500" },
  { value: "confirmed", labelKey: "status.confirmed", color: "bg-blue-500" },
  { value: "shipped", labelKey: "status.shipped", color: "bg-violet-500" },
  { value: "delivered", labelKey: "status.delivered", color: "bg-emerald-500" },
  { value: "cancelled", labelKey: "status.cancelled", color: "bg-rose-500" },
];

/** Resolves a dictionary label for a category value. */
export function categoryLabel(t: TFunction, value: string): string {
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? t(found.labelKey) : value;
}
