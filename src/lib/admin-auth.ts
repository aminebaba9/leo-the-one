import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "leos_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * The admin password must come from the environment. There is deliberately no
 * fallback: a hardcoded default would let anyone log in if it were forgotten
 * in production. `npx drizzle-kit push` / seeding do not need it.
 */
export function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.trim().length > 0 ? value : null;
}

export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
