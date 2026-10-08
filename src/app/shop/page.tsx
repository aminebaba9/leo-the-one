import { Suspense } from "react";
import { and, asc, desc, eq, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import ProductCard from "@/components/product-card";
import ShopFilters from "@/app/shop/shop-filters";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { t } = await getT();
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const category = get("category") ?? "";
  const size = get("size") ?? "";
  const color = get("color") ?? "";
  const q = get("q") ?? "";
  const sort = get("sort") ?? "newest";
  const min = Number(get("min") ?? "") || undefined;
  const max = Number(get("max") ?? "") || undefined;

  const conditions: SQL[] = [eq(products.active, true)];
  if (category === "tshirt" || category === "hoodie") {
    conditions.push(eq(products.category, category));
  }
  if (size) conditions.push(sql`${products.sizes} @> ${JSON.stringify([size])}`);
  if (color) conditions.push(sql`${products.colors} @> ${JSON.stringify([color])}`);
  if (q) conditions.push(ilike(products.name, `%${q}%`));
  if (min !== undefined) conditions.push(gte(products.price, min));
  if (max !== undefined) conditions.push(lte(products.price, max));

  const orderBy =
    sort === "price-asc"
      ? [asc(products.price)]
      : sort === "price-desc"
        ? [desc(products.price)]
        : [desc(products.createdAt)];

  const items: Product[] = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(100);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{t("shop.eyebrow")}</p>
        <h1 className="font-display text-4xl font-black sm:text-5xl">{t("shop.title")}</h1>
        <p className="max-w-xl text-muted">{t("shop.subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={null}>
            <ShopFilters />
          </Suspense>
        </aside>

        <div>
          <p className="mb-5 text-sm font-semibold text-muted">
            {t("shop.count", { count: items.length })}
          </p>
          {items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white py-24 text-center">
              <PackageSearch className="h-12 w-12 text-muted" />
              <p className="mt-4 font-display text-lg font-bold">{t("shop.empty")}</p>
              <p className="mt-1 text-sm text-muted">{t("shop.emptyHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
