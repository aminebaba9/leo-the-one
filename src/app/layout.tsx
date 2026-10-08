import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Unbounded, Space_Grotesk, Cairo, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getLocale, getT } from "@/lib/i18n/server";
import { localeDir } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import PixelScripts from "@/components/pixel-scripts";
import PageViewTracker from "@/components/pageview-tracker";
import Header from "@/components/header";
import Footer from "@/components/footer";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

// Arabic fonts (used when dir="rtl")
const displayAr = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["500", "700", "900"],
  variable: "--font-display-ar",
});

const bodyAr = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-ar",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: ["oversized t-shirt", "hoodie", "Algérie", "streetwear", "Leo's", "cash on delivery"],
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await getSettings();
  const locale = await getLocale();
  const dir = localeDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} ${displayAr.variable} ${bodyAr.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <PixelScripts
          facebookPixelId={store.facebookPixelId}
          tiktokPixelId={store.tiktokPixelId}
        />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <LocaleProvider initialLocale={locale}>
          <Header store={store} />
          <main>{children}</main>
          <Footer store={store} />
        </LocaleProvider>
      </body>
    </html>
  );
}
