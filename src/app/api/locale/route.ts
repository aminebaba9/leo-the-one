import { NextRequest, NextResponse } from "next/server";
import { localeCookieMaxAge, localeCookieName, locales, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/**
 * Sets the locale cookie on the SERVER and redirects back to the requested
 * path. Doing this server-side guarantees the next render uses the chosen
 * language reliably across RSC boundaries.
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
 * Builds an absolute redirect URL preserving the actual scheme and host.
 */
function baseUrl(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? req.headers.get("host") ?? req.nextUrl.host)
    .split(",")[0]
    .trim();

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const proto = (forwardedProto ?? req.nextUrl.protocol.replace(/:$/, ""))
    .split(",")[0]
    .trim();

  return `${proto}://${host}`;
}

function build(req: NextRequest, locale: Locale, next: string) {
  let targetUrl: URL;
  try {
    targetUrl = new URL(next, baseUrl(req));
  } catch {
    targetUrl = new URL(next, req.nextUrl.origin);
  }

  const res = NextResponse.redirect(targetUrl);
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

  const locale = locales.includes(requested as Locale) ? (requested as Locale) : "fr";
  return build(req, locale, next);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requested = String(body.locale ?? "");
  const next = safeNext(typeof body.next === "string" ? body.next : "/");

  const locale = locales.includes(requested as Locale) ? (requested as Locale) : "fr";

  if (req.headers.get("accept")?.includes("application/json")) {
    const res = NextResponse.json({ ok: true, locale });
    res.cookies.set(localeCookieName, locale, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
    });
    return res;
  }

  return build(req, locale, next);
}
