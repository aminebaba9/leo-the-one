import Link from "next/link";
import type { StoreSettings } from "@/db/schema";
import LanguageSwitcher from "@/lib/i18n/language-switcher";
import { getT } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

interface HeaderProps {
  store: StoreSettings;
}

export default async function Header({ store }: HeaderProps) {
  const { t } = await getT();
  const wa = whatsappLink(
    store.whatsappNumber,
    t("whatsapp.hello", { store: store.storeName }),
  );

  return (
    <header className="sticky top-0 z-50">
      {store.announcement ? (
        <div className="animated-gradient bg-accent text-center text-xs font-semibold uppercase tracking-widest text-white py-2">
          {store.announcement}
        </div>
      ) : null}
      <div className="border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="font-display text-xl font-black tracking-tight">
            LEO&apos;S<span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold uppercase tracking-wider md:flex">
            <Link href="/shop" className="transition-colors hover:text-accent">
              {t("nav.shop")}
            </Link>
            <Link href="/shop?category=tshirt" className="transition-colors hover:text-accent">
              {t("nav.tshirts")}
            </Link>
            <Link href="/shop?category=hoodie" className="transition-colors hover:text-accent">
              {t("nav.hoodies")}
            </Link>
            <Link href="/combos" className="transition-colors hover:text-accent">
              {t("nav.combos")}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent sm:flex"
            >
              <MessageCircle className="h-4 w-4" />
              {t("nav.whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
