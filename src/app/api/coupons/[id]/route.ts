import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.code !== undefined) updates.code = String(body.code).trim().toUpperCase();
  if (body.type !== undefined) updates.type = body.type === "amount" ? "amount" : "percent";
  if (body.value !== undefined) updates.value = Math.round(Number(body.value));
  if (body.minOrder !== undefined) updates.minOrder = Math.max(0, Math.round(Number(body.minOrder) || 0));
  if (body.usageLimit !== undefined) {
    updates.usageLimit = body.usageLimit ? Math.round(Number(body.usageLimit)) : null;
  }
  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.expiresAt !== undefined) {
    updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  }

  try {
    const [updated] = await db
      .update(coupons)
      .set(updates)
      .where(eq(coupons.id, Number(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
    return NextResponse.json({ coupon: updated });
  } catch {
    return NextResponse.json({ error: t("api.errCouponUpdate") }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const [deleted] = await db.delete(coupons).where(eq(coupons.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
  return NextResponse.json({ ok: true });
}
