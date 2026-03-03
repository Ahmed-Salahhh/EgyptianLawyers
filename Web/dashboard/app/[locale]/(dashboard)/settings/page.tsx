import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52]">{t("settingsTitle")}</h1>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
          <p className="font-semibold text-[#1a2f52]">{t("notificationDefaults")}</p>
          <label className="mt-3 flex items-center justify-between text-sm text-[#445978]">
            {t("cityAlerts")}
            <input type="checkbox" defaultChecked />
          </label>
          <label className="mt-2 flex items-center justify-between text-sm text-[#445978]">
            {t("emailSummaries")}
            <input type="checkbox" defaultChecked />
          </label>
        </section>

        <section className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
          <p className="font-semibold text-[#1a2f52]">{t("moderationPolicy")}</p>
          <textarea
            className="mt-3 h-28 w-full rounded-xl border border-[#d8e2f3] bg-white p-3 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2"
            defaultValue={t("moderationPolicyText")}
          />
        </section>
      </div>
    </main>
  );
}
