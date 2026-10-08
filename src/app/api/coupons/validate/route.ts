import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { apiT } from "@/lib/i18n/api";
import { formatDZD } from "@/lib/utils";
import { apiLocale } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";

/** Public: validate a coupon code against a cart subtotal. */
export async function GET(req: NextRequest) {
  const t = apiT(req);
  const locale = apiLocale(req);
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? "0");

  if (!code) return NextResponse.json({ valid: false, message: t("coupon.enter") });

  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  if (!coupon) {
    return NextResponse.json({ valid: false, message: t("coupon.notFound") });
  }
  if (!coupon.active) {
    return NextResponse.json({ valid: false, message: t("coupon.inactive") });
  }
  if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
    return NextResponse.json({ valid: false, message: t("coupon.expired") });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, message: t("coupon.limit") });
  }
  if (subtotal < coupon.minOrder) {
    return NextResponse.json({
      valid: false,
      message: t("coupon.minOrder", { amount: formatDZD(coupon.minOrder, locale) }),
    });
  }

  const discount =
    coupon.type === "percent"
      ? Math.floor((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return NextResponse.json({ valid: true, discount, code: coupon.code });
}
