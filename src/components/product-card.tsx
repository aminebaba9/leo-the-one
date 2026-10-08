"use client";

import Link from "next/link";
import type { Product } from "@/db/schema";
import { formatDZD, discountPercent, categoryLabel } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { translateColor } from "@/lib/i18n";
import { ArrowFlow } from "@/components/dir-arrow";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, locale } = useLocale();

  const off = discountPercent(product.price, product.compareAtPrice);
  const image = product.images[0] ?? "/images/hero.png";
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block h-full"
      aria-label={product.name}
    >
      <div className="relative h-full overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_30px_rgba(6,43,35,0.06)] transition-shadow group-hover:shadow-[0_18px_40px_rgba(6,43,35,0.12)]">
        {off > 0 ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-black text-white">
            -{off}%
          </span>
        ) : null}
        {product.isCombo ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-ink px-3 py-1 text-xs font-black uppercase tracking-wider text-lime">
            {t("product.comboDeal")}
          </span>
        ) : null}

        <div className="relative aspect-[4/5] overflow-hidden bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-1 text-xs font-medium text-muted">4.9</span>
          </div>

          <h3 className="mt-2 font-display text-[15px] font-bold leading-snug group-hover:text-accent">
            {product.name}
          </h3>

          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">
            {categoryLabel(t, product.category)} ·{" "}
            {product.colors.map((c) => translateColor(t, c)).join(" / ")}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black">{formatDZD(product.price, locale)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <span className="text-sm text-muted line-through">
                  {formatDZD(product.compareAtPrice, locale)}
                </span>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-[10px] font-black uppercase tracking-wider text-paper transition-colors group-hover:bg-accent">
              {t("productCard.order")}
              <ArrowFlow className="h-3 w-3" />
            </span>
          </div>

          {outOfStock ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-rose-500">
              {t("product.outOfStock")}
            </p>
          ) : product.stock <= 5 ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              {t("product.lowStock", { count: product.stock })}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
