import { setRequestLocale } from "next-intl/server";
import { LoginFormClient } from "@/components/auth/login-form-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginFormClient locale={locale} />;
}

