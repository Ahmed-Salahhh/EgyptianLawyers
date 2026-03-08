"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LtrText } from "@/components/dashboard/ltr-text";
import { useGetLawyerByIdQuery } from "@/lib/features/lawyers/api";

type Props = {
  locale: string;
  lawyerId: string;
};

export function LawyerDetailsClient({ locale, lawyerId }: Props) {
  const t = useTranslations("Pages");
  const { data: lawyer, isLoading, isError } = useGetLawyerByIdQuery(lawyerId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
        {t("loading")}
      </div>
    );
  }

  if (isError || !lawyer) {
    return (
      <div className="rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]">
        {t("failedToLoad")}
      </div>
    );
  }

  const statusLabel = lawyer.isVerified ? t("verified") : t("pending");
  const activeCities = lawyer.activeCities ?? [];

  return (
    <main>
      <div className="flex items-center gap-3">
        <Link
          href="/lawyers"
          locale={locale}
          aria-label={t("backToLawyers")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e2f3] bg-white text-[#30415d] hover:bg-[#f7faff]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1a2f52]">{t("lawyerDetails")}</h1>
      </div>

      <section className="mt-5 rounded-2xl border border-[#d8e2f3] bg-white p-5 shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-[#5d6f8f]">{t("fullName")}</p>
            <p className="font-semibold text-[#1a2f52]">{lawyer.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-[#5d6f8f]">{t("professionalTitle")}</p>
            <p className="font-semibold text-[#1a2f52]">{lawyer.title || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-[#5d6f8f]">{t("syndicateCardNumber")}</p>
            <p className="font-semibold text-[#1a2f52]">
              <LtrText>{lawyer.syndicateCardNumber}</LtrText>
            </p>
          </div>
          <div>
            <p className="text-sm text-[#5d6f8f]">{t("verificationStatus")}</p>
            <p className="font-semibold text-[#1a2f52]">{statusLabel}</p>
          </div>
          <div>
            <p className="text-sm text-[#5d6f8f]">{t("whatsApp")}</p>
            <p className="font-semibold text-[#1a2f52]">
              <LtrText>{lawyer.whatsAppNumber}</LtrText>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-[#5d6f8f]">{t("activeCities")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeCities.length > 0 ? (
              activeCities.map((city) => (
                <span
                  key={city.id}
                  className="rounded-full border border-[#d8e2f3] bg-[#f7faff] px-3 py-1 text-sm text-[#30415d]"
                >
                  {city.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-[#5d6f8f]">-</span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
