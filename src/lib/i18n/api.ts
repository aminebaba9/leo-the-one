import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale, localeCookieName, type Locale } from "./config";
import { createT, getDictionary, type TFunction } from "./index";

/** Reads the locale cookie from an API request (defaults to French). */
export function apiLocale(req: NextRequest): Locale {
  const value = req.cookies.get(localeCookieName)?.value;
  return isValidLocale(value) ? value : defaultLocale;
}

/** Server-side translator for API routes — localizes error messages. */
export function apiT(req: NextRequest): TFunction {
  return createT(getDictionary(apiLocale(req)));
}
