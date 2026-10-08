import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { formatDZD } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import HeroScene from "@/components/hero-scene";
import Marquee from "@/components/marquee";
import ProductCard from "@/components/product-card";
import ScrollReveal from "@/components/scroll-reveal";
import { ArrowFlow } from "@/components/dir-arrow";
import { MessageCircle, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getSettings();
  const { t, locale } = await getT();

  const featured = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.featured, true)))
    .orderBy(desc(products.createdAt))
    .limit(4);

  const combos = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.isCombo, true)))
    .orderBy(desc(products.createdAt))
    .limit(3);

  const wa = whatsappLink(
    store.whatsappNumber,
    t("whatsapp.hello", { store: store.storeName }),
  );

  const perks = [
    {
      icon: Truck,
      title: t("home.perksTitle1"),
      text: t("home.perksText1", {
        company: store.deliveryCompany,
        fee: formatDZD(store.deliveryBaseFee, locale),
      }),
    },
    {
      icon: ShieldCheck,
      title: t("home.perksTitle2"),
      text: t("home.perksText2"),
    },
    {
      icon: RefreshCw,
      title: t("home.perksTitle3"),
      text: t("home.perksText3"),
    },
    {
      icon: MessageCircle,
      title: t("home.perksTitle4"),
      text: t("home.perksText4"),
    },
  ];

  return (
    <>
      <HeroScene
        heroImage="/images/hero.png"
        whatsappLink={wa}
        freeShippingLabel={formatDZD(store.freeShippingThreshold, locale)}
        priceLabel={formatDZD(5900, locale)}
      />

      <Marquee
        items={[
          t("marquee.freeDelivery", { amount: formatDZD(store.freeShippingThreshold, locale) }),
          t("marquee.cod"),
          t("marquee.wilayas"),
          t("marquee.fits"),
          t("marquee.newDrop"),
        ]}
      />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {t("home.eyebrowCategories")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                {t("home.pickFit")}
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-accent sm:flex"
            >
              {t("home.viewAll")} <ArrowFlow className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <ScrollReveal delay={80}>
            <Link
              href="/shop?category=tshirt"
              className="group relative block overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/tee-black.png"
                alt={t("home.tshirtsTitle")}
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-paper">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">
                  {t("home.from", { amount: formatDZD(3200, locale) })}
                </p>
                <p className="font-display text-2xl font-black">{t("home.tshirtsTitle")}</p>
              </div>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <Link
              href="/shop?category=hoodie"
              className="group relative block overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/hoodie-black.png"
                alt={t("home.hoodiesTitle")}
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-paper">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">
                  {t("home.from", { amount: formatDZD(5900, locale) })}
                </p>
                <p className="font-display text-2xl font-black">{t("home.hoodiesTitle")}</p>
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-paper-2/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                  {t("home.eyebrowBest")}
                </p>
                <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                  {t("home.featuredTitle")}
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-accent sm:flex"
              >
                {t("home.shopAll")} <ArrowFlow className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Combos */}
      {combos.length > 0 ? (
        <section className="bg-ink py-20 text-paper">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">
                    {t("home.eyebrowCombos")}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                    {t("home.combosTitle")}
                  </h2>
                </div>
                <Link
                  href="/combos"
                  className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-lime sm:flex"
                >
                  {t("home.allCombos")} <ArrowFlow className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((combo, i) => (
                <ScrollReveal key={combo.id} delay={i * 80}>
                  <ProductCard product={combo} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk, i) => (
            <ScrollReveal key={perk.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-line bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <perk.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{perk.title}</h3>
                <p className="mt-2 text-sm text-muted">{perk.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <ScrollReveal>
          <div className="animated-gradient relative overflow-hidden rounded-3xl bg-accent px-8 py-16 text-center text-white sm:px-16">
            <h2 className="font-display text-3xl font-black sm:text-5xl">
              {t("home.ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">{t("home.ctaText")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper transition-transform hover:scale-[1.03]"
              >
                {t("home.ctaShop")} <ArrowFlow className="h-4 w-4" />
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-7 py-4 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white hover:text-accent"
              >
                <MessageCircle className="h-4 w-4" /> {t("home.ctaWhatsapp")}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
