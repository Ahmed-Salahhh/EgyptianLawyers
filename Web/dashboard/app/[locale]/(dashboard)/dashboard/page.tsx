import { setRequestLocale } from "next-intl/server";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardPageClient />;
}
