import { setRequestLocale } from "next-intl/server";
import { LawyerDetailsClient } from "@/components/dashboard/lawyer-details-client";

type Props = {
  params: Promise<{ locale: string; lawyerId: string }>;
};

export default async function LawyerDetailsPage({ params }: Props) {
  const { locale, lawyerId } = await params;
  setRequestLocale(locale);

  return <LawyerDetailsClient locale={locale} lawyerId={lawyerId} />;
}

