import {
  defaultLocale,
  isValidLocale,
  type Locale,
} from "./config";
import fr, { type Messages } from "./dictionaries/fr";
import ar from "./dictionaries/ar";

export type { Locale } from "./config";
export { locales, defaultLocale, localeCookieName, localeDir, localeLabels, isValidLocale } from "./config";

export type TParams = Record<string, string | number>;
export type TFunction = (key: string, params?: TParams) => string;

const dictionaries: Record<Locale, Messages> = { fr, ar };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

function lookup(messages: Messages, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}

/** Creates a translator bound to a dictionary. Missing keys return the key itself. */
export function createT(messages: Messages): TFunction {
  return (key, params) => {
    const template = lookup(messages, key);
    if (template === undefined) return key;
    return interpolate(template, params);
  };
}

/** Translates a color name stored in the DB (English key) for display. */
export function translateColor(t: TFunction, color: string): string {
  const translated = t(`colors.${color}`);
  return translated === `colors.${color}` ? color : translated;
}

/** Translates a category value stored in the DB. */
export function translateCategory(t: TFunction, category: string): string {
  const translated = t(`categories.${category}`);
  return translated === `categories.${category}` ? category : translated;
}

/** Translates an order status value stored in the DB. */
export function translateStatus(t: TFunction, status: string): string {
  const translated = t(`status.${status}`);
  return translated === `status.${status}` ? status : translated;
}
