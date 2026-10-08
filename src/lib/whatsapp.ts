import type { OrderItem } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { createT, getDictionary, translateColor, type TFunction } from "@/lib/i18n";
import { formatDZD } from "@/lib/utils";

/** Normalizes an Algerian phone number to international format without "+": 213XXXXXXXXX */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00213")) digits = digits.slice(2);
  if (digits.startsWith("213")) return digits;
  if (digits.startsWith("0")) return `213${digits.slice(1)}`;
  return digits;
}

export function isValidAlgerianPhone(raw: string): boolean {
  return /^213[567]\d{8}$/.test(normalizePhone(raw));
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`;
}

interface OrderMessageInput {
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  locale?: Locale;
}

export function buildOrderMessage(order: OrderMessageInput): string {
  const t: TFunction = createT(getDictionary(order.locale ?? "fr"));
  const money = (n: number) => formatDZD(n, order.locale ?? "fr");

  const lines = order.items.map(
    (item) =>
      `• ${item.name} — ${translateColor(t, item.color)} / ${item.size} × ${item.qty} = ${money(item.price * item.qty)}`,
  );
  return [
    t("whatsapp.newOrder"),
    ``,
    t("whatsapp.orderLabel", { number: order.orderNumber }),
    t("whatsapp.name", { value: order.customerName }),
    t("whatsapp.phone", { value: order.phone }),
    t("whatsapp.wilaya", { value: order.wilaya }),
    t("whatsapp.address", { value: order.address }),
    ``,
    t("whatsapp.items"),
    ...lines,
    ``,
    t("whatsapp.subtotal", { amount: money(order.subtotal) }),
    order.discount > 0 ? t("whatsapp.discount", { amount: money(order.discount) }) : null,
    order.shippingFee === 0
      ? t("whatsapp.deliveryFree")
      : t("whatsapp.delivery", { amount: money(order.shippingFee) }),
    t("whatsapp.total", { amount: money(order.total) }),
    order.notes ? `` : null,
    order.notes ? t("whatsapp.notes", { value: order.notes }) : null,
    ``,
    t("whatsapp.payment"),
  ]
    .filter((l) => l !== null)
    .join("\n");
}

interface ProductMessageInput {
  name: string;
  price: number;
  color: string;
  size: string;
  qty: number;
  locale?: Locale;
}

export function buildProductMessage(input: ProductMessageInput): string {
  const t: TFunction = createT(getDictionary(input.locale ?? "fr"));
  const money = (n: number) => formatDZD(n, input.locale ?? "fr");
  return [
    t("whatsapp.productNewOrder"),
    ``,
    t("whatsapp.productLabel", { value: input.name }),
    t("whatsapp.color", { value: translateColor(t, input.color) }),
    t("whatsapp.size", { value: input.size }),
    t("whatsapp.qty", { value: input.qty }),
    t("whatsapp.price", { amount: money(input.price * input.qty) }),
    ``,
    t("whatsapp.productConfirm"),
  ].join("\n");
}

interface CartMessageInput {
  items: Array<{ name: string; color: string; size: string; qty: number; price: number }>;
  total: number;
  locale?: Locale;
}

export function buildCartMessage(input: CartMessageInput): string {
  const t: TFunction = createT(getDictionary(input.locale ?? "fr"));
  const money = (n: number) => formatDZD(n, input.locale ?? "fr");
  const lines = input.items.map(
    (item) =>
      `• ${item.name} — ${translateColor(t, item.color)} / ${item.size} × ${item.qty} = ${money(item.price * item.qty)}`,
  );
  return [
    t("whatsapp.cartNewOrder"),
    ``,
    ...lines,
    ``,
    t("whatsapp.total", { amount: money(input.total) }),
    ``,
    t("whatsapp.cartConfirm"),
  ].join("\n");
}
