import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Landing");

  const howItWorks = [
    { title: t("how1Title"), description: t("how1Desc") },
    { title: t("how2Title"), description: t("how2Desc") },
    { title: t("how3Title"), description: t("how3Desc") },
  ];

  const trustPoints = [t("trust1"), t("trust2"), t("trust3"), t("trust4")];

  const useCaseFlow = [
    t("useCase1"),
    t("useCase2"),
    t("useCase3"),
    t("useCase4"),
    t("useCase5"),
  ];

  const cardSectionClass =
    "rounded-[22px] border border-[#d6cdbd] bg-[#fffdf8] p-6 md:p-[34px]";
  const ctaPrimaryClass =
    "inline-flex items-center justify-center rounded-full border border-transparent bg-[#1f5f5b] px-[18px] py-[11px] font-bold text-white! transition hover:-translate-y-0.5 hover:bg-[#164745]";
  const ctaSecondaryClass =
    "inline-flex items-center justify-center rounded-full border border-[#d6cdbd] bg-transparent px-[18px] py-[11px] font-bold transition hover:-translate-y-0.5";
  const localeEnLabel = locale === "ar" ? "الإنجليزية" : "English";
  const localeArLabel = locale === "ar" ? "العربية" : "Arabic";

  return (
    <div className="min-h-screen bg-[#f7f2e8] bg-[radial-gradient(circle_at_85%_10%,#d7e9d5_0%,rgba(215,233,213,0)_40%),radial-gradient(circle_at_8%_30%,#f2dfb7_0%,rgba(242,223,183,0)_32%)] px-5 py-5 text-[#12213a]">
      <header className="mx-auto mb-4 flex w-full max-w-275 flex-col items-start gap-3 rounded-2xl border border-[#d6cdbd] bg-[rgba(255,253,248,.8)] px-5 py-3.5 md:flex-row md:items-center md:justify-between">
        <p className="font-bold tracking-[0.4px]">{t("brand")}</p>
        <nav className="flex flex-wrap gap-3 text-[15px] text-[#425068] md:gap-5.5">
          <a href="#how">{t("navHow")}</a>
          <a href="#trust">{t("navTrust")}</a>
          <a href="#join">{t("navJoin")}</a>
        </nav>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d6cdbd] bg-[#fff9ee] p-1">
          <Link
            className={`rounded-full px-2.5 py-1 text-[13px] ${
              locale === "en" ? "bg-[#1f5f5b] text-white!" : "text-[#425068]"
            }`}
            href="/"
            locale="en"
          >
            {localeEnLabel}
          </Link>
          <Link
            className={`rounded-full px-2.5 py-1 text-[13px] ${
              locale === "ar" ? "bg-[#1f5f5b] text-white!" : "text-[#425068]"
            }`}
            href="/"
            locale="ar"
          >
            {localeArLabel}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-275 gap-5.5">
        <section className={cardSectionClass}>
          <p className="w-fit rounded-full border border-[#d6cdbd] bg-[#fef8ea] px-3.5 py-1.75 text-sm text-[#84683b]">
            {t("badge")}
          </p>
          <h1 className="my-2 max-w-[15ch] font-(--font-playfair) text-[clamp(2rem,5vw,3.65rem)] leading-[1.05] text-balance">
            {t("heroTitle")}
          </h1>
          <p className="max-w-[65ch] text-[clamp(1rem,1.7vw,1.1rem)] leading-[1.7] text-[#425068]">
            {t("heroLead")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className={ctaPrimaryClass} href="https://forms.gle/example-lawyers-network">
              {t("joinAsLawyer")}
            </a>
            <a className={ctaSecondaryClass} href="#how">
              {t("seeHow")}
            </a>
          </div>
          <div className="mt-7.5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
            <article className="rounded-[14px] border border-[#d6cdbd] bg-[#fffcf4] p-3.5">
              <p className="text-[1.15rem] font-extrabold">{t("stat1Value")}</p>
              <p className="mt-1 text-[0.93rem] text-[#425068]">{t("stat1Label")}</p>
            </article>
            <article className="rounded-[14px] border border-[#d6cdbd] bg-[#fffcf4] p-3.5">
              <p className="text-[1.15rem] font-extrabold">{t("stat2Value")}</p>
              <p className="mt-1 text-[0.93rem] text-[#425068]">{t("stat2Label")}</p>
            </article>
            <article className="rounded-[14px] border border-[#d6cdbd] bg-[#fffcf4] p-3.5">
              <p className="text-[1.15rem] font-extrabold">{t("stat3Value")}</p>
              <p className="mt-1 text-[0.93rem] text-[#425068]">{t("stat3Label")}</p>
            </article>
          </div>
        </section>

        <section className={cardSectionClass} id="how">
          <h2 className="mb-4.5 font-(--font-playfair) text-[clamp(1.6rem,3vw,2.3rem)] text-balance">
            {t("howTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {howItWorks.map((item) => (
              <article
                className="rounded-[14px] border border-[#d6cdbd] bg-[#fdf8ef] p-4.5"
                key={item.title}
              >
                <h3 className="mb-2 text-[1.06rem] font-semibold">{item.title}</h3>
                <p className="leading-[1.6] text-[#425068]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cardSectionClass} id="trust">
          <h2 className="mb-4.5 font-(--font-playfair) text-[clamp(1.6rem,3vw,2.3rem)] text-balance">
            {t("trustTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {trustPoints.map((point) => (
              <p
                className="rounded-[10px] border-s-4 border-[#b88a44] bg-[#fff9ee] p-3.5 leading-[1.6]"
                key={point}
              >
                {point}
              </p>
            ))}
          </div>
        </section>

        <section className={cardSectionClass}>
          <h2 className="mb-4.5 font-(--font-playfair) text-[clamp(1.6rem,3vw,2.3rem)] text-balance">
            {t("useCaseTitle")}
          </h2>
          <div className="grid gap-2.5">
            {useCaseFlow.map((step, index) => (
              <div
                className="grid grid-cols-[34px_1fr] items-start gap-2.5 rounded-xl border border-[#d6cdbd] bg-[#fffcf6] p-3"
                key={step}
              >
                <span className="grid h-8.5 w-8.5 place-items-center rounded-full bg-[#1f5f5b] font-bold text-white!">
                  {index + 1}
                </span>
                <p className="leading-[1.55] text-[#425068]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={cardSectionClass} id="join">
          <h2 className="mb-4.5 font-(--font-playfair) text-[clamp(1.6rem,3vw,2.3rem)] text-balance">
            {t("ctaTitle")}
          </h2>
          <p className="max-w-[62ch] text-[#425068]">{t("ctaLead")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className={ctaPrimaryClass} href="https://forms.gle/example-lawyers-network">
              {t("applyEarly")}
            </a>
            <a
              className={ctaSecondaryClass}
              href="https://wa.me/201000000000?text=I%20want%20to%20join%20Egyptian%20Lawyers%20Network"
            >
              {t("contactWhatsApp")}
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-4 flex w-full max-w-275 flex-col justify-between gap-2.5 border-t border-[#d6cdbd] px-4.5 py-3 text-[0.93rem] text-[#425068] md:flex-row">
        <p>{t("brand")}</p>
        <p>{t("footerMvp")}</p>
      </footer>
    </div>
  );
}
