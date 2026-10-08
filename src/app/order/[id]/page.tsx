import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { translateColor, translateStatus } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { formatDZD, formatDate, ORDER_STATUSES } from "@/lib/utils";
import OrderActions from "@/app/order/[id]/order-actions";
import { CheckCircle2, Clock, MapPin, Phone, Truck, User } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const { t, locale } = await getT();
  const store = await getSettings();

  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order) notFound();

  const currentStep = Math.max(0, STATUS_STEPS.indexOf(order.status));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-black">{t("order.confirmed")}</h1>
        <p className="mt-2 text-muted">
          {t("order.confirmedText", { number: order.orderNumber })}
        </p>
      </div>

      {/* Tracking steps */}
      <div className="mt-10 rounded-3xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
                    order.status === "cancelled"
                      ? "bg-rose-100 text-rose-600"
                      : i <= currentStep
                        ? "bg-ink text-paper"
                        : "bg-paper-2 text-muted"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {translateStatus(t, step)}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 ? (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    i < currentStep ? "bg-ink" : "bg-paper-2"
                  }`}
                />
              ) : null}
            </div>
          ))}
        </div>
        {order.status === "cancelled" ? (
          <p className="mt-4 text-center text-sm font-bold uppercase tracking-wider text-rose-500">
            {t("order.cancelled")}
          </p>
        ) : null}
      </div>

      {/* Details */}
      <div className="mt-6 rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("order.details")}</h2>
        <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-center gap-2">
            <User className="h-4 w-4 text-accent" /> {order.customerName}
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-accent" /> {order.phone}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" /> {order.wilaya}, {order.address}
          </li>
          <li className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" /> {store.deliveryCompany} · {t("hero.cod")}
          </li>
        </ul>

        <h2 className="mt-8 font-display text-lg font-bold">{t("order.items")}</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image || "/images/hero.png"}
                alt={item.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div className="flex-1 text-sm">
                <p className="font-bold leading-snug">{item.name}</p>
                <p className="text-xs text-muted">
                  {translateColor(t, item.color)} · {item.size} × {item.qty}
                </p>
              </div>
              <span className="text-sm font-black">{formatDZD(item.price * item.qty, locale)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{t("cart.subtotal")}</dt>
            <dd className="font-bold">{formatDZD(order.subtotal, locale)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-emerald-600">
              <dt className="font-semibold">
                {t("cart.discount")} {order.couponCode ? `(${order.couponCode})` : ""}
              </dt>
              <dd className="font-bold">-{formatDZD(order.discount, locale)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted">{t("cart.delivery")}</dt>
            <dd className="font-bold">
              {order.shippingFee === 0 ? t("order.free") : formatDZD(order.shippingFee, locale)}
            </dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-bold">{t("cart.total")}</dt>
            <dd className="font-black">{formatDZD(order.total, locale)}</dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-muted">
          {formatDate(order.createdAt, locale)} · {translateStatus(t, order.status)}
        </p>

        <OrderActions order={order} whatsappNumber={store.whatsappNumber} />
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
        <Clock className="h-4 w-4" />
        {t("order.eta")}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent"
        >
          {t("order.continue")}
        </Link>
      </div>
    </div>
  );
}
