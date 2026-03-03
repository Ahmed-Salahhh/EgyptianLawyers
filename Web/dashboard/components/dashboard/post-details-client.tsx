"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LtrText } from "@/components/dashboard/ltr-text";
import { useGetHelpPostByIdQuery } from "@/lib/features/posts/api";

type Props = {
  locale: string;
  postId: string;
};

export function PostDetailsClient({ locale, postId }: Props) {
  const t = useTranslations("Pages");
  const { data: post, isLoading, isError } = useGetHelpPostByIdQuery(postId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
        {t("loading")}
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]">
        {t("failedToLoad")}
      </div>
    );
  }

  const repliesCount = post.replies.length;

  return (
    <main>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#1a2f52]">{t("postDetailsTitle")}</h1>
        <Link
          href="/posts"
          locale={locale}
          className="rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#30415d] hover:bg-[#f7faff]"
        >
          {t("backToPosts")}
        </Link>
      </div>

      <section className="mt-5 rounded-2xl border border-[#d8e2f3] bg-white p-5 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
        <h2 className="text-lg font-semibold text-[#1a2f52]">{post.description}</h2>
        <p className="mt-2 text-sm text-[#5d6f8f]">
          {post.courtName} | {post.cityName}
        </p>
        <p className="mt-1 text-sm text-[#5d6f8f]">
          {t("author")}: {post.lawyerFullName}
        </p>
        <p className="mt-1 text-sm text-[#5d6f8f]">
          {t("createdAt")}: <LtrText>{post.createdAt}</LtrText>
        </p>
        <p className="mt-1 text-sm text-[#5d6f8f]">
          {t("replies")}: <LtrText>{String(repliesCount)}</LtrText>
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-[#d8e2f3] bg-white p-5 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
        <h3 className="text-base font-semibold text-[#1a2f52]">{t("repliesList")}</h3>

        {post.replies.length === 0 ? (
          <p className="mt-3 text-sm text-[#5d6f8f]">{t("noReplies")}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {post.replies.map((reply) => (
              <article
                key={reply.id}
                className="rounded-xl border border-[#e2e9f6] bg-[#f9fbff] p-3"
              >
                <p className="text-sm font-semibold text-[#1a2f52]">
                  {reply.lawyerFullName}
                </p>
                <p className="mt-1 text-sm text-[#30415d]">{reply.comment}</p>
                <p className="mt-1 text-xs text-[#7082a0]">
                  {t("whatsApp")}: <LtrText>{reply.lawyerWhatsAppNumber}</LtrText>
                </p>
                <p className="mt-1 text-xs text-[#7082a0]">
                  {t("createdAt")}: <LtrText>{reply.createdAt}</LtrText>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

