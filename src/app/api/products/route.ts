import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { apiT } from "@/lib/i18n/api";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Public catalogue listing with filters. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? "";
  const size = sp.get("size") ?? "";
  const color = sp.get("color") ?? "";
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const min = Number(sp.get("min") ?? "") || undefined;
  const max = Number(sp.get("max") ?? "") || undefined;
  const combo = sp.get("combo") === "1";

  const conditions: SQL[] = [];
  // Non-admins only see active products
  if (!isAdminRequest(req)) conditions.push(eq(products.active, true));
  if (category === "tshirt" || category === "hoodie") conditions.push(eq(products.category, category));
  if (size) conditions.push(sql`${products.sizes} @> ${JSON.stringify([size])}`);
  if (color) conditions.push(sql`${products.colors} @> ${JSON.stringify([color])}`);
  if (q) conditions.push(ilike(products.name, `%${q}%`));
  if (min !== undefined) conditions.push(gte(products.price, min));
  if (max !== undefined) conditions.push(lte(products.price, max));
  if (combo) conditions.push(eq(products.isCombo, true));

  const orderBy =
    sort === "price-asc"
      ? [asc(products.price)]
      : sort === "price-desc"
        ? [desc(products.price)]
        : [desc(products.createdAt)];

  const items = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(200);

  return NextResponse.json({ products: items });
}

/** Admin: create a product. */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const t = apiT(req);

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  if (!name) return NextResponse.json({ error: t("api.errName") }, { status: 400 });
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: t("api.errPrice") }, { status: 400 });
  }

  let slug = slugify(String(body.slug ?? "").trim() || name);
  if (!slug) slug = `product-${Date.now().toString(36)}`;
  const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (existing.length > 0) slug = `${slug}-${Math.floor(Math.random() * 10000)}`;

  const [created] = await db
    .insert(products)
    .values({
      name,
      slug,
      description: String(body.description ?? ""),
      category: body.category === "hoodie" ? "hoodie" : "tshirt",
      price: Math.round(price),
      compareAtPrice: body.compareAtPrice ? Math.round(Number(body.compareAtPrice)) : null,
      images: Array.isArray(body.images) ? body.images : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      colors: Array.isArray(body.colors) ? body.colors : [],
      stock: Math.max(0, Math.round(Number(body.stock) || 0)),
      featured: Boolean(body.featured),
      active: body.active !== false,
      isCombo: Boolean(body.isCombo),
      comboProductIds: Array.isArray(body.comboProductIds) ? body.comboProductIds : [],
      comboPrice: body.comboPrice ? Math.round(Number(body.comboPrice)) : null,
      upsellProductId: body.upsellProductId ? Number(body.upsellProductId) : null,
    })
    .returning();

  return NextResponse.json({ product: created }, { status: 201 });
}
