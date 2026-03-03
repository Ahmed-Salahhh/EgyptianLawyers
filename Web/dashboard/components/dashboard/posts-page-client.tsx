"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGetFlaggedItemsQuery } from "@/lib/features/posts/api";

type Props = {
  locale: string;
};

export function PostsPageClient({ locale }: Props) {
  const t = useTranslations("Pages");
  const { data: items = [], isLoading, isError } = useGetFlaggedItemsQuery();

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52]">{t("postsTitle")}</h1>

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
            {t("loading")}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]">
            {t("failedToLoad")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
            {t("noFlaggedItems")}
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]"
              >
                <Link
                  href={`/posts/${item.id}`}
                  locale={locale}
                  className="font-semibold text-[#1a2f52] hover:text-[#245ce2] hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-[#5d6f8f]">{item.meta}</p>
                <p className="mt-2 text-sm text-[#5d6f8f]">{item.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/posts/${item.id}`}
                    locale={locale}
                    className="rounded-lg border border-[#d3def2] bg-[#f7faff] px-2.5 py-1.5 text-xs text-[#30415d]"
                  >
                    {t("openDetails")}
                  </Link>
                  <button
                    type="button"
                    disabled
                    className="rounded-lg bg-[#245ce2] px-2.5 py-1.5 text-xs text-white opacity-60"
                  >
                    {t("keep")}
                  </button>
                  <button
                    type="button"
                    disabled
                    className="rounded-lg bg-[#d94b64] px-2.5 py-1.5 text-xs text-white opacity-60"
                  >
                    {t("remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
