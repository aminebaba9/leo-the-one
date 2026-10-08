import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";

/** Public: storefront settings (no secrets are stored here). */
export async function GET() {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (row) return NextResponse.json({ settings: row });
  } catch {
    /* fall through to defaults */
  }
  return NextResponse.json({ settings: null });
}

/** Admin: update the singleton settings row. */
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);

  const body = await req.json();
  const payload = {
    storeName: String(body.storeName ?? "Leo's"),
    storeTagline: String(body.storeTagline ?? ""),
    whatsappNumber: String(body.whatsappNumber ?? "").replace(/[^\d]/g, ""),
    deliveryCompany: String(body.deliveryCompany ?? ""),
    deliveryBaseFee: Math.max(0, Math.round(Number(body.deliveryBaseFee) || 0)),
    freeShippingThreshold: Math.max(0, Math.round(Number(body.freeShippingThreshold) || 0)),
    wilayaFees:
      body.wilayaFees && typeof body.wilayaFees === "object"
        ? (body.wilayaFees as Record<string, number>)
        : {},
    announcement: String(body.announcement ?? ""),
    facebookPixelId: String(body.facebookPixelId ?? "").trim(),
    tiktokPixelId: String(body.tiktokPixelId ?? "").trim(),
    updatedAt: new Date(),
  };

  try {
    const [row] = await db
      .insert(settings)
      .values({ id: 1, ...payload })
      .onConflictDoUpdate({ target: settings.id, set: payload })
      .returning();
    return NextResponse.json({ settings: row });
  } catch {
    return NextResponse.json({ error: t("api.errSettings") }, { status: 500 });
  }
}
