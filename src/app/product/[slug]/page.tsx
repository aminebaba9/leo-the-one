import { Suspense } from "react";
import { notFound } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import ProductClient from "@/app/product/[slug]/product-client";
import ProductCard from "@/components/product-card";
import ScrollReveal from "@/components/scroll-reveal";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { t } = await getT();
  const store = await getSettings();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);

  if (!product) notFound();

  // The "complete the fit" add-on, shown inside the order form.
  const upsell = product.upsellProductId
    ? await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, product.upsellProductId),
            eq(products.active, true),
          ),
        )
        .limit(1)
        .then((rows) => (rows[0]?.stock > 0 ? rows[0] : undefined))
    : undefined;

  const combosContaining = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        eq(products.isCombo, true),
        sql`${products.comboProductIds} @> ${JSON.stringify([product.id])}`,
      ),
    )
    .limit(4);

  const related = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        eq(products.category, product.category),
        ne(products.id, product.id),
      ),
    )
    .limit(4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <ProductClient product={product} upsell={upsell} store={store} />

      {/* Combos that include this product */}
      {combosContaining.length > 0 ? (
        <section className="mt-16">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {t("product.goesIn")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-black">{t("product.combosWith")}</h2>
          </ScrollReveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {combosContaining.map((combo) => (
              <ScrollReveal key={combo.id}>
                <ProductCard product={combo} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related products */}
      {related.length > 0 ? (
        <section className="mt-16">
          <Suspense fallback={null}>
            <ScrollReveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {t("product.alsoLike")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">{t("product.similar")}</h2>
            </ScrollReveal>
          </Suspense>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ScrollReveal key={item.id}>
                <ProductCard product={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
