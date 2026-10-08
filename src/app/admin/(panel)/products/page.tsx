import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import ProductsTable from "@/app/admin/(panel)/products/products-table";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { t } = await getT();
  const items = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.products.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("admin.products.subtitle", { count: items.length })}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> {t("admin.products.new")}
        </Link>
      </div>

      <div className="rounded-3xl border border-line bg-white p-4 sm:p-6">
        {items.length > 0 ? (
          <ProductsTable products={items} />
        ) : (
          <div className="py-16 text-center">
            <p className="font-display text-lg font-bold">{t("admin.products.empty")}</p>
            <p className="mt-1 text-sm text-muted">{t("admin.products.emptyHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
