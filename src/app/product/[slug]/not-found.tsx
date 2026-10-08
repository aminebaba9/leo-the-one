import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function ProductNotFound() {
  const { t } = await getT();
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-32 text-center">
      <p className="font-display text-7xl font-black text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-black">{t("product.notFound")}</h1>
      <p className="mt-2 text-muted">{t("product.notFoundHint")}</p>
      <Link
        href="/shop"
        className="mt-8 rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent"
      >
        {t("product.backToShop")}
      </Link>
    </div>
  );
}
