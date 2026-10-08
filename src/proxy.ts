import { NextRequest, NextResponse } from "next/server";
import { localeCookieMaxAge, localeCookieName } from "@/lib/i18n/config";

const ADMIN_COOKIE = "leos_admin";

/**
 * Next.js 16 "proxy" convention. Two jobs:
 *  1. Default the locale cookie (fr / ar) from the Accept-Language header.
 *  2. Protect every /admin route except the login page with a session cookie
 *     that is only set after a successful password check.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Locale defaulting (only when the visitor has no preference yet) ---
  let localeCookie: { name: string; value: string } | null = null;
  if (!req.cookies.get(localeCookieName)) {
    const accept = (req.headers.get("accept-language") ?? "").toLowerCase();
    const locale = accept.includes("ar") ? "ar" : "fr";
    localeCookie = { name: localeCookieName, value: locale };
  }

  const attach = <T extends NextResponse>(res: T): T => {
    if (localeCookie) {
      res.cookies.set(localeCookie.name, localeCookie.value, {
        path: "/",
        maxAge: localeCookieMaxAge,
        sameSite: "lax",
      });
    }
    return res;
  };

  // --- Admin guard (only for /admin routes) ---
  if (pathname.startsWith("/admin")) {
    const isAdmin = req.cookies.get(ADMIN_COOKIE)?.value === "1";

    if (pathname === "/admin/login") {
      if (isAdmin) {
        return attach(NextResponse.redirect(new URL("/admin", req.url)));
      }
      return attach(NextResponse.next());
    }

    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return attach(NextResponse.redirect(loginUrl));
    }
  }

  return attach(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
