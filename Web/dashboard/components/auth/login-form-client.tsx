"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useLoginMutation } from "@/lib/features/auth/api";
import { setAuthToken, setStoredAuthUser } from "@/lib/features/auth/token";

type Props = {
  locale: string;
};

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as {
    token?: string;
    accessToken?: string;
    data?: { token?: string; accessToken?: string };
  };

  return data.token ?? data.accessToken ?? data.data?.token ?? data.data?.accessToken ?? null;
}

function extractAuthProfile(payload: unknown, emailFallback: string) {
  if (!payload || typeof payload !== "object") {
    return {
      fullName: null,
      role: null,
      lawyerId: null,
      email: emailFallback,
    };
  }

  const data = payload as {
    fullName?: string;
    role?: string;
    lawyerId?: string | null;
    email?: string;
    data?: {
      fullName?: string;
      role?: string;
      lawyerId?: string | null;
      email?: string;
    };
  };

  return {
    fullName: data.fullName ?? data.data?.fullName ?? null,
    role: data.role ?? data.data?.role ?? null,
    lawyerId: data.lawyerId ?? data.data?.lawyerId ?? null,
    email: data.email ?? data.data?.email ?? emailFallback,
  };
}

export function LoginFormClient({ locale }: Props) {
  const t = useTranslations("Auth");
  const c = useTranslations("Common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await login({ email, password }).unwrap();
      const token = extractToken(response);

      if (!token) {
        setErrorMessage(t("invalidLoginResponse"));
        return;
      }

      const profile = extractAuthProfile(response, email);

      setAuthToken(token);
      setStoredAuthUser(profile);
      router.push("/dashboard");
    } catch {
      setErrorMessage(t("loginFailed"));
    }
  };

  const enLabel = c("languageEnglish");
  const arLabel = c("languageArabic");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#cfc7b7] bg-[#fffdf8] p-7 shadow-[0_12px_40px_rgba(28,36,51,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-semibold text-[#1c2433]">{c("appName")}</p>
          <div className="inline-flex rounded-full border border-[#d9d2c5] bg-[#f2eee5] p-1 text-sm">
            <Link
              href="/login"
              locale="en"
              className={`rounded-full px-2.5 py-1 ${
                locale === "en" ? "bg-[#0f3b66] text-white" : "text-[#4d5a70]"
              }`}
            >
              {enLabel}
            </Link>
            <Link
              href="/login"
              locale="ar"
              className={`rounded-full px-2.5 py-1 ${
                locale === "ar" ? "bg-[#0f3b66] text-white" : "text-[#4d5a70]"
              }`}
            >
              {arLabel}
            </Link>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1c2433]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[#4d5a70]">{t("subtitle")}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#2f3d54]">
            {t("email")}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-[#d9d2c5] bg-white px-3 py-2.5 outline-none ring-[#0f3b66] transition focus:ring-2"
              placeholder="admin@lawyers.network"
            />
          </label>
          <label className="block text-sm font-medium text-[#2f3d54]">
            {t("password")}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-[#d9d2c5] bg-white px-3 py-2.5 outline-none ring-[#0f3b66] transition focus:ring-2"
              placeholder="********"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f3b66] px-4 py-3 font-semibold text-white transition hover:bg-[#0b2d4d] disabled:opacity-70"
          >
            {isLoading ? t("loading") : t("submit")}
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-[#f2ccd5] bg-[#fff5f8] px-3 py-2 text-xs text-[#a13c52]">
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-[#66758c]">{t("hint")}</p>
      </section>
    </main>
  );
}
