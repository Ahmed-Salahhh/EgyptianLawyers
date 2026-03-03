"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DataTable } from "@/components/dashboard/data-table";
import { LtrText } from "@/components/dashboard/ltr-text";
import {
  useApproveLawyerMutation,
  useGetLawyersQuery,
  useRejectLawyerMutation,
} from "@/lib/features/lawyers/api";
import type { LawyerStatus } from "@/lib/features/lawyers/types";

type Props = {
  locale: string;
  activeStatus: LawyerStatus | "all";
};

export function LawyersPageClient({ locale, activeStatus }: Props) {
  const t = useTranslations("Pages");
  const { data: lawyers = [], isLoading, isError } = useGetLawyersQuery({
    status: activeStatus,
  });
  const [approveLawyer, { isLoading: isApproving }] = useApproveLawyerMutation();
  const [rejectLawyer, { isLoading: isRejecting }] = useRejectLawyerMutation();
  const isUpdatingStatus = isApproving || isRejecting;

  const filterTabs: Array<{ key: "all" | LawyerStatus; label: string }> = [
    { key: "all", label: t("allStatuses") },
    { key: "pending", label: t("pending") },
    { key: "verified", label: t("verified") },
    { key: "suspended", label: t("suspended") },
  ];

  const columns = [
    { key: "name", header: t("name"), className: "text-start" },
    { key: "city", header: t("city"), className: "text-start" },
    { key: "status", header: t("status"), className: "text-start" },
    { key: "card", header: t("cardNumber"), className: "text-start" },
    { key: "whatsapp", header: t("whatsApp"), className: "text-start" },
    { key: "submitted", header: t("submitted"), className: "text-start" },
    { key: "action", header: t("action"), className: "text-start" },
  ];

  const statusLabel = (status: LawyerStatus) => {
    if (status === "pending") return t("pending");
    if (status === "verified") return t("verified");
    return t("suspended");
  };

  const rows = lawyers.map((lawyer) => ({
    key: lawyer.id,
    cells: [
      <Link
        key={`${lawyer.id}-name`}
        href={`/lawyers/${lawyer.id}`}
        locale={locale}
        className="font-medium text-[#245ce2] hover:underline"
      >
        {lawyer.name}
      </Link>,
      t(lawyer.cityKey),
      statusLabel(lawyer.status),
      <LtrText key={`${lawyer.id}-card`}>{lawyer.cardNumber}</LtrText>,
      <LtrText key={`${lawyer.id}-wa`}>{lawyer.whatsapp}</LtrText>,
      t(lawyer.submitted),
      lawyer.status === "pending" ? (
        <div key={`${lawyer.id}-action`} className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => {
              if (lawyer.status !== "pending") return;
              approveLawyer({ lawyerId: lawyer.id });
            }}
            className="rounded-lg bg-[#245ce2] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {t("approve")}
          </button>
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => {
              if (lawyer.status !== "pending") return;
              rejectLawyer({ lawyerId: lawyer.id });
            }}
            className="rounded-lg bg-[#d94b64] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {t("reject")}
          </button>
        </div>
      ) : (
        <span key={`${lawyer.id}-action`} className="text-[#9aa9c3]">
          -
        </span>
      ),
    ],
  }));

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52]">{t("lawyersDirectoryTitle")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const href = tab.key === "all" ? "/lawyers" : `/lawyers?status=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              locale={locale}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-[#245ce2] bg-[#245ce2] text-white"
                  : "border-[#d2ddf2] bg-white text-[#4e648c] hover:bg-[#f2f6ff]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <input
          className="rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2"
          placeholder={t("searchByLawyer")}
        />
        <input
          className="rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2"
          placeholder={t("filterByCity")}
        />
        <input
          className="rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2"
          placeholder={t("syndicateCardNumber")}
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
            {t("loading")}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]">
            {t("failedToLoad")}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </div>
    </main>
  );
}
