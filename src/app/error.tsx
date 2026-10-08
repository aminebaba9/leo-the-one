"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-provider";

/** Translated error boundary — replaces Next's default English error page. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const ar = locale === "ar";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="font-display text-6xl font-black text-accent">✕</p>
      <h1 className="mt-6 font-display text-2xl font-black">
        {ar ? "حدث خطأ ما" : "Une erreur est survenue"}
      </h1>
      <p className="mt-2 text-muted">
        {ar
          ? "نعمل على إصلاح المشكلة. أعد المحاولة أو راسلنا على واتساب."
          : "On répare ça. Réessaie, ou écris-nous sur WhatsApp."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent"
        >
          {ar ? "إعادة المحاولة" : "Réessayer"}
        </button>
        <a
          href="/"
          className="rounded-full border border-line bg-white px-7 py-4 text-sm font-bold uppercase tracking-wider transition-colors hover:border-ink"
        >
          {ar ? "الصفحة الرئيسية" : "Accueil"}
        </a>
      </div>
    </div>
  );
}
