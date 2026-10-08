"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { Order } from "@/db/schema";
import { ORDER_STATUSES, cn, formatDZD, formatDate } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { translateColor, translateStatus } from "@/lib/i18n";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { ChevronDown, ChevronUp, MessageCircle, Trash2 } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  whatsappNumber: string;
}

export default function OrdersTable({ orders, whatsappNumber }: OrdersTableProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [busy, setBusy] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const updateStatus = async (order: Order, status: string) => {
    setBusy(order.id);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  };

  const markWhatsappSent = async (order: Order) => {
    setBusy(order.id);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappSent: true }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async (order: Order) => {
    if (!window.confirm(t("admin.orders.deleteConfirm", { number: order.orderNumber }))) return;
    setBusy(order.id);
    await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  const filtered = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES.map((s) => s.value)].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              statusFilter === value
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white hover:border-ink",
            )}
          >
            {value === "all" ? t("admin.orders.all") : translateStatus(t, value)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-muted">
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thOrder")}</th>
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thCustomer")}</th>
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thWilaya")}</th>
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thTotal")}</th>
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thStatus")}</th>
              <th className="pb-3 pr-4 font-bold">{t("admin.dash.thDate")}</th>
              <th className="pb-3 text-right font-bold">{t("admin.ptable.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const status = ORDER_STATUSES.find((s) => s.value === order.status);
              const isOpen = expanded === order.id;
              return (
                <Fragment key={order.id}>
                  <tr
                    key={order.id}
                    className={cn("border-t border-line", busy === order.id && "opacity-50")}
                  >
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="flex items-center gap-1 font-mono text-xs font-bold hover:text-accent"
                      >
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.phone}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted">{order.wilaya}</td>
                    <td className="py-3 pr-4 font-bold">{formatDZD(order.total, locale)}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order, e.target.value)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white outline-none",
                          status?.color ?? "bg-slate-500",
                        )}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value} className="text-ink">
                            {translateStatus(t, s.value)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted">
                      {formatDate(order.createdAt, locale)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={whatsappLink(
                            whatsappNumber,
                            buildOrderMessage({
                              orderNumber: order.orderNumber,
                              customerName: order.customerName,
                              phone: order.phone,
                              wilaya: order.wilaya,
                              address: order.address,
                              items: order.items,
                              subtotal: order.subtotal,
                              shippingFee: order.shippingFee,
                              discount: order.discount,
                              total: order.total,
                              notes: order.notes,
                              locale,
                            }),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markWhatsappSent(order)}
                          className={cn(
                            "rounded-lg p-1.5 transition-colors",
                            order.whatsappSent
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-paper-2 text-muted hover:bg-emerald-100 hover:text-emerald-700",
                          )}
                          title={t("admin.orders.sendWhatsapp")}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => remove(order)}
                          className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100"
                          title={t("admin.orders.deleteOrder")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr key={`${order.id}-detail`} className="border-t border-line bg-paper-2/40">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted">{t("admin.orders.items")}</p>
                            <ul className="mt-2 space-y-2">
                              {order.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image || "/images/hero.png"}
                                    alt={item.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                  <span className="flex-1">
                                    {item.name} — {translateColor(t, item.color)} / {item.size} × {item.qty}
                                  </span>
                                  <span className="font-bold">{formatDZD(item.price * item.qty, locale)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted">{t("admin.orders.delivery")}</p>
                            <p className="mt-2 text-sm">
                              {order.address}, {order.wilaya}
                            </p>
                            <p className="mt-2 text-sm text-muted">
                              {t("admin.orders.summaryLine", {
                                subtotal: formatDZD(order.subtotal, locale),
                                discount: formatDZD(order.discount, locale),
                                code: order.couponCode ?? "—",
                                shipping: formatDZD(order.shippingFee, locale),
                              })}
                            </p>
                            {order.notes ? (
                              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                {t("admin.orders.notes", { notes: order.notes })}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t("admin.orders.none")}</p>
      ) : null}
    </div>
  );
}
