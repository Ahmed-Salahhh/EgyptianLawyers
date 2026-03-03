import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/dashboard/data-table";
import { LtrText } from "@/components/dashboard/ltr-text";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Dashboard");
  const p = await getTranslations("Pages");
  const stats = [
    { label: t("pendingApprovals"), value: "32" },
    { label: t("verifiedLawyers"), value: "468" },
    { label: t("activePosts"), value: "79" },
    { label: t("flaggedAttachments"), value: "5" },
  ];
  const columns = [
    { key: "lawyer", header: t("tableLawyer") },
    { key: "city", header: t("tableCity") },
    { key: "syndicate", header: t("tableSyndicateId"), },
    { key: "status", header: t("tableStatus") },
  ];
  const rows = [
    {
      key: "ahmed-mostafa",
      cells: [
        "Ahmed Mostafa",
        p("cityCairo"),
        <LtrText key="id">32412</LtrText>,
        t("statusPending"),
      ],
    },
    {
      key: "nourhan-ali",
      cells: [
        "Nourhan Ali",
        p("cityAlexandria"),
        <LtrText key="id">27811</LtrText>,
        t("statusPending"),
      ],
    },
    {
      key: "karim-samir",
      cells: [
        "Karim Samir",
        p("cityGiza"),
        <LtrText key="id">22609</LtrText>,
        t("statusReviewing"),
      ],
    },
  ];

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52] md:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-[#5d6f8f]">{t("subtitle")}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-[#d8e2f3] bg-[linear-gradient(140deg,#ffffff_0%,#eef5ff_100%)] p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]"
          >
            <p className="text-sm text-[#5d6f8f]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1a2f52]">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        <section className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)] xl:col-span-2">
          <h2 className="text-lg font-semibold text-[#1a2f52]">
            {t("recentVerificationRequests")}
          </h2>
          <div className="mt-4">
            <DataTable columns={columns} rows={rows} />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
          <h2 className="text-lg font-semibold text-[#1a2f52]">
            {t("moderationQueue")}
          </h2>
          <div className="mt-3 space-y-2.5 text-sm">
            <article className="rounded-lg border border-[#e2e9f7] bg-[#f7faff] px-3 py-2.5">
              <p className="font-medium text-[#2a3f63]">{t("mod1Title")}</p>
              <p className="text-[#5d6f8f]">{t("mod1Body")}</p>
            </article>
            <article className="rounded-lg border border-[#e2e9f7] bg-[#f7faff] px-3 py-2.5">
              <p className="font-medium text-[#2a3f63]">{t("mod2Title")}</p>
              <p className="text-[#5d6f8f]">{t("mod2Body")}</p>
            </article>
            <article className="rounded-lg border border-[#e2e9f7] bg-[#f7faff] px-3 py-2.5">
              <p className="font-medium text-[#2a3f63]">{t("mod3Title")}</p>
              <p className="text-[#5d6f8f]">{t("mod3Body")}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
