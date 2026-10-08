"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/db/schema";
import { formatDZD, cn, categoryLabel } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Pencil, Power, Star, Trash2 } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [busy, setBusy] = useState<number | null>(null);

  const toggle = async (product: Product, field: "active" | "featured") => {
    setBusy(product.id);
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !product[field] }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async (product: Product) => {
    if (!window.confirm(t("admin.ptable.deleteConfirm", { name: product.name }))) return;
    setBusy(product.id);
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-muted">
            <th className="pb-3 pr-4 font-bold">{t("admin.ptable.product")}</th>
            <th className="pb-3 pr-4 font-bold">{t("admin.ptable.category")}</th>
            <th className="pb-3 pr-4 font-bold">{t("admin.ptable.price")}</th>
            <th className="pb-3 pr-4 font-bold">{t("admin.ptable.stock")}</th>
            <th className="pb-3 pr-4 font-bold">{t("admin.ptable.flags")}</th>
            <th className="pb-3 text-right font-bold">{t("admin.ptable.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className={cn("border-t border-line", busy === product.id && "opacity-50")}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0] ?? "/images/hero.png"}
                    alt={product.name}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold leading-snug">{product.name}</p>
                    <p className="font-mono text-[11px] text-muted">/{product.slug}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">{categoryLabel(t, product.category)}</td>
              <td className="py-3 pr-4 font-bold">{formatDZD(product.price, locale)}</td>
              <td className="py-3 pr-4">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
                    product.stock === 0
                      ? "bg-rose-100 text-rose-600"
                      : product.stock <= 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {product.stock}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggle(product, "active")}
                    title={product.active ? t("admin.ptable.deactivate") : t("admin.ptable.activate")}
                    className={cn(
                      "rounded-lg p-1.5 transition-colors",
                      product.active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-paper-2 text-muted hover:bg-paper-2/70",
                    )}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(product, "featured")}
                    title={product.featured ? t("admin.ptable.unfeature") : t("admin.ptable.feature")}
                    className={cn(
                      "rounded-lg p-1.5 transition-colors",
                      product.featured
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-paper-2 text-muted hover:bg-paper-2/70",
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="py-3 text-right">
                <div className="inline-flex gap-1">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-lg bg-ink p-1.5 text-paper transition-colors hover:bg-accent"
                    title={t("admin.ptable.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100"
                    title={t("admin.ptable.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
