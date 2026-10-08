"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Product } from "@/db/schema";
import { CATEGORIES, COLORS, SIZES, cn, categoryLabel, formatDZD } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { translateColor } from "@/lib/i18n";
import { Loader2, Save } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  allProducts: Product[]; // for combo + upsell pickers
}

interface FormState {
  name: string;
  slug: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  images: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  active: boolean;
  isCombo: boolean;
  comboProductIds: number[];
  comboPrice: string;
  upsellProductId: string;
}

function toState(product?: Product): FormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? "tshirt",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: product ? String(product.stock) : "0",
    description: product?.description ?? "",
    images: product?.images.join("\n") ?? "",
    sizes: product?.sizes ?? ["M", "L", "XL"],
    colors: product?.colors ?? ["Black"],
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    isCombo: product?.isCombo ?? false,
    comboProductIds: product?.comboProductIds ?? [],
    comboPrice: product?.comboPrice ? String(product.comboPrice) : "",
    upsellProductId: product?.upsellProductId ? String(product.upsellProductId) : "",
  };
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-muted";

export default function ProductForm({ product, allProducts }: ProductFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [form, setForm] = useState<FormState>(() => toState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const toggleComboProduct = (id: number) =>
    setForm((f) => ({
      ...f,
      comboProductIds: f.comboProductIds.includes(id)
        ? f.comboProductIds.filter((x) => x !== id)
        : [...f.comboProductIds, id],
    }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const price = Number(form.price);
    if (!form.name.trim()) return setError(t("admin.pform.errName"));
    if (!Number.isFinite(price) || price <= 0) return setError(t("admin.pform.errPrice"));

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      price,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock) || 0,
      description: form.description.trim(),
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: form.sizes,
      colors: form.colors,
      featured: form.featured,
      active: form.active,
      isCombo: form.isCombo,
      comboProductIds: form.isCombo ? form.comboProductIds : [],
      comboPrice: form.isCombo && form.comboPrice ? Number(form.comboPrice) : null,
      upsellProductId: form.upsellProductId ? Number(form.upsellProductId) : null,
    };

    try {
      const res = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("admin.pform.errSave"));
        setSaving(false);
        return;
      }
      setSaved(true);
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError(t("admin.pform.errSave"));
      setSaving(false);
    }
  };

  const candidates = allProducts.filter((p) => p.id !== product?.id);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.pform.basic")}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.pform.name")}</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("admin.pform.namePlaceholder")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.pform.slug")}</label>
            <input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={t("admin.pform.slugHint")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.pform.category")}</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("admin.pform.stock")}</label>
            <input className={inputClass} type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.pform.price")}</label>
            <input className={inputClass} type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder={t("admin.pform.pricePlaceholder")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.pform.compareAt")}</label>
            <input className={inputClass} type="number" min={0} value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} placeholder={t("admin.pform.compareAtPlaceholder")} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass}>{t("admin.pform.description")}</label>
          <textarea
            className={inputClass}
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={t("admin.pform.descPlaceholder")}
          />
        </div>

        <div className="mt-5">
          <label className={labelClass}>{t("admin.pform.images")}</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.images}
            onChange={(e) => set("images", e.target.value)}
            placeholder={"/images/products/tee-black.png\n/images/products/tee-black-2.png"}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.pform.variants")}</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className={labelClass}>{t("admin.pform.sizes")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("sizes", toggleInArray(form.sizes, s))}
                  className={cn(
                    "h-10 min-w-10 rounded-full border px-3 text-sm font-bold transition-colors",
                    form.sizes.includes(s)
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-white hover:border-ink",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className={labelClass}>{t("admin.pform.colors")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("colors", toggleInArray(form.colors, c))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                    form.colors.includes(c)
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-white hover:border-ink",
                  )}
                >
                  {translateColor(t, c)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.pform.merch")}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.pform.upsell")}</label>
            <select
              className={inputClass}
              value={form.upsellProductId}
              onChange={(e) => set("upsellProductId", e.target.value)}
            >
              <option value="">{t("admin.pform.none")}</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-accent" />
              {t("admin.pform.featured")}
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-accent" />
              {t("admin.pform.active")}
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.isCombo} onChange={(e) => set("isCombo", e.target.checked)} className="h-4 w-4 accent-accent" />
              {t("admin.pform.isCombo")}
            </label>
          </div>
        </div>

        {form.isCombo ? (
          <div className="mt-6 rounded-2xl bg-paper-2/70 p-5">
            <p className={labelClass}>{t("admin.pform.comboContents")}</p>
            <div className="mt-3 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-muted">{t("admin.pform.includes")}</p>
                <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-line bg-white p-3">
                  {candidates.length === 0 ? (
                    <p className="text-xs text-muted">{t("admin.pform.noOthers")}</p>
                  ) : (
                    candidates.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-paper-2">
                        <input
                          type="checkbox"
                          checked={form.comboProductIds.includes(p.id)}
                          onChange={() => toggleComboProduct(p.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-muted">{formatDZD(p.price, locale)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("admin.pform.comboPrice")}</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={form.comboPrice}
                  onChange={(e) => set("comboPrice", e.target.value)}
                  placeholder={t("admin.pform.comboPricePlaceholder")}
                />
                <p className="mt-2 text-xs text-muted">{t("admin.pform.comboPriceHint")}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{t("admin.pform.saved")}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {product ? t("admin.pform.saveChanges") : t("admin.pform.create")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors hover:border-ink"
        >
          {t("admin.pform.cancel")}
        </button>
      </div>
    </form>
  );
}
