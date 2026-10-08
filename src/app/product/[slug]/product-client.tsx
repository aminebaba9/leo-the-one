"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, StoreSettings } from "@/db/schema";
import { cn, discountPercent, formatDZD, categoryLabel } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { translateColor } from "@/lib/i18n";
import { computeShippingFee } from "@/lib/shipping";
import { isValidAlgerianPhone, whatsappLink } from "@/lib/whatsapp";
import { buildProductMessage } from "@/lib/whatsapp";
import { trackInitiateCheckout, trackPurchase, trackViewContent } from "@/lib/pixels";
import { ChevronBack } from "@/components/dir-arrow";
import { WILAYAS, formatWilayaLabel, getWilayaDisplayName } from "@/lib/wilayas";
import {
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Tag,
  Truck,
} from "lucide-react";

interface ProductClientProps {
  product: Product;
  upsell?: Product;
  store: StoreSettings;
}

export default function ProductClient({ product, upsell, store }: ProductClientProps) {
  const router = useRouter();
  const { t, locale } = useLocale();

  // ---- product choices ----
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [color, setColor] = useState(product.colors[0] ?? "Black");
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  // ---- upsell add-on ----
  const [withUpsell, setWithUpsell] = useState(false);

  // ---- customer info ----
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // ---- coupon ----
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const images = useMemo(
    () => (product.images.length > 0 ? product.images : ["/images/hero.png"]),
    [product.images],
  );

  const off = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  // ---- totals (bundle -10% + coupon, same rules as the server) ----
  const BUNDLE_RATE = 0.1;
  const itemsTotal = product.price * qty + (withUpsell && upsell ? upsell.price * qty : 0);
  const bundleDiscount =
    withUpsell && upsell ? Math.round((product.price + upsell.price) * BUNDLE_RATE) * qty : 0;
  const discount = Math.min(bundleDiscount + couponDiscount, itemsTotal);
  const shippingFee = wilaya
    ? computeShippingFee(store, wilaya, itemsTotal - discount)
    : null;
  const total = itemsTotal - discount + (shippingFee ?? 0);

  useEffect(() => {
    trackViewContent({
      value: product.price,
      currency: "DZD",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      content_ids: [product.id],
      content_type: "product",
      content_name: product.name,
    });
  }, [product.id, product.name, product.price]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(coupon.trim())}&subtotal=${itemsTotal}`,
      );
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discount);
        setCouponMessage(t("cart.couponApplied", { amount: formatDZD(data.discount, locale) }));
      } else {
        setCouponDiscount(0);
        setCouponMessage(data.message ?? t("cart.couponInvalid"));
      }
    } catch {
      setCouponMessage(t("cart.couponError"));
    }
  };

  const orderOnWhatsapp = () => {
    const link = whatsappLink(
      store.whatsappNumber,
      buildProductMessage({
        name: `${product.name} (${translateColor(t, color)} / ${size})`,
        price: product.price,
        color,
        size,
        qty,
        locale,
      }),
    );
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (outOfStock) return setError(t("product.outOfStock"));
    if (!customerName.trim()) return setError(t("checkout.errName"));
    if (!isValidAlgerianPhone(phone)) return setError(t("checkout.errPhone"));
    if (!wilaya) return setError(t("checkout.errWilaya"));
    if (!address.trim()) return setError(t("checkout.errAddress"));

    setSubmitting(true);
    try {
      const items = [
        {
          productId: product.id,
          size,
          color,
          qty,
        },
      ];
      if (withUpsell && upsell) {
        items.push({ productId: upsell.id, size, color, qty: 1 });
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          wilaya,
          address: address.trim(),
          notes: notes.trim(),
          items,
          couponCode: couponDiscount > 0 ? coupon.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("checkout.errSubmit"));
        setSubmitting(false);
        return;
      }

      const order = data.order;

      trackPurchase({
        value: order.total,
        currency: "DZD",
        contents: items.map((i) => ({
          id: i.productId,
          quantity: i.qty,
          item_price: i.productId === product.id ? product.price : (upsell?.price ?? 0),
        })),
        num_items: items.reduce((s, i) => s + i.qty, 0),
      });
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "Purchase",
          eventId: order.orderNumber,
          value: order.total,
          currency: "DZD",
          contents: items.map((i) => ({
            id: i.productId,
            quantity: i.qty,
            item_price: i.productId === product.id ? product.price : (upsell?.price ?? 0),
          })),
          phone: order.phone,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      }).catch(() => undefined);

      router.push(`/order/${order.id}`);
    } catch {
      setError(t("checkout.errGeneric"));
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent";
  const labelClass = "text-xs font-bold uppercase tracking-[0.2em] text-muted";

  return (
    <div className="space-y-12">
      {/* ============ 1. Product ============ */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper-2 lg:sticky lg:top-24">
            {off > 0 ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1 text-xs font-black text-white">
                {t("product.off", { percent: off })}
              </span>
            ) : null}
            {product.isCombo ? (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-ink px-3 py-1 text-xs font-black uppercase tracking-wider text-lime">
                {t("product.comboDeal")}
              </span>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[imageIndex]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-2xl border-2 transition-colors",
                    imageIndex === i ? "border-accent" : "border-line hover:border-ink/40",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info: price, colour, size */}
        <div>
          <div
            id="order"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-muted"
          >
            <ChevronBack className="h-3.5 w-3.5" />
            {categoryLabel(t, product.category)}
          </div>

          <h1 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-muted">{t("product.reviews")}</span>
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black">{formatDZD(product.price, locale)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="text-lg text-muted line-through">
                  {formatDZD(product.compareAtPrice, locale)}
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">
                  {t("product.save", { amount: formatDZD(product.compareAtPrice - product.price, locale) })}
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {/* Colour */}
          {product.colors.length > 0 ? (
            <div className="mt-7">
              <p className={labelClass}>{t("product.color", { color: translateColor(t, color) })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                      color === c
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-white hover:border-ink",
                    )}
                  >
                    {translateColor(t, c)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Size */}
          {product.sizes.length > 0 ? (
            <div className="mt-6">
              <p className={labelClass}>{t("product.size", { size })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      "h-11 min-w-11 rounded-full border px-4 text-sm font-bold transition-colors",
                      size === s
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-white hover:border-ink",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity */}
          <div className="mt-7">
            <p className={labelClass}>{t("product.quantity")}</p>
            <div className="mt-3 inline-flex items-center rounded-full border border-line bg-white">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="flex h-11 w-11 items-center justify-center hover:text-accent"
                aria-label={t("product.decrease")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((v) => Math.min(product.stock || 99, v + 1))}
                className="flex h-11 w-11 items-center justify-center hover:text-accent"
                aria-label={t("product.increase")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold">
              {outOfStock ? (
                <span className="uppercase tracking-wider text-rose-500">{t("product.outOfStock")}</span>
              ) : product.stock <= 5 ? (
                <span className="uppercase tracking-wider text-amber-600">
                  {t("product.lowStock", { count: product.stock })}
                </span>
              ) : (
                <span className="uppercase tracking-wider text-emerald-600">{t("product.inStock")}</span>
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#order-form"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.01]"
            >
              {t("orderForm.cta")} — {formatDZD(product.price * qty, locale)}
            </a>
            <button
              type="button"
              onClick={orderOnWhatsapp}
              disabled={outOfStock}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-500 px-6 py-4 text-sm font-bold uppercase tracking-wider text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" /> {t("product.orderWhatsapp")}
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl border border-line bg-paper-2/70 p-5 text-sm sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t("product.deliveryBy", {
                company: store.deliveryCompany,
                fee: formatDZD(store.deliveryBaseFee, locale),
                threshold: formatDZD(store.freeShippingThreshold, locale),
              })}
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t("product.codPay")}
            </p>
          </div>
        </div>
      </div>

      {/* ============ 2. Order form (below the product) ============ */}
      <form
        id="order-form"
        onSubmit={submit}
        className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_rgba(6,43,35,0.08)]"
      >
        <div className="bg-ink px-6 py-5 text-paper sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">
            {t("orderForm.badge")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">
            {t("orderForm.title")}
          </h2>
          <p className="mt-1 text-sm text-paper/70">{t("orderForm.subtitle")}</p>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
          {/* --- Fields --- */}
          <div className="space-y-5">
            {/* Upsell add-on */}
            {upsell && !upsell.isCombo ? (
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-3xl border-2 p-4 transition-colors",
                  withUpsell ? "border-accent bg-accent/5" : "border-line bg-paper-2/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={withUpsell}
                  onChange={(e) => {
                    setWithUpsell(e.target.checked);
                    if (e.target.checked) {
                      trackInitiateCheckout({
                        value: itemsTotal,
                        currency: "DZD",
                        contents: [
                          { id: product.id, quantity: qty, item_price: product.price },
                          { id: upsell.id, quantity: 1, item_price: upsell.price },
                        ],
                        num_items: qty + 1,
                      });
                    }
                  }}
                  className="h-5 w-5 shrink-0 accent-accent"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upsell.images[0] ?? "/images/hero.png"}
                  alt={upsell.name}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />
                <span className="flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-accent">
                    {t("orderForm.upsellBadge")}
                  </span>
                  <span className="block font-display text-sm font-bold leading-snug">
                    {t("orderForm.upsellAdd", { name: upsell.name })}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold text-muted">
                    +{formatDZD(upsell.price, locale)} · {t("orderForm.upsellSave")}
                  </span>
                </span>
              </label>
            ) : null}

            <div>
              <label className={labelClass}>{t("checkout.name")}</label>
              <input
                className={inputClass}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t("checkout.namePlaceholder")}
                autoComplete="name"
              />
            </div>

            <div>
              <label className={labelClass}>{t("checkout.phone")}</label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("checkout.phonePlaceholder")}
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className={labelClass}>{t("checkout.wilaya")}</label>
              <select
                className={inputClass}
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
              >
                <option value="">{t("checkout.wilayaPlaceholder")}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.name}>
                    {formatWilayaLabel(w, locale)}
                  </option>
                ))}
              </select>
              {shippingFee !== null ? (
                <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <Truck className="h-3.5 w-3.5" />
                  {shippingFee === 0
                    ? t("checkout.freeShip")
                    : t("checkout.shipTo", { wilaya: getWilayaDisplayName(wilaya, locale), fee: formatDZD(shippingFee, locale) })}
                </p>
              ) : null}
            </div>

            <div>
              <label className={labelClass}>{t("checkout.address")}</label>
              <textarea
                className={inputClass}
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("checkout.addressPlaceholder")}
              />
            </div>

            <div>
              <label className={labelClass}>{t("checkout.notes")}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("checkout.notesPlaceholder")}
              />
            </div>

            {/* Coupon */}
            <div>
              <label className={labelClass}>{t("orderForm.coupon")}</label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder={t("cart.couponPlaceholder")}
                    className="w-full rounded-full border border-line py-2.5 pl-9 pr-3 text-sm font-bold uppercase tracking-wider outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent"
                >
                  {t("cart.apply")}
                </button>
              </div>
              {couponMessage ? (
                <p className="mt-2 text-xs font-semibold text-muted">{couponMessage}</p>
              ) : null}
            </div>
          </div>

          {/* --- Summary --- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-paper-2/50 p-6">
              <h3 className="font-display text-lg font-bold">{t("checkout.yourOrder")}</h3>

              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-bold leading-snug">{product.name}</p>
                    <p className="text-xs text-muted">
                      {translateColor(t, color)} · {size} × {qty}
                    </p>
                  </div>
                  <span className="text-sm font-black">
                    {formatDZD(product.price * qty, locale)}
                  </span>
                </li>
                {withUpsell && upsell ? (
                  <li className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upsell.images[0] ?? "/images/hero.png"}
                      alt={upsell.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-bold leading-snug">{upsell.name}</p>
                      <p className="text-xs text-muted">
                        {translateColor(t, upsell.colors[0] ?? color)} ·{" "}
                        {upsell.sizes[0] ?? size} × 1
                      </p>
                    </div>
                    <span className="text-sm font-black">{formatDZD(upsell.price, locale)}</span>
                  </li>
                ) : null}
              </ul>

              <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">{t("cart.subtotal")}</dt>
                  <dd className="font-bold">{formatDZD(itemsTotal, locale)}</dd>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <dt className="font-semibold">{t("cart.discount")}</dt>
                    <dd className="font-bold">-{formatDZD(discount, locale)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-muted">{t("cart.delivery")}</dt>
                  <dd className="font-bold">
                    {shippingFee === null
                      ? "—"
                      : shippingFee === 0
                        ? t("order.free")
                        : formatDZD(shippingFee, locale)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base">
                  <dt className="font-bold">{t("cart.total")}</dt>
                  <dd className="font-black">{formatDZD(total, locale)}</dd>
                </div>
              </dl>

              {store.freeShippingThreshold > 0 &&
              itemsTotal - discount >= store.freeShippingThreshold ? (
                <p className="mt-4 rounded-2xl bg-lime/30 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  {t("checkout.freeGot")}
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || outOfStock}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.01] disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("checkout.placing")}
                  </>
                ) : (
                  <>{t("checkout.placeOrder", { amount: formatDZD(total, locale) })}</>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {t("checkout.confirmNote")}
              </p>
            </div>
          </aside>
        </div>
      </form>

      {/* success tick used after add-on toggle */}
      <span className="hidden">
        <Check />
      </span>
    </div>
  );
}
