"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Coupon } from "@/db/schema";
import { cn, formatDZD, formatDate } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Loader2, Plus, Power, Trash2 } from "lucide-react";

interface CouponManagerProps {
  coupons: Coupon[];
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-muted";

export default function CouponManager({ coupons }: CouponManagerProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [busy, setBusy] = useState<number | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = Number(value);
    if (!code.trim()) return setError(t("admin.coupons.errCode"));
    if (!Number.isFinite(v) || v <= 0) return setError(t("admin.coupons.errValue"));
    if (type === "percent" && v > 100) return setError(t("admin.coupons.errPercent"));

    setCreating(true);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        type,
        value: v,
        minOrder: Number(minOrder) || 0,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("admin.coupons.errCreate"));
    } else {
      setCode("");
      setValue("");
      setMinOrder("");
      setUsageLimit("");
      setExpiresAt("");
      router.refresh();
    }
    setCreating(false);
  };

  const toggle = async (coupon: Coupon) => {
    setBusy(coupon.id);
    await fetch(`/api/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async (coupon: Coupon) => {
    if (!window.confirm(t("admin.coupons.deleteConfirm", { code: coupon.code }))) return;
    setBusy(coupon.id);
    await fetch(`/api/coupons/${coupon.id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      {/* Create */}
      <form onSubmit={create} className="h-fit space-y-4 rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.coupons.create")}</h2>

        <div>
          <label className={labelClass}>{t("admin.coupons.code")}</label>
          <input
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="LEO10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("admin.coupons.type")}</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="percent">{t("admin.coupons.percent")}</option>
              <option value="amount">{t("admin.coupons.amount")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("admin.coupons.value")}</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "10" : "500"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("admin.coupons.minOrder")}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.coupons.usageLimit")}</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder={t("admin.coupons.unlimited")}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t("admin.coupons.expiresAt")}</label>
          <input
            className={inputClass}
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent disabled:opacity-70"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("admin.coupons.createBtn")}
        </button>
      </form>

      {/* List */}
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-bold">{t("admin.coupons.listTitle")}</h2>
        {coupons.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("admin.coupons.empty")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-muted">
                  <th className="pb-3 pr-4 font-bold">{t("admin.coupons.code")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.coupons.discount")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.coupons.minOrderCol")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.coupons.used")}</th>
                  <th className="pb-3 pr-4 font-bold">{t("admin.coupons.expires")}</th>
                  <th className="pb-3 text-right font-bold">{t("admin.ptable.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className={cn("border-t border-line", busy === coupon.id && "opacity-50")}
                  >
                    <td className="py-3 pr-4 font-mono font-bold">{coupon.code}</td>
                    <td className="py-3 pr-4 font-bold">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatDZD(coupon.value, locale)}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {coupon.minOrder > 0 ? formatDZD(coupon.minOrder, locale) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt, locale) : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggle(coupon)}
                          title={coupon.active ? t("admin.coupons.deactivate") : t("admin.coupons.activate")}
                          className={cn(
                            "rounded-lg p-1.5 transition-colors",
                            coupon.active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-paper-2 text-muted",
                          )}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(coupon)}
                          className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100"
                          title={t("admin.coupons.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
