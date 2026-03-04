"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/dashboard/data-table";
import { LtrText } from "@/components/dashboard/ltr-text";
import {
  useApproveLawyerMutation,
  useGetLawyersQuery,
} from "@/lib/features/lawyers/api";
import { useGetFlaggedItemsQuery } from "@/lib/features/posts/api";

export function DashboardPageClient() {
  const t = useTranslations("Dashboard");
  const pages = useTranslations("Pages");

  const {
    data: pendingLawyersResponse,
    isLoading: isPendingLawyersLoading,
    isError: isPendingLawyersError,
  } = useGetLawyersQuery({
    pageIndex: 1,
    pageSize: 5,
    isVerified: false,
    isSuspended: false,
  });

  const { data: verifiedLawyersResponse } = useGetLawyersQuery({
    pageIndex: 1,
    pageSize: 1,
    isVerified: true,
  });

  const {
    data: postsResponse,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useGetFlaggedItemsQuery({
    pageIndex: 1,
    pageSize: 3,
  });

  const pendingLawyers = pendingLawyersResponse?.data ?? [];
  const moderationItems = postsResponse?.data ?? [];
  const [approveLawyer, { isLoading: isApprovingLawyer }] =
    useApproveLawyerMutation();

  const stats = [
    {
      label: t("pendingApprovals"),
      value: String(pendingLawyersResponse?.totalCount ?? 0),
    },
    {
      label: t("verifiedLawyers"),
      value: String(verifiedLawyersResponse?.totalCount ?? 0),
    },
    {
      label: t("activePosts"),
      value: String(postsResponse?.totalCount ?? 0),
    },
  ];

  const columns = [
    { key: "lawyer", header: t("tableLawyer") },
    { key: "city", header: t("tableCity") },
    { key: "syndicate", header: t("tableSyndicateId") },
    { key: "status", header: t("tableStatus") },
    { key: "action", header: pages("action") },
  ];

  const rows = pendingLawyers.map((lawyer) => ({
    key: lawyer.id,
    cells: [
      lawyer.fullName,
      lawyer.cities.length > 0 ? (
        <div key={`${lawyer.id}-cities`} className="flex flex-wrap justify-center gap-1.5">
          {lawyer.cities.map((city) => (
            <span
              key={city.id}
              className="rounded-full border border-[#d8e2f3] bg-[#f7faff] px-2 py-0.5 text-xs text-[#30415d]"
            >
              {city.name}
            </span>
          ))}
        </div>
      ) : (
        "-"
      ),
      <LtrText key={`${lawyer.id}-card`}>{lawyer.syndicateCardNumber}</LtrText>,
      t("statusPending"),
      <div key={`${lawyer.id}-action`} className="flex justify-center">
        <button
          type="button"
          disabled={isApprovingLawyer}
          onClick={() => {
            void approveLawyer({ lawyerId: lawyer.id });
          }}
          className="rounded-lg bg-[#245ce2] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {pages("approve")}
        </button>
      </div>,
    ],
  }));

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
            {rows.length === 0 ? (
              <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
                {isPendingLawyersLoading
                  ? pages("loading")
                  : isPendingLawyersError
                    ? pages("failedToLoad")
                    : pages("noFlaggedItems")}
              </div>
            ) : (
              <DataTable columns={columns} rows={rows} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
          <h2 className="text-lg font-semibold text-[#1a2f52]">
            {t("moderationQueue")}
          </h2>
          <div className="mt-3 space-y-2.5 text-sm">
            {moderationItems.length === 0 ? (
              <div className="rounded-lg border border-[#e2e9f7] bg-[#f7faff] px-3 py-2.5 text-[#5d6f8f]">
                {isPostsLoading
                  ? pages("loading")
                  : isPostsError
                    ? pages("failedToLoad")
                    : pages("noFlaggedItems")}
              </div>
            ) : (
              moderationItems.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-[#e2e9f7] bg-[#f7faff] px-3 py-2.5"
                >
                  <p className="font-medium text-[#2a3f63]">
                    {t("postNumber", { id: post.id })}
                  </p>
                  <p className="text-[#5d6f8f]">{post.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
