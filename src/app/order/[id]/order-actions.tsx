"use client";

import { useState } from "react";
import type { Order } from "@/db/schema";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Check, Copy, MessageCircle } from "lucide-react";

interface OrderActionsProps {
  order: Order;
  whatsappNumber: string;
}

export default function OrderActions({ order, whatsappNumber }: OrderActionsProps) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const message = buildOrderMessage({
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
  });

  const link = whatsappLink(whatsappNumber, message);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-600"
      >
        <MessageCircle className="h-4 w-4" /> {t("order.sendWhatsapp")}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-7 py-4 text-sm font-bold uppercase tracking-wider transition-colors hover:border-ink"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        {copied ? t("order.copied") : t("order.copy")}
      </button>
    </div>
  );
}
