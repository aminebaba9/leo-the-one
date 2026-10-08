import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { ArrowBack } from "@/components/dir-arrow";
import {
  Download,
  Terminal,
  Database,
  ShieldCheck,
  MessageCircle,
  BarChart3,
  Truck,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ARCHIVE = "/download/leos-website.zip";

export default async function DownloadPage() {
  const { t, locale } = await getT();
  const ar = locale === "ar";

  const steps = ar
    ? [
        { icon: Package, title: "١. فك الضغط عن الملف", text: "فك ضغط leos-website.zip في مجلد على جهازك." },
        {
          icon: Terminal,
          title: "٢. تثبيت الحزم",
          text: "افتح الطرفية (Terminal) داخل المجلد وشغّل: npm install",
        },
        {
          icon: Database,
          title: "٣. إنشاء قاعدة البيانات",
          text: "أنشئ قاعدة PostgreSQL وضع رابطها في ملف .env (المتغير DATABASE_URL)، ثم شغّل: npx drizzle-kit push",
        },
        { icon: Terminal, title: "٤. تشغيل الموقع", text: "شغّل: npm run dev ثم افتح http://localhost:3000" },
        {
          icon: ShieldCheck,
          title: "٥. تحميل البيانات التجريبية",
          text: "شغّل: curl http://localhost:3000/api/seed — سيتم إنشاء ٨ منتجات، باقتين، وكود خصم LEO10.",
        },
      ]
    : [
        {
          icon: Package,
          title: "1. Décompresser l'archive",
          text: "Décompresse le fichier leos-website.zip dans un dossier sur ton ordinateur.",
        },
        {
          icon: Terminal,
          title: "2. Installer les dépendances",
          text: "Ouvre un terminal dans le dossier et lance : npm install",
        },
        {
          icon: Database,
          title: "3. Créer la base de données",
          text: "Crée une base PostgreSQL et mets son URL dans le fichier .env (variable DATABASE_URL), puis lance : npx drizzle-kit push",
        },
        {
          icon: Terminal,
          title: "4. Lancer le site",
          text: "Lance : npm run dev puis ouvre http://localhost:3000",
        },
        {
          icon: ShieldCheck,
          title: "5. Charger les données de démo",
          text: "Lance : curl http://localhost:3000/api/seed — crée 8 produits, 2 combos et le code promo LEO10.",
        },
      ];

  const features = ar
    ? [
        { icon: MessageCircle, label: "الطلب عبر واتساب" },
        { icon: BarChart3, label: "بكسل فيسبوك + تيك توك" },
        { icon: Truck, label: "أسعار التوصيل حسب الولاية (٥٨)" },
        { icon: Package, label: "الكتالوج + الباقات + المنتجات المقترحة" },
        { icon: ShieldCheck, label: "لوحة تحكم كاملة" },
        { icon: Terminal, label: "فرنسي + عربي (RTL)" },
      ]
    : [
        { icon: MessageCircle, label: "Commande sur WhatsApp" },
        { icon: BarChart3, label: "Pixel Facebook + TikTok" },
        { icon: Truck, label: "Frais de livraison par wilaya (58)" },
        { icon: Package, label: "Catalogue + combos + upsells" },
        { icon: ShieldCheck, label: "Panneau admin complet" },
        { icon: Terminal, label: "Français + arabe (RTL)" },
      ];

  const prod = ar
    ? [
        "npm run build",
        "npm run start",
        "غيّر ADMIN_PASSWORD في ملف .env",
        "أضف رقم واتساب الحقيقي من لوحة التحكم ← الإعدادات",
        "أضف معرّفات البكسل (Facebook / TikTok) من الإعدادات",
        "اختياري: FB_CONVERSIONS_API_TOKEN و TIKTOK_ACCESS_TOKEN للتتبع من الخادم",
      ]
    : [
        "npm run build",
        "npm run start",
        "Change ADMIN_PASSWORD dans le fichier .env",
        "Ajoute ton vrai numéro WhatsApp dans Admin ← Paramètres",
        "Ajoute tes IDs de pixels (Facebook / TikTok) dans Paramètres",
        "Optionnel : FB_CONVERSIONS_API_TOKEN et TIKTOK_ACCESS_TOKEN pour le tracking serveur",
      ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted hover:text-accent"
      >
        <ArrowBack className="h-4 w-4" />
        {ar ? "العودة إلى المتجر" : "Retour à la boutique"}
      </Link>

      <div className="mt-6 rounded-3xl bg-ink p-8 text-paper sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">
          {ar ? "تحميل" : "Téléchargement"}
        </p>
        <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
          {ar ? "موقع Leo's — الكود المصدري" : "Site Leo's — code source complet"}
        </h1>
        <p className="mt-4 max-w-2xl text-paper/70">
          {ar
            ? "حمّل المشروع كاملاً (Next.js + PostgreSQL + Drizzle) وشغّله على جهازك أو على أي سيرفر. يتضمن المتجر بالفرنسية والعربية، لوحة التحكم، وكل الميزات."
            : "Télécharge le projet complet (Next.js + PostgreSQL + Drizzle) et lance-le sur ton ordinateur ou n'importe quel serveur. Inclus la boutique FR/AR, le panneau admin et toutes les fonctionnalités."}
        </p>

        <a
          href={ARCHIVE}
          download
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.03]"
        >
          <Download className="h-5 w-5" />
          {ar ? "تحميل leos-website.zip" : "Télécharger leos-website.zip"}
        </a>
        <p className="mt-3 text-xs text-paper/50">
          {ar ? "الحجم التقريبي: ١٨ ميغابايت" : "Taille approximative : 18 Mo"}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {features.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 px-4 py-2 text-xs font-semibold"
            >
              <f.icon className="h-3.5 w-3.5 text-lime" />
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <h2 className="mt-14 font-display text-2xl font-black">
        {ar ? "خطوات التشغيل" : "Démarrage en 5 étapes"}
      </h2>
      <div className="mt-6 space-y-4">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-4 rounded-3xl border border-line bg-white p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Production checklist */}
      <h2 className="mt-14 font-display text-2xl font-black">
        {ar ? "قبل النشر (Production)" : "Avant la mise en ligne"}
      </h2>
      <ul className="mt-6 space-y-2 rounded-3xl border border-line bg-white p-6 text-sm">
        {prod.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 text-accent">▸</span>
            <span className={item.startsWith("npm") ? "font-mono font-bold" : "text-muted"}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-3xl border border-dashed border-line bg-paper-2/60 p-6 text-sm text-muted">
        <p className="font-bold text-ink">
          {ar ? "ملاحظة مهمة" : "Note importante"}
        </p>
        <p className="mt-2">
          {ar
            ? "هذا الموقع هو تطبيق Next.js يحتاج Node.js وقاعدة بيانات PostgreSQL — ليس ملف HTML ثابتاً. للتشغيل المحلي استخدم npm run dev، وللنشر استخدم Vercel أو VPS مع PostgreSQL."
            : "Ce site est une application Next.js : il nécessite Node.js et une base PostgreSQL — ce n'est pas un site HTML statique. En local utilise npm run dev, et pour la mise en ligne Vercel ou un VPS avec PostgreSQL."}
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6">
        <p className="font-display text-lg font-bold">
          {ar ? "الملفات المهمة في الملف المضغوط" : "Fichiers clés dans l'archive"}
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="rounded-2xl bg-paper-2/60 p-4">
            <code className="font-bold text-accent">DEPLOY.md</code>
            <span className="text-muted">
              {ar
                ? " — دليل النشر خطوة بخطوة (Supabase ثم GitHub ثم Vercel). ابدأ من هنا."
                : " — guide de déploiement pas à pas (Supabase → GitHub → Vercel). Commence par celui-ci."}
            </span>
          </li>
          <li className="rounded-2xl bg-paper-2/60 p-4">
            <code className="font-bold text-accent">supabase-setup.sql</code>
            <span className="text-muted">
              {ar
                ? " — انسخه والصقه في Supabase ← SQL Editor لإنشاء كل الجداول. لا تحتاج لأوامر أخرى."
                : " — à copier-coller dans Supabase → SQL Editor pour créer toutes les tables. Aucune commande nécessaire."}
            </span>
          </li>
          <li className="rounded-2xl bg-paper-2/60 p-4">
            <code className="font-bold text-accent">.env.example</code>
            <span className="text-muted">
              {ar
                ? " — نموذج لمتغيرات البيئة. انسخه إلى .env وضع فيه قيمك."
                : " — modèle des variables d'environnement. Copie-le en .env et remplis-le."}
            </span>
          </li>
          <li className="rounded-2xl bg-paper-2/60 p-4">
            <code className="font-bold text-accent">.gitignore</code>
            <span className="text-muted">
              {ar
                ? " — يمنع رفع كلمة السر و node_modules إلى GitHub."
                : " — empêche l'upload du mot de passe et de node_modules sur GitHub."}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
