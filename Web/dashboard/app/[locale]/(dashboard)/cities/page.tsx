import { setRequestLocale } from "next-intl/server";
import { CitiesPageClient } from "@/components/dashboard/cities-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CitiesPageClient />;
}

