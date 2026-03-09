"use client";

import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Link, useRouter } from "@/i18n/navigation";
import { LtrText } from "@/components/dashboard/ltr-text";
import {
  useDeleteHelpPostMutation,
  useDeleteHelpPostReplyMutation,
  useGetHelpPostByIdQuery,
} from "@/lib/features/posts/api";
import type { HelpPostReply } from "@/lib/features/posts/types";

type Props = {
  locale: string;
  postId: string;
};

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function countTotalReplies(replies: HelpPostReply[]): number {
  return replies.reduce((sum, reply) => sum + 1 + countTotalReplies(reply.childReplies ?? []), 0);
}

type ReplyCardProps = {
  reply: HelpPostReply;
  level?: number;
  locale: string;
  createdAtLabel: string;
  whatsAppLabel: string;
  onDeleteReply: (replyId: string) => void;
  isDeleting: boolean;
};

function ReplyCard({
  reply,
  level = 0,
  locale,
  createdAtLabel,
  whatsAppLabel,
  onDeleteReply,
  isDeleting,
}: ReplyCardProps) {
  const indent = Math.min(level, 5) * 14;
  const hasChildren = (reply.childReplies?.length ?? 0) > 0;

  return (
    <div style={{ marginInlineStart: `${indent}px` }}>
      <article className="rounded-2xl border border-[#dce7fb] bg-white p-4 shadow-[0_4px_14px_rgba(32,78,150,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f2ff] text-sm font-bold text-[#2c4f86]">
              {reply.lawyerFullName.charAt(0).toUpperCase()}
            </span>
            <Link
              href={`/lawyers/${reply.lawyerId}`}
              locale={locale}
              className="truncate text-sm font-semibold text-[#173563] hover:underline"
            >
              {reply.lawyerFullName}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {level > 0 ? (
              <span className="rounded-full bg-[#f2f7ff] px-2 py-0.5 text-[11px] font-semibold text-[#5475a8]">
                L{level}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onDeleteReply(reply.id)}
              disabled={isDeleting}
              title="Delete reply"
              aria-label="Delete reply"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#f1d4dd] bg-[#fff7fa] text-[#b53f58] disabled:opacity-60"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {reply.comment ? (
          <p className="mt-3 rounded-xl bg-[#f7faff] px-3 py-2 text-sm leading-6 text-[#2a3f63]">
            {reply.comment}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6780a8]">
          <p>
            {whatsAppLabel}: <LtrText>{reply.lawyerWhatsAppNumber}</LtrText>
          </p>
          <p>
            {createdAtLabel}: <LtrText>{reply.createdAt}</LtrText>
          </p>
        </div>
      </article>

      {hasChildren ? (
        <div
          className="mt-3 space-y-3 ps-4"
          style={{ borderInlineStart: "2px solid #dce7fb" }}
        >
          {reply.childReplies!.map((child) => (
            <ReplyCard
              key={child.id}
              reply={child}
              level={level + 1}
              locale={locale}
              createdAtLabel={createdAtLabel}
              whatsAppLabel={whatsAppLabel}
              onDeleteReply={onDeleteReply}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PostDetailsClient({ locale, postId }: Props) {
  const t = useTranslations("Pages");
  const router = useRouter();
  const { data: post, isLoading, isError } = useGetHelpPostByIdQuery(postId);
  const [deleteHelpPost, { isLoading: isDeletingPost }] = useDeleteHelpPostMutation();
  const [deleteHelpPostReply, { isLoading: isDeletingReply }] = useDeleteHelpPostReplyMutation();

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      await deleteHelpPost({ postId }).unwrap();
      toast.success("Post deleted.");
      router.push("/posts");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm("Delete this reply permanently?")) return;

    try {
      await deleteHelpPostReply({ postId, replyId }).unwrap();
      toast.success("Reply deleted.");
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

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

  const repliesCount = countTotalReplies(post.replies);

  return (
    <main>
      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          locale={locale}
          aria-label={t("backToPosts")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e2f3] bg-white text-[#30415d] hover:bg-[#f7faff]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1a2f52]">{t("postDetailsTitle")}</h1>
        <button
          type="button"
          onClick={handleDeletePost}
          disabled={isDeletingPost}
          className="ms-auto rounded-lg border border-[#f1d4dd] bg-[#fff7fa] px-3 py-2 text-sm font-semibold text-[#b53f58] disabled:opacity-60"
        >
          {isDeletingPost ? "Deleting..." : "Delete post"}
        </button>
      </div>

      <section className="mt-5 rounded-2xl border border-[#d8e2f3] bg-white p-5 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
        <h2 className="text-lg font-semibold text-[#1a2f52]">{post.description}</h2>
        <p className="mt-2 text-sm text-[#5d6f8f]">
          {post.courtName} | {post.cityName}
        </p>
        <p className="mt-1 text-sm text-[#5d6f8f]">
          {t("author")}:{" "}
          <Link
            href={`/lawyers/${post.lawyerId}`}
            locale={locale}
            className="font-medium text-[#245ce2] hover:underline"
          >
            {post.lawyerFullName}
          </Link>
        </p>
        <p className="mt-1 text-sm text-[#5d6f8f]">
          {t("whatsApp")}: <LtrText>{post.lawyerWhatsAppNumber}</LtrText>
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
          <div className="mt-4 space-y-4">
            {post.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                locale={locale}
                createdAtLabel={t("createdAt")}
                whatsAppLabel={t("whatsApp")}
                onDeleteReply={handleDeleteReply}
                isDeleting={isDeletingReply}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

