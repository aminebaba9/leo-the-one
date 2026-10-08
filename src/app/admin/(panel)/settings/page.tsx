import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import SettingsForm from "@/app/admin/(panel)/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const store = await getSettings();
  const { t } = await getT();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">{t("admin.settings.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.settings.subtitle")}</p>
      </div>
      <SettingsForm settings={store} />
    </div>
  );
}
