import { setRequestLocale } from "next-intl/server";
import { PostDetailsClient } from "@/components/dashboard/post-details-client";

type Props = {
  params: Promise<{ locale: string; postId: string }>;
};

export default async function PostDetailsPage({ params }: Props) {
  const { locale, postId } = await params;
  setRequestLocale(locale);

  return <PostDetailsClient locale={locale} postId={postId} />;
}

