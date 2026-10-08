import { db } from "@/db";
import { products } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import ProductForm from "@/app/admin/(panel)/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { t } = await getT();
  const all = await db.select().from(products);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.new.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.new.subtitle")}</p>
      </div>
      <ProductForm allProducts={all} />
    </div>
  );
}
