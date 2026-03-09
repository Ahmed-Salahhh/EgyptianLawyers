import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { 
  Scale, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Trophy, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Gavel,
  BookOpen
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Landing");

  const howItWorks = [
    { title: t("how1Title"), description: t("how1Desc"), icon: <Gavel className="w-6 h-6 text-[#b88a44]" /> },
    { title: t("how2Title"), description: t("how2Desc"), icon: <Users className="w-6 h-6 text-[#b88a44]" /> },
    { title: t("how3Title"), description: t("how3Desc"), icon: <Briefcase className="w-6 h-6 text-[#b88a44]" /> },
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
    "relative overflow-hidden rounded-[28px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 md:p-[42px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";
  
  const ctaPrimaryClass =
    "group inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-[#1f5f5b] px-6 py-3.5 text-[15px] font-bold text-white! shadow-lg shadow-[#1f5f5b]/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[#164745] hover:shadow-xl hover:shadow-[#1f5f5b]/40";
  
  const ctaSecondaryClass =
    "inline-flex items-center justify-center rounded-full border border-[#d6cdbd] bg-white/50 backdrop-blur-sm px-6 py-3.5 text-[15px] font-bold text-[#1f5f5b] transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-md";

  const localeEnLabel = locale === "ar" ? "الإنجليزية" : "English";
  const localeArLabel = locale === "ar" ? "العربية" : "Arabic";
  
  const isRtl = locale === 'ar';

  return (
    <div className="min-h-screen bg-[#f7f2e8] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#d7e9d5]/40 via-[#f7f2e8] to-[#f2dfb7]/40 text-[#12213a] selection:bg-[#1f5f5b] selection:text-white font-(--font-cairo)">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d7e9d5] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-[#f2dfb7] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative px-5 py-5 max-w-7xl mx-auto">
        {/* Header */}
        <header className="sticky top-5 z-50 mx-auto mb-10 flex w-full max-w-5xl flex-col items-center gap-4 rounded-full border border-white/50 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-sm md:flex-row md:justify-between transition-all duration-300 hover:bg-white/80">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#1f5f5b]" />
            <p className="font-bold tracking-[0.4px] text-lg text-[#1f5f5b]">{t("brand")}</p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-[15px] font-medium text-[#425068] md:gap-8">
            <a href="#how" className="hover:text-[#1f5f5b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#1f5f5b] after:transition-all hover:after:w-full">{t("navHow")}</a>
            <a href="#trust" className="hover:text-[#1f5f5b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#1f5f5b] after:transition-all hover:after:w-full">{t("navTrust")}</a>
            <a href="#join" className="hover:text-[#1f5f5b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#1f5f5b] after:transition-all hover:after:w-full">{t("navJoin")}</a>
          </nav>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/50 p-1 shadow-inner">
            <Link
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-300 ${
                locale === "en" ? "bg-[#1f5f5b] text-white shadow-md" : "text-[#425068] hover:bg-white/80"
              }`}
              href="/"
              locale="en"
            >
              {localeEnLabel}
            </Link>
            <Link
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-300 ${
                locale === "ar" ? "bg-[#1f5f5b] text-white shadow-md" : "text-[#425068] hover:bg-white/80"
              }`}
              href="/"
              locale="ar"
            >
              {localeArLabel}
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          {/* Hero Section */}
          <section className={`${cardSectionClass} text-center md:text-start flex flex-col md:flex-row items-center gap-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]`}>
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b88a44]/30 bg-[#fef8ea]/80 px-4 py-1.5 text-sm font-medium text-[#84683b] backdrop-blur-sm shadow-sm md:mx-0 mx-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b88a44] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b88a44]"></span>
                </span>
                {t("badge")}
              </div>
              <h1 className="font-(--font-playfair) text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-[#12213a] font-bold tracking-tight text-balance">
                {t("heroTitle")}
              </h1>
              <p className="text-[clamp(1.1rem,1.8vw,1.25rem)] leading-[1.7] text-[#425068]/90 max-w-2xl text-balance">
                {t("heroLead")}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <a className={ctaPrimaryClass} href="https://forms.gle/example-lawyers-network">
                  {t("joinAsLawyer")}
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </a>
                <a className={ctaSecondaryClass} href="#how">
                  {t("seeHow")}
                </a>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="w-full md:w-[340px] grid grid-cols-1 gap-4 shrink-0">
              <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white to-white/60 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#1f5f5b]/5 rounded-full blur-xl group-hover:bg-[#1f5f5b]/10 transition-colors" />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f5f5b]/10 text-[#1f5f5b]">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#12213a]">{t("stat1Value")}</p>
                    <p className="text-sm font-medium text-[#425068]">{t("stat1Label")}</p>
                  </div>
                </div>
              </article>
              <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white to-white/60 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#b88a44]/5 rounded-full blur-xl group-hover:bg-[#b88a44]/10 transition-colors" />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b88a44]/10 text-[#b88a44]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#12213a]">{t("stat2Value")}</p>
                    <p className="text-sm font-medium text-[#425068]">{t("stat2Label")}</p>
                  </div>
                </div>
              </article>
              <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white to-white/60 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#1f5f5b]/5 rounded-full blur-xl group-hover:bg-[#1f5f5b]/10 transition-colors" />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f5f5b]/10 text-[#1f5f5b]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#12213a]">{t("stat3Value")}</p>
                    <p className="text-sm font-medium text-[#425068]">{t("stat3Label")}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* How It Works Section */}
          <section className={`${cardSectionClass} opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]`} id="how">
            <div className="text-center mb-10">
              <h2 className="mb-4 font-(--font-playfair) text-[clamp(2rem,4vw,2.75rem)] font-bold text-[#12213a]">
                {t("howTitle")}
              </h2>
              <div className="h-1 w-20 bg-[#b88a44] mx-auto rounded-full opacity-60" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {howItWorks.map((item, i) => (
                <article
                  className="group relative rounded-2xl border border-white/60 bg-white/50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/80 hover:shadow-xl hover:shadow-[#b88a44]/5"
                  key={item.title}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#f2dfb7]/20 to-transparent rounded-bl-3xl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef8ea] shadow-inner border border-[#d6cdbd]/50 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[#12213a]">{item.title}</h3>
                  <p className="leading-[1.7] text-[#425068]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Trust Section */}
          <section className={`${cardSectionClass} bg-[#1f5f5b]/[0.03] opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]`} id="trust">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="mb-6 font-(--font-playfair) text-[clamp(2rem,4vw,2.75rem)] font-bold text-[#12213a] text-balance">
                  {t("trustTitle")}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {trustPoints.map((point, idx) => (
                    <div
                      className="group flex gap-3 rounded-xl border border-white bg-white/60 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:bg-white/90"
                      key={idx}
                    >
                      <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#b88a44]" />
                      <p className="font-medium leading-[1.6] text-[#2c3951]">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex w-72 h-72 items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1f5f5b]/20 to-[#b88a44]/20 rounded-full animate-pulse-glow" />
                <Trophy className="w-32 h-32 text-[#1f5f5b] drop-shadow-xl" strokeWidth={1} />
              </div>
            </div>
          </section>

          {/* Use Cases Timeline Section */}
          <section className={`${cardSectionClass} opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards]`}>
            <div className="text-center mb-12">
              <h2 className="mb-4 font-(--font-playfair) text-[clamp(2rem,4vw,2.75rem)] font-bold text-[#12213a]">
                {t("useCaseTitle")}
              </h2>
            </div>
            
            <div className="relative mx-auto max-w-3xl">
              {/* Vertical line connecting nodes */}
              <div className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#1f5f5b]/20 via-[#1f5f5b]/20 to-transparent ${isRtl ? 'right-[27px]' : 'left-[27px]'}`} />
              
              <div className="flex flex-col gap-8">
                {useCaseFlow.map((step, index) => (
                  <div
                    className="group relative flex items-start gap-6"
                    key={index}
                  >
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#fffcf6] bg-[#1f5f5b] text-lg font-bold text-white shadow-md transition-transform group-hover:scale-110">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm transition-all hover:bg-white hover:shadow-md mt-1">
                      <p className="text-lg font-medium leading-[1.6] text-[#2c3951]">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#1f5f5b] p-10 md:p-14 text-center shadow-2xl opacity-0 animate-[fade-in-up_0.8s_ease-out_0.8s_forwards]" id="join">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <BookOpen className="w-12 h-12 text-[#b88a44] mx-auto mb-6 opacity-80" />
              <h2 className="mb-5 font-(--font-playfair) text-[clamp(2rem,4vw,3rem)] font-bold text-white text-balance">
                {t("ctaTitle")}
              </h2>
              <p className="mb-10 text-[1.1rem] leading-relaxed text-white/80 text-balance">
                {t("ctaLead")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a className="inline-flex items-center justify-center rounded-full bg-[#b88a44] px-8 py-4 text-[16px] font-bold text-white shadow-lg shadow-[#b88a44]/30 transition-all hover:-translate-y-1 hover:bg-[#a67a3a] hover:shadow-xl hover:shadow-[#b88a44]/40" href="https://forms.gle/example-lawyers-network">
                  {t("applyEarly")}
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-[16px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20"
                  href="https://wa.me/201000000000?text=I%20want%20to%20join%20Egyptian%20Lawyers%20Network"
                >
                  {t("contactWhatsApp")}
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="mx-auto mt-16 flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t border-[#d6cdbd]/40 px-6 py-8 text-[0.95rem] text-[#425068] md:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#84683b]" />
            <p className="font-bold">{t("brand")}</p>
          </div>
          <div className="flex items-center space-x-4">
             <p className="font-medium opacity-80">{t("footerMvp")}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
