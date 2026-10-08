import { NextRequest, NextResponse } from "next/server";
import { localeCookieMaxAge, localeCookieName, locales, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/**
 * Sets the locale cookie on the SERVER and redirects back to the requested
 * path. Doing this server-side (instead of document.cookie + router.refresh)
 * guarantees the next render uses the chosen language — the previous
 * client-only approach could be served a cached RSC payload and flip back.
 *
 * Usage: /api/locale?l=ar&next=/shop
 */
function safeNext(raw: string | null): string {
  // Only allow relative, same-site paths (prevents open redirects).
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

/**
 * Builds an absolute redirect URL from the incoming Host header. Using
 * `req.url` directly can resolve to an internal address (0.0.0.0) when the
 * app runs behind a proxy such as Vercel or a platform healthcheck.
 */
function baseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

function build(req: NextRequest, locale: Locale, next: string) {
  const res = NextResponse.redirect(new URL(next, baseUrl(req)));
  res.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: localeCookieMaxAge,
    sameSite: "lax",
  });
  // Never cache a language-changing redirect.
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("l") ?? "";
  const next = safeNext(req.nextUrl.searchParams.get("next"));

  if (!locales.includes(requested as Locale)) {
    return build(req, "fr", next);
  }
  return build(req, requested as Locale, next);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requested = String(body.locale ?? "");
  const next = safeNext(typeof body.next === "string" ? body.next : "/");

  if (!locales.includes(requested as Locale)) {
    return build(req, "fr", next);
  }
  return build(req, requested as Locale, next);
}
