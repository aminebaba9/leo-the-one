export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const localeCookieName = "leos_locale";
export const localeCookieMaxAge = 60 * 60 * 24 * 365; // 1 year

export function isValidLocale(value: string | null | undefined): value is Locale {
  return value === "fr" || value === "ar";
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  ar: "عربي",
};
