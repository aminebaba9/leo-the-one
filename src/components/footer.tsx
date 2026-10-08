import Link from "next/link";
import type { StoreSettings } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";
import { formatDZD } from "@/lib/utils";
import { MessageCircle, MapPin, Truck, ShieldCheck } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface FooterProps {
  store: StoreSettings;
}

export default async function Footer({ store }: FooterProps) {
  const { t, locale } = await getT();
  const wa = whatsappLink(
    store.whatsappNumber,
    t("whatsapp.hello", { store: store.storeName }),
  );

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-black">
            LEO&apos;S<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-paper/70">{store.storeTagline}</p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61587435183085"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-3 transition-colors hover:bg-accent"
              aria-label={t("footer.facebook")}
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-3 transition-colors hover:bg-accent"
              aria-label={t("footer.whatsapp")}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-3 transition-colors hover:bg-accent"
              aria-label={t("footer.instagram")}
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-paper/50">{t("footer.shopTitle")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-accent">{t("footer.allProducts")}</Link></li>
            <li><Link href="/shop?category=tshirt" className="hover:text-accent">{t("footer.tshirts")}</Link></li>
            <li><Link href="/shop?category=hoodie" className="hover:text-accent">{t("footer.hoodies")}</Link></li>
            <li><Link href="/combos" className="hover:text-accent">{t("footer.combos")}</Link></li>
            <li>
              <Link
                href="/download"
                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
              >
                {t("footer.download")} ↓
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-paper/50">{t("footer.deliveryTitle")}</p>
          <ul className="mt-4 space-y-3 text-sm text-paper/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t("footer.allWilayas")}
            </li>
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t("footer.deliveryFrom", {
                company: store.deliveryCompany,
                fee: formatDZD(store.deliveryBaseFee, locale),
              })}
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t("footer.freeOver", { threshold: formatDZD(store.freeShippingThreshold, locale) })}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-paper/50">{t("footer.contactTitle")}</p>
          <ul className="mt-4 space-y-3 text-sm text-paper/80">
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              WhatsApp: +{store.whatsappNumber.replace(/^213/, "213 ")}
            </li>
            <li>{t("footer.codNote")}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-paper/50">
        {t("footer.madeIn", { year: new Date().getFullYear(), store: store.storeName })}
      </div>
    </footer>
  );
}
