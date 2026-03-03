import { setRequestLocale } from "next-intl/server";
import { PostsPageClient } from "@/components/dashboard/posts-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PostsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PostsPageClient locale={locale} />;
}
