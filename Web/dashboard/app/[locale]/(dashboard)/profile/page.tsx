"use client";


import { useTranslations } from "next-intl";

import { useAuthUser } from "@/lib/features/auth/use-auth-user";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const c = useTranslations("Common");

  const user = useAuthUser(c("systemAdmin"));

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52]">{t("title")}</h1>
      <section className="mt-5 rounded-2xl border border-[#d8e2f3] bg-white p-5 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
        <p className="text-sm text-[#5d6f8f]">{t("fullName")}</p>
        <p className="font-semibold text-[#1a2f52]">{user.name}</p>
        <p className="mt-3 text-sm text-[#5d6f8f]">{t("email")}</p>
        <p className="font-semibold text-[#1a2f52]">{user.email}</p>
        <p className="mt-3 text-sm text-[#5d6f8f]">{t("role")}</p>
        <p className="font-semibold text-[#1a2f52]">{user.role}</p>
      </section>
    </main>
  );
}


