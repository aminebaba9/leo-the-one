import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, localeCookieName, type Locale } from "./config";
import { createT, getDictionary, type TFunction } from "./index";

/** Server-only: reads the locale cookie. */
export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const value = store.get(localeCookieName)?.value;
    if (isValidLocale(value)) return value;
  } catch {
    /* outside request scope (build) */
  }
  return defaultLocale;
}

/** Server-only: returns a translator + locale bound to the visitor's cookie. */
export async function getT(): Promise<{ t: TFunction; locale: Locale }> {
  const locale = await getLocale();
  return { t: createT(getDictionary(locale)), locale };
}
