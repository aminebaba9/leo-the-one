import Link from "next/link";
import { count, desc, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { translateStatus } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { formatDZD, formatDate, ORDER_STATUSES, cn } from "@/lib/utils";
import { ArrowFlow } from "@/components/dir-arrow";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { t, locale } = await getT();

  const [productStats] = await db
    .select({
      total: count(products.id),
      lowStock: sql<number>`count(*) filter (where ${products.stock} <= 5 and ${products.stock} > 0)`,
      outOfStock: sql<number>`count(*) filter (where ${products.stock} = 0)`,
    })
    .from(products);

  const [revenueStats] = await db
    .select({
      totalOrders: count(orders.id),
      revenue: sql<string>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(ne(orders.status, "cancelled"));

  const [pendingStats] = await db
    .select({ pending: count(orders.id) })
    .from(orders)
    .where(sql`${orders.status} = 'pending'`);

  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8);

  const lowStock = await db
    .select()
    .from(products)
    .where(sql`${products.stock} <= 5`)
    .orderBy(products.stock)
    .limit(6);

  const cards = [
    {
      label: t("admin.dash.revenue"),
      value: formatDZD(Number(revenueStats?.revenue ?? 0), locale),
      icon: DollarSign,
      hint: t("admin.dash.ordersHint", { count: revenueStats?.totalOrders ?? 0 }),
    },
    {
      label: t("admin.dash.pending"),
      value: String(pendingStats?.pending ?? 0),
      icon: ShoppingCart,
      hint: t("admin.dash.pendingHint"),
    },
    {
      label: t("admin.dash.products"),
      value: String(productStats?.total ?? 0),
      icon: Package,
      hint: t("admin.dash.productsHint"),
    },
    {
      label: t("admin.dash.lowStock"),
      value: String(Number(productStats?.lowStock ?? 0) + Number(productStats?.outOfStock ?? 0)),
      icon: TriangleAlert,
      hint: t("admin.dash.lowStockHint"),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.dash.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.dash.welcome")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">{card.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-black">{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <div className="rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{t("admin.dash.recent")}</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
            >
              {t("admin.dash.allOrders")} <ArrowFlow className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-muted">
                  <th className="pb-3 pr-4 font-bold">{t("admin.dash.thOrder")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.dash.thCustomer")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.dash.thWilaya")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.dash.thTotal")}</th>
                  <th className="pb-3 font-bold">{t("admin.dash.thStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const status = ORDER_STATUSES.find((s) => s.value === order.status);
                  return (
                    <tr key={order.id} className="border-t border-line">
                      <td className="py-3 pr-4 font-mono text-xs font-bold">{order.orderNumber}</td>
                      <td className="py-3 pr-4">{order.customerName}</td>
                      <td className="py-3 pr-4 text-muted">{order.wilaya}</td>
                      <td className="py-3 pr-4 font-bold">{formatDZD(order.total, locale)}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white",
                            status?.color ?? "bg-slate-500",
                          )}
                        >
                          {status ? translateStatus(t, status.value) : order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{t("admin.dash.lowStockTitle")}</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
            >
              {t("admin.dash.manage")} <ArrowFlow className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <li className="text-sm text-muted">{t("admin.dash.wellStocked")}</li>
            ) : (
              lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0] ?? "/images/hero.png"}
                    alt={p.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-bold leading-snug">{p.name}</p>
                    <p className="text-xs text-muted">{formatDate(p.createdAt, locale)}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
                      p.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {p.stock === 0 ? t("admin.dash.out") : t("admin.dash.left", { count: p.stock })}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
