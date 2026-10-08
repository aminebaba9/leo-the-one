import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getAdminPassword,
} from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const t = apiT(req);
  const adminPassword = getAdminPassword();

  // Guard: the password must be configured, otherwise nobody could ever log in.
  if (!adminPassword) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD is not configured. Set it in your environment variables (.env locally, Vercel → Environment Variables in production).",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.password !== "string" || body.password !== adminPassword) {
    return NextResponse.json({ error: t("api.errPassword") }, { status: 401 });
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
