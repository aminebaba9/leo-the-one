import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getT } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { formatDZD } from "@/lib/utils";
import ProductCard from "@/components/product-card";
import ScrollReveal from "@/components/scroll-reveal";
import Marquee from "@/components/marquee";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CombosPage() {
  const store = await getSettings();
  const { t, locale } = await getT();

  const combos = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.isCombo, true)))
    .orderBy(products.price);

  const allIds = [...new Set(combos.flatMap((c) => c.comboProductIds))];
  const members = allIds.length
    ? await db.select().from(products).where(inArray(products.id, allIds))
    : [];
  const memberNames = new Map(members.map((m) => [m.id, m.name]));

  return (
    <>
      <section className="bg-ink py-16 text-paper">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">{t("combos.eyebrow")}</p>
            <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">{t("combos.title")}</h1>
            <p className="mt-4 max-w-xl text-paper/70">
              {t("combos.subtitle", { threshold: formatDZD(store.freeShippingThreshold, locale) })}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <Marquee
        dark
        items={[t("marquee.saveCombos"), t("marquee.mix"), t("marquee.oneFee"), t("marquee.cod")]}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {combos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo, i) => (
              <ScrollReveal key={combo.id} delay={i * 80}>
                <div className="relative">
                  <ProductCard product={combo} />
                  {combo.comboProductIds.length > 0 ? (
                    <div className="pointer-events-none absolute left-4 right-4 top-[calc(4/5*100%-70px)] z-10 flex items-center gap-2 rounded-2xl bg-ink/90 px-4 py-3 text-xs text-paper backdrop-blur">
                      <Layers className="h-4 w-4 shrink-0 text-lime" />
                      <span className="font-semibold">
                        {t("combos.includes", {
                          list: combo.comboProductIds
                            .map((id) => memberNames.get(id))
                            .filter(Boolean)
                            .join(" + "),
                        })}
                      </span>
                    </div>
                  ) : null}
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white py-24 text-center">
            <Layers className="h-12 w-12 text-muted" />
            <p className="mt-4 font-display text-lg font-bold">{t("combos.empty")}</p>
            <p className="mt-1 text-sm text-muted">{t("combos.emptyHint")}</p>
          </div>
        )}
      </section>
    </>
  );
}
