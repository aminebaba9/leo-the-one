import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);

export async function GET(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const { id } = await context.params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.has(body.status)) {
      return NextResponse.json({ error: t("api.errInvalidStatus") }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.whatsappSent !== undefined) updates.whatsappSent = Boolean(body.whatsappSent);
  if (body.notes !== undefined) updates.notes = String(body.notes ?? "");

  const [updated] = await db
    .update(orders)
    .set(updates)
    .where(eq(orders.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
  return NextResponse.json({ order: updated });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const [deleted] = await db.delete(orders).where(eq(orders.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
  return NextResponse.json({ ok: true });
}
