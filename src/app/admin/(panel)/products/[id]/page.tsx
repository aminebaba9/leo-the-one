import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import ProductForm from "@/app/admin/(panel)/products/product-form";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const { t } = await getT();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);

  if (!product) notFound();

  const all = await db.select().from(products);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.edit.title")}</h1>
        <p className="mt-1 text-sm text-muted">{product.name}</p>
      </div>
      <ProductForm product={product} allProducts={all} />
    </div>
  );
}
