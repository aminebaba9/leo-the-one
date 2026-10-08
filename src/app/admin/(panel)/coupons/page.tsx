import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import CouponManager from "@/app/admin/(panel)/coupons/coupon-manager";
import { ArrowFlow } from "@/components/dir-arrow";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const { t } = await getT();
  const items = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.coupons.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.coupons.intro")}</p>
        <Link
          href="/admin/products"
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
        >
          {t("admin.coupons.manageProducts")} <ArrowFlow className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-3xl border border-dashed border-line bg-white p-5 text-sm text-muted">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Layers className="h-4 w-4 text-accent" /> {t("admin.coupons.howTitle")}
        </p>
        <p className="mt-1">{t("admin.coupons.howText")}</p>
      </div>

      <CouponManager coupons={items} />
    </div>
  );
}
