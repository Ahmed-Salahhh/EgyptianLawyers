import { setRequestLocale } from "next-intl/server";
import DashboardShell from "./dashboard-shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DashboardShell locale={locale}>{children}</DashboardShell>
  );
}
