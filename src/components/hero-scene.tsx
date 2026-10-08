"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatDZD } from "@/lib/utils";
import {
  MessageCircle,
  Truck,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ArrowFlow } from "@/components/dir-arrow";

interface HeroSceneProps {
  heroImage: string;
  whatsappLink: string;
  freeShippingLabel: string;
  priceLabel: string;
}

/**
 * Hero with layered 3D motion graphics:
 *  - the whole scene tilts in 3D following the cursor (perspective container)
 *  - floating product cards drift on their own float animation and parallax
 *    at different depths
 *  - a spinning circular badge and animated gradient blobs
 */
export default function HeroScene({
  heroImage,
  whatsappLink,
  freeShippingLabel,
  priceLabel,
}: HeroSceneProps) {
  const { t, locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  };

  const handleLeave = () => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden bg-ink text-paper"
      style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
    >
      {/* animated gradient blobs */}
      <div className="blob absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/45 blur-3xl" />
      <div
        className="blob absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-lime/25 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="blob absolute right-0 top-1/3 h-72 w-72 rounded-full bg-frost/30 blur-3xl"
        style={{ animationDelay: "-11s" }}
      />

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-paper) 1px, transparent 1px), linear-gradient(90deg, var(--color-paper) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28"
        style={{ perspective: "1200px" }}
      >
        <div
          className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]"
          style={{
            transformStyle: "preserve-3d",
            transform:
              "rotateX(calc(var(--my) * -5deg)) rotateY(calc(var(--mx) * 7deg))",
          }}
        >
          {/* Left: copy */}
          <div style={{ transform: "translateZ(40px)" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5 text-lime" />
              {t("hero.badge")}
            </div>

            <h1 className="hero-title mt-6 font-display text-[clamp(3.4rem,9vw,7rem)] font-black leading-[0.95] tracking-tight text-paper">
              LEO&apos;S
            </h1>
            <p className="mt-6 max-w-md text-lg text-paper/75">{t("hero.subtitle")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.03]"
              >
                {t("hero.cta")}
                <ArrowFlow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                <MessageCircle className="h-4 w-4" />
                {t("hero.whatsappCta")}
              </a>
            </div>

            <ul className="mt-10 grid max-w-md gap-4 text-sm text-paper/80 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> {t("hero.wilayas")}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" /> {t("hero.cod")}
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" /> {t("hero.freeOver", { amount: freeShippingLabel })}
              </li>
            </ul>
          </div>

          {/* Right: 3D floating product stack */}
          <div
            className="relative h-[420px] lg:h-[520px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* main product card */}
            <div
              className="absolute inset-x-6 top-6 bottom-10"
              style={{
                transform:
                  "translateZ(60px) translate(calc(var(--mx) * -14px), calc(var(--my) * -10px))",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="floaty relative h-full overflow-hidden rounded-3xl border border-paper/15 bg-ink-2 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={t("hero.productLabel")}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-paper/90 px-4 py-3 text-ink backdrop-blur">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      {t("hero.bestSeller")}
                    </p>
                    <p className="font-display text-sm font-bold">{t("hero.productLabel")}</p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-white">
                    {priceLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* floating mini card 1 */}
            <div
              className="absolute -left-2 top-0 w-36 sm:w-44"
              style={{
                transform:
                  "translateZ(120px) translate(calc(var(--mx) * 26px), calc(var(--my) * 18px))",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="floaty overflow-hidden rounded-2xl border border-paper/20 bg-paper shadow-[0_24px_50px_rgba(0,0,0,0.45)]"
                style={{ animationDelay: "-2s" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/products/tee-sand.png"
                  alt={t("home.tshirtsTitle")}
                  className="aspect-square w-full object-cover"
                />
                <p className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider">
                  {t("nav.tshirts")}
                </p>
              </div>
            </div>

            {/* floating mini card 2 */}
            <div
              className="absolute -right-3 bottom-6 w-32 sm:w-40"
              style={{
                transform:
                  "translateZ(140px) translate(calc(var(--mx) * 34px), calc(var(--my) * 24px))",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="floaty overflow-hidden rounded-2xl border border-paper/20 bg-paper shadow-[0_24px_50px_rgba(0,0,0,0.45)]"
                style={{ animationDelay: "-4s" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/products/hoodie-grey.png"
                  alt={t("home.hoodiesTitle")}
                  className="aspect-square w-full object-cover"
                />
                <p className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider">
                  {t("nav.hoodies")}
                </p>
              </div>
            </div>

            {/* spinning badge */}
            <div
              className="absolute -bottom-2 left-4 h-28 w-28 sm:h-32 sm:w-32"
              style={{
                transform:
                  "translateZ(100px) translate(calc(var(--mx) * 20px), calc(var(--my) * 14px))",
              }}
            >
              <div className="relative h-full w-full rounded-full bg-lime p-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <svg viewBox="0 0 120 120" className="spin-slow h-full w-full">
                  <defs>
                    <path
                      id="leo-circle"
                      d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                    />
                  </defs>
                  <text className="fill-ink font-display text-[10.5px] font-bold uppercase tracking-[2px]">
                    <textPath href="#leo-circle">
                      {locale === "ar"
                        ? "مقاسات واسعة • دفع عند الاستلام • 58 ولاية • Leo's •"
                        : "fits oversized • paiement à la livraison • 58 wilayas • leo's •"}
                    </textPath>
                  </text>
                  <text x="60" y="70" textAnchor="middle" className="fill-ink text-[26px]">
                    ★
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
