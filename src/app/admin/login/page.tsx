"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/locale-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocale();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = searchParams.get("next") ?? "/admin";
        router.push(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? t("admin.login.error"));
      }
    } catch {
      setError(t("admin.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-3xl bg-paper p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
        <Lock className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-black">
        LEO&apos;S<span className="text-accent">.</span> admin
      </h1>
      <p className="mt-2 text-center text-sm text-muted">{t("admin.login.subtitle")}</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("admin.login.password")}
        className="mt-6 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
      />
      {error ? <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t("admin.login.submit")}
      </button>
      <p className="mt-5 text-center text-xs text-muted">
        {locale === "ar"
          ? "كلمة المرور تُحدد عبر متغير البيئة ADMIN_PASSWORD."
          : "Le mot de passe est défini via la variable d'environnement ADMIN_PASSWORD."}
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
