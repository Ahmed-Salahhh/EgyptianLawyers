import { setRequestLocale } from "next-intl/server";
import { CourtsPageClient } from "@/components/dashboard/courts-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CourtsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CourtsPageClient />;
}

