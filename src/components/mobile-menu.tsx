"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/locale-provider";
import { Menu, X, MessageCircle } from "lucide-react";

interface MobileMenuProps {
  whatsappLink: string;
}

export default function MobileMenu({ whatsappLink }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useT();

  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-paper-2"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-[65px] z-40 border-b border-line bg-paper/95 p-6 backdrop-blur-lg shadow-xl">
          <nav className="flex flex-col gap-4 text-base font-bold uppercase tracking-wider">
            <Link
              href="/shop"
              onClick={close}
              className="py-2 transition-colors hover:text-accent"
            >
              {t("nav.shop")}
            </Link>
            <Link
              href="/shop?category=tshirt"
              onClick={close}
              className="py-2 transition-colors hover:text-accent"
            >
              {t("nav.tshirts")}
            </Link>
            <Link
              href="/shop?category=hoodie"
              onClick={close}
              className="py-2 transition-colors hover:text-accent"
            >
              {t("nav.hoodies")}
            </Link>
            <Link
              href="/combos"
              onClick={close}
              className="py-2 transition-colors hover:text-accent"
            >
              {t("nav.combos")}
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4" />
              {t("nav.whatsapp")}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
