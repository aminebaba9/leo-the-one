"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { StoreSettings } from "@/db/schema";
import { WILAYAS, formatWilayaLabel } from "@/lib/wilayas";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Loader2, Save } from "lucide-react";

interface SettingsFormProps {
  settings: StoreSettings;
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-muted";

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [deliveryCompany, setDeliveryCompany] = useState(settings.deliveryCompany);
  const [deliveryBaseFee, setDeliveryBaseFee] = useState(String(settings.deliveryBaseFee));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(settings.freeShippingThreshold),
  );
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [facebookPixelId, setFacebookPixelId] = useState(settings.facebookPixelId);
  const [tiktokPixelId, setTiktokPixelId] = useState(settings.tiktokPixelId);
  const [wilayaFees, setWilayaFees] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [name, fee] of Object.entries(settings.wilayaFees ?? {})) {
      initial[name] = String(fee);
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const fees: Record<string, number> = {};
    for (const [name, raw] of Object.entries(wilayaFees)) {
      if (raw.trim() === "") continue;
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) fees[name] = n;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          storeTagline: storeTagline.trim(),
          whatsappNumber: whatsappNumber.trim(),
          deliveryCompany: deliveryCompany.trim(),
          deliveryBaseFee: Number(deliveryBaseFee) || 0,
          freeShippingThreshold: Number(freeShippingThreshold) || 0,
          announcement: announcement.trim(),
          facebookPixelId: facebookPixelId.trim(),
          tiktokPixelId: tiktokPixelId.trim(),
          wilayaFees: fees,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("admin.sform.errSave"));
        setSaving(false);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(t("admin.sform.errSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Store */}
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.sform.store")}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.sform.storeName")}</label>
            <input className={inputClass} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.sform.tagline")}</label>
            <input className={inputClass} value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)} />
          </div>
        </div>
        <div className="mt-5">
          <label className={labelClass}>{t("admin.sform.announcement")}</label>
          <input
            className={inputClass}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder={t("admin.sform.announcementPlaceholder")}
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.sform.whatsappTitle")}</h2>
        <div className="mt-5">
          <label className={labelClass}>{t("admin.sform.whatsappNumber")}</label>
          <input
            className={inputClass}
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder={t("admin.sform.whatsappPlaceholder")}
          />
          <p className="mt-2 text-xs text-muted">{t("admin.sform.whatsappHint")}</p>
        </div>
      </div>

      {/* Delivery */}
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.sform.deliveryTitle")}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{t("admin.sform.deliveryCompany")}</label>
            <input
              className={inputClass}
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              placeholder={t("admin.sform.companyPlaceholder")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.sform.baseFee")}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={deliveryBaseFee}
              onChange={(e) => setDeliveryBaseFee(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.sform.freeOver")}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className={labelClass}>{t("admin.sform.wilayaFees")}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {WILAYAS.map((w) => (
              <div key={w.code}>
                <label className="text-xs font-semibold text-muted">
                  {formatWilayaLabel(w, locale)}
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder={deliveryBaseFee}
                  value={wilayaFees[w.name] ?? ""}
                  onChange={(e) =>
                    setWilayaFees((f) => ({ ...f, [w.name]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking pixels */}
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.sform.pixelsTitle")}</h2>
        <p className="mt-1 text-xs text-muted">{t("admin.sform.pixelsHint")}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.sform.fbPixel")}</label>
            <input
              className={inputClass}
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              placeholder="1234567890123456"
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.sform.ttPixel")}</label>
            <input
              className={inputClass}
              value={tiktokPixelId}
              onChange={(e) => setTiktokPixelId(e.target.value)}
              placeholder="C0ABCDEF1234567890"
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {t("admin.sform.saved")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent disabled:opacity-70"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t("admin.sform.save")}
      </button>
    </form>
  );
}
