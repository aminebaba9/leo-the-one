import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";

/** Admin: list coupons. */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const items = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: items });
}

/** Admin: create a coupon. */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);

  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const type = body.type === "amount" ? "amount" : "percent";
  const value = Math.round(Number(body.value));

  if (!code) return NextResponse.json({ error: t("api.errCouponCode") }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: t("api.errCouponValue") }, { status: 400 });
  }
  if (type === "percent" && value > 100) {
    return NextResponse.json({ error: t("api.errCouponPercent") }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(coupons)
      .values({
        code,
        type,
        value,
        minOrder: Math.max(0, Math.round(Number(body.minOrder) || 0)),
        usageLimit: body.usageLimit ? Math.round(Number(body.usageLimit)) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        active: body.active !== false,
      })
      .returning();
    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: t("api.errCouponExists") }, { status: 400 });
  }
}
