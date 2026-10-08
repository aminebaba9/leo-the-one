import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import OrdersTable from "@/app/admin/(panel)/orders/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const store = await getSettings();
  const { t } = await getT();
  const items = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.orders.title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {t("admin.orders.subtitle", { count: items.length })}
        </p>
      </div>
      <div className="rounded-3xl border border-line bg-white p-4 sm:p-6">
        <OrdersTable orders={items} whatsappNumber={store.whatsappNumber} />
      </div>
    </div>
  );
}
