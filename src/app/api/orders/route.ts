import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons, orders, products, type OrderItem } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";
import { getSettings } from "@/lib/settings";
import { computeShippingFee } from "@/lib/shipping";
import { isValidAlgerianPhone } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** Admin: list orders, optionally filtered by status. */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();

  const status = req.nextUrl.searchParams.get("status");
  const items = await db
    .select()
    .from(orders)
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(500);

  return NextResponse.json({ orders: items });
}

interface OrderRequestBody {
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  notes?: string;
  items: Array<{
    productId: number;
    name?: string;
    price?: number;
    size: string;
    color: string;
    qty: number;
    image?: string;
  }>;
  couponCode?: string;
}

/** Public: place an order (cash on delivery). Prices are recomputed server-side. */
export async function POST(req: NextRequest) {
  const t = apiT(req);

  let body: OrderRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: t("api.errInvalidBody") }, { status: 400 });
  }

  if (!body.customerName?.trim()) {
    return NextResponse.json({ error: t("api.errOrderName") }, { status: 400 });
  }
  if (!isValidAlgerianPhone(body.phone ?? "")) {
    return NextResponse.json({ error: t("api.errOrderPhone") }, { status: 400 });
  }
  if (!body.wilaya?.trim()) {
    return NextResponse.json({ error: t("api.errOrderWilaya") }, { status: 400 });
  }
  if (!body.address?.trim()) {
    return NextResponse.json({ error: t("api.errOrderAddress") }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: t("api.errOrderEmpty") }, { status: 400 });
  }

  // Recompute prices from the database — never trust client prices.
  const ids = [...new Set(body.items.map((i) => Number(i.productId)))].filter(Boolean);
  const found = await db.select().from(products).where(inArray(products.id, ids));
  const byId = new Map(found.map((p) => [p.id, p]));

  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of body.items) {
    const product = byId.get(Number(item.productId));
    if (!product) {
      return NextResponse.json(
        { error: t("api.errOrderProduct", { id: item.productId }) },
        { status: 400 },
      );
    }
    // Never let a hidden product be ordered.
    if (!product.active) {
      return NextResponse.json(
        { error: t("api.errOrderInactive", { name: product.name }) },
        { status: 400 },
      );
    }
    // Cap the quantity at real stock — never oversell or go negative.
    const available = Math.max(0, product.stock);
    if (available === 0) {
      return NextResponse.json(
        { error: t("api.errOrderNoStock", { name: product.name }) },
        { status: 400 },
      );
    }
    const qty = Math.min(Math.max(1, Math.round(Number(item.qty) || 1)), available);
    const price = product.price;
    subtotal += price * qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price,
      size: item.size || product.sizes[0] || "M",
      color: item.color || product.colors[0] || "Black",
      qty,
      image: product.images[0] ?? "",
    });
  }

  // ---- "Complete the fit" bundle discount (server-authoritative) ----
  // When a product AND its configured upsell are both in the order, 10% comes
  // off each pair. This used to be applied only in the browser, which meant
  // checkout silently charged the full price.
  const BUNDLE_RATE = 0.1;
  let bundleDiscount = 0;
  const qtyByProduct = new Map<number, number>();
  for (const item of orderItems) {
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.qty);
  }
  const alreadyCounted = new Set<number>();
  for (const [productId, qty] of qtyByProduct) {
    if (alreadyCounted.has(productId)) continue;
    const product = byId.get(productId);
    if (!product?.upsellProductId) continue;
    const upsell = byId.get(product.upsellProductId);
    const upsellQty = qtyByProduct.get(product.upsellProductId) ?? 0;
    if (!upsell || upsellQty === 0) continue;
    const pairs = Math.min(qty, upsellQty);
    bundleDiscount += Math.round((product.price + upsell.price) * BUNDLE_RATE) * pairs;
    alreadyCounted.add(productId);
    alreadyCounted.add(product.upsellProductId);
  }

  // Validate the coupon server-side (bundle discount is already included)
  let couponDiscount = 0;
  let discount = bundleDiscount;
  let couponCode: string | null = null;
  if (body.couponCode?.trim()) {
    const code = body.couponCode.trim().toUpperCase();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);
    if (coupon && coupon.active) {
      const now = new Date();
      const notExpired = !coupon.expiresAt || coupon.expiresAt > now;
      const hasUsesLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
      if (notExpired && hasUsesLeft && subtotal >= coupon.minOrder) {
        couponDiscount =
          coupon.type === "percent"
            ? Math.floor((subtotal * coupon.value) / 100)
            : Math.min(coupon.value, subtotal);
        discount += couponDiscount;
        couponCode = coupon.code;
      }
    }
  }
  // A coupon should never push the order below zero.
  discount = Math.min(discount, subtotal);

  const store = await getSettings();
  const shippingFee = computeShippingFee(store, body.wilaya.trim(), subtotal - discount);
  const total = subtotal - discount + shippingFee;

  const orderNumber = `LS-${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 36,
  )
    .toString(36)
    .toUpperCase()}`;

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: body.customerName.trim(),
      phone: body.phone.trim(),
      wilaya: body.wilaya.trim(),
      address: body.address.trim(),
      notes: body.notes?.trim() ?? "",
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      couponCode,
      total,
      status: "pending",
      paymentMethod: "cod",
    })
    .returning();

  // Best-effort stock decrement + coupon usage increment
  try {
    for (const item of orderItems) {
      await db
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` })
        .where(eq(products.id, item.productId));
    }
    if (couponCode) {
      await db
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.code, couponCode));
    }
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ order }, { status: 201 });
}
