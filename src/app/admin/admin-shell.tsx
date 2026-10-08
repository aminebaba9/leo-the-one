"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Tags,
  LogOut,
  Store,
  Plus,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/locale-provider";
import LanguageSwitcher from "@/lib/i18n/language-switcher";

const NAV_KEYS = [
  { href: "/admin", labelKey: "admin.nav.dashboard", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "admin.nav.products", icon: Package },
  { href: "/admin/products/new", labelKey: "admin.nav.newProduct", icon: Plus },
  { href: "/admin/orders", labelKey: "admin.nav.orders", icon: ShoppingCart },
  { href: "/admin/coupons", labelKey: "admin.nav.coupons", icon: Tags },
  { href: "/admin/settings", labelKey: "admin.nav.settings", icon: Settings },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper-2 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-line bg-ink text-paper">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="font-display text-lg font-black">
            LEO&apos;S<span className="text-accent">.</span>
            <span className="text-sm font-semibold text-paper/60"> admin</span>
          </Link>
          <LanguageSwitcher />
        </div>
        <nav className="space-y-1 p-4">
          {NAV_KEYS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "text-paper/70 hover:bg-white/10 hover:text-paper",
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-1 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-paper/70 transition-colors hover:bg-white/10 hover:text-paper"
          >
            <Store className="h-4 w-4" /> {t("admin.viewStore")}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-paper/70 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" /> {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="min-h-screen overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <span className="font-display text-sm font-black">LEO&apos;S admin</span>
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
            {NAV_KEYS.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full bg-paper-2 px-3 py-1.5">
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
