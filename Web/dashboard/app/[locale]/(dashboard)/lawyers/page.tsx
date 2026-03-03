import { setRequestLocale } from "next-intl/server";
import { LawyersPageClient } from "@/components/dashboard/lawyers-page-client";
import type { LawyerStatus } from "@/lib/features/lawyers/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

function parseStatus(value?: string): LawyerStatus | "all" {
  if (value === "pending" || value === "verified" || value === "suspended") {
    return value;
  }
  return "all";
}

export default async function LawyersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status: rawStatus } = await searchParams;
  setRequestLocale(locale);
  const activeStatus = parseStatus(rawStatus);
  return <LawyersPageClient locale={locale} activeStatus={activeStatus} />;
}
