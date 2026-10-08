import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const { id } = await context.params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.slug !== undefined) {
    const base = slugify(String(body.slug).trim() || String(body.name ?? ""));
    updates.slug = base || `product-${id}`;
  }
  if (body.description !== undefined) updates.description = String(body.description ?? "");
  if (body.category !== undefined) updates.category = body.category === "hoodie" ? "hoodie" : "tshirt";
  if (body.price !== undefined) updates.price = Math.round(Number(body.price));
  if (body.compareAtPrice !== undefined) {
    updates.compareAtPrice = body.compareAtPrice ? Math.round(Number(body.compareAtPrice)) : null;
  }
  if (body.images !== undefined) updates.images = Array.isArray(body.images) ? body.images : [];
  if (body.sizes !== undefined) updates.sizes = Array.isArray(body.sizes) ? body.sizes : [];
  if (body.colors !== undefined) updates.colors = Array.isArray(body.colors) ? body.colors : [];
  if (body.stock !== undefined) updates.stock = Math.max(0, Math.round(Number(body.stock) || 0));
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);
  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.isCombo !== undefined) {
    updates.isCombo = Boolean(body.isCombo);
    if (!body.isCombo) {
      updates.comboProductIds = [];
      updates.comboPrice = null;
    }
  }
  if (body.comboProductIds !== undefined) {
    updates.comboProductIds = Array.isArray(body.comboProductIds) ? body.comboProductIds : [];
  }
  if (body.comboPrice !== undefined) {
    updates.comboPrice = body.comboPrice ? Math.round(Number(body.comboPrice)) : null;
  }
  if (body.upsellProductId !== undefined) {
    updates.upsellProductId = body.upsellProductId ? Number(body.upsellProductId) : null;
  }

  try {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, Number(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json({ error: t("api.errSlug") }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);
  const { id } = await context.params;
  const [deleted] = await db.delete(products).where(eq(products.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: t("api.errNotFound") }, { status: 404 });
  return NextResponse.json({ ok: true });
}
