import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
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

import FadeIn from "@/components/FadeIn";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Landing");

  const howItWorks = [
    { title: t("how1Title"), description: t("how1Desc"), icon: <Gavel className="w-8 h-8 md:w-12 md:h-12 text-primary" /> },
    { title: t("how2Title"), description: t("how2Desc"), icon: <Users className="w-8 h-8 md:w-12 md:h-12 text-primary" /> },
    { title: t("how3Title"), description: t("how3Desc"), icon: <Briefcase className="w-8 h-8 md:w-12 md:h-12 text-primary" /> },
  ];

  const trustPoints = [t("trust1"), t("trust2"), t("trust3"), t("trust4")];

  const useCaseFlow = [
    t("useCase1"),
    t("useCase2"),
    t("useCase3"),
    t("useCase4"),
    t("useCase5"),
  ];

  const ctaPrimaryClass =
    "group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 md:px-10 md:py-5 text-[16px] md:text-[18px] font-bold transition-all duration-500 hover:scale-105 hover:bg-text-main hover:shadow-[0_0_40px_var(--color-primary-08)]";
  
  const ctaSecondaryClass =
    "inline-flex items-center justify-center gap-2 rounded-full border border-text-main/20 bg-transparent px-8 py-4 md:px-10 md:py-5 text-[16px] md:text-[18px] font-bold text-text-main transition-all duration-500 hover:border-primary/50 hover:bg-text-main/5 hover:text-primary";

  const localeEnLabel = locale === "ar" ? "الإنجليزية" : "English";
  const localeArLabel = locale === "ar" ? "العربية" : "Arabic";
  const isRtl = locale === 'ar';

  return (
    <div className="min-h-screen bg-background-main text-text-main selection:bg-primary selection:text-background-main font-(--font-ibm-plex-arabic) overflow-x-hidden">
      
      {/* Super Minimalist Edge-to-Edge Header */}
      <header className="absolute top-0 w-full z-50 py-8 px-6 md:px-12 flex items-center justify-between border-b border-text-main/5 bg-background-main/50 backdrop-blur-xl">
        <div className="flex items-center gap-4 opacity-90 hover:opacity-100 transition-opacity">
          <Scale className="w-10 h-10 md:w-11 md:h-11 text-primary" />
          <p className="font-black tracking-[0.2em] text-[20px] md:text-[22px] text-text-main uppercase">{t("brand")}</p>
        </div>
        
        <nav className="hidden lg:flex items-center gap-12 text-[14px] font-bold tracking-[0.2em] uppercase text-text-muted">
          <a href="#how" className="hover:text-text-main transition-colors">{t("navHow")}</a>
          <a href="#trust" className="hover:text-text-main transition-colors">{t("navTrust")}</a>
          <a href="#join" className="text-primary hover:text-text-main transition-colors">{t("navJoin")}</a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher 
            locale={locale} 
            localeEnLabel={localeEnLabel} 
            localeArLabel={localeArLabel} 
          />
          <div className="w-px h-6 bg-text-main/10 mx-1" />
          <ThemeToggle />
        </div>
      </header>

      {/* 1. HERO: Full Screen, Massive Typography */}
      <section className="relative min-h-[95vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-24 overflow-hidden">
        {/* Soft immersive dark gradient, no borders */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--color-primary-06)_0%,_var(--color-background-main)_60%)] pointer-events-none" />
        <div className="absolute top-1/4 -start-32 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none animate-float" />
        
        <div className="relative z-10 max-w-5xl">
          <FadeIn delay={0.2} className="inline-flex items-center gap-3 mb-8 md:mb-12">
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-primary uppercase">
              {t("badge")}
            </span>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <h1 className={`font-(--font-outfit) text-[clamp(3.5rem,8vw,6.5rem)] ${isRtl ? 'leading-[1.15]' : 'leading-[0.95]'} text-text-main font-black tracking-tighter mb-8 md:mb-10 max-w-4xl text-balance`}>
              {t("heroTitle")}
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.6}>
            <p className="text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.75] text-text-muted max-w-3xl mb-12 md:mb-16 font-light text-balance">
              {t("heroLead")}
            </p>
          </FadeIn>
          
          <FadeIn delay={0.8} className="flex flex-wrap items-center gap-6">
            <a className={ctaPrimaryClass} href="https://forms.gle/example-lawyers-network">
              <span className="text-background-main group-hover:text-background-main">{t("joinAsLawyer")}</span>
              <ArrowRight className={`w-5 h-5 text-background-main transition-transform group-hover:text-background-main ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </a>
            <a className={ctaSecondaryClass} href="#how">
              {t("seeHow")}
            </a>
          </FadeIn>
        </div>

        {/* Minimalist Floating Stats replacing the cards */}
        <FadeIn delay={1} className="mt-20 lg:absolute lg:end-12 lg:bottom-12 lg:w-[400px] flex flex-col gap-8 border-s border-text-main/10 ps-8">
          <div className="flex items-center gap-6 group cursor-default">
            <Users className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
            <div>
              <p className="text-3xl font-black text-text-main tracking-tight">{t("stat1Value")}</p>
              <p className="text-[14px] text-text-muted uppercase tracking-widest mt-1">{t("stat1Label")}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 group cursor-default">
            <MapPin className="w-8 h-8 text-icon-blue/60 group-hover:text-icon-blue-hover transition-colors" />
            <div>
              <p className="text-3xl font-black text-text-main tracking-tight">{t("stat2Value")}</p>
              <p className="text-[14px] text-text-muted uppercase tracking-widest mt-1">{t("stat2Label")}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 group cursor-default">
            <ShieldCheck className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
            <div>
              <p className="text-3xl font-black text-text-main tracking-tight">{t("stat3Value")}</p>
              <p className="text-[14px] text-text-muted uppercase tracking-widest mt-1">{t("stat3Label")}</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 2. HOW IT WORKS: Alternating fluid blocks, no cards */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-background-secondary" id="how">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-24 flex flex-col items-center text-center">
            <h2 className={`font-(--font-outfit) text-[clamp(3rem,6vw,4.5rem)] font-bold text-text-main tracking-tighter ${isRtl ? 'leading-[1.2]' : 'leading-tight'} mb-6`}>
              {t("howTitle")}
            </h2>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </FadeIn>

          <div className="grid grid-cols-1 gap-24">
            {howItWorks.map((item, i) => (
              <FadeIn 
                delay={i * 0.2}
                key={item.title} 
                className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 group ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className={`flex-1 flex w-full ${i % 2 !== 0 ? 'justify-start md:justify-end' : 'justify-start'}`}>
                  <div className="relative flex h-32 w-32 md:h-48 md:w-48 items-center justify-center rounded-full bg-background-main shadow-[inset_0_4px_30px_rgba(255,255,255,0.03)] border border-text-main/5 group-hover:border-primary/20 transition-all duration-700">
                    {/* Background glow for icon */}
                    <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-700" />
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1 space-y-4 md:space-y-6">
                  <h3 className="text-3xl md:text-5xl font-bold text-text-main tracking-tight group-hover:text-primary transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed text-text-muted font-light max-w-lg">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUST SECTION: Massive typography list, no borders */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-background-main overflow-hidden relative" id="trust">
        <div className="absolute end-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 relative z-10 w-full">
            <FadeIn>
              <h2 className={`font-(--font-outfit) text-[clamp(3.5rem,6vw,5rem)] ${isRtl ? 'leading-[1.2]' : 'leading-none'} font-bold text-text-main tracking-tighter mb-16 text-balance`}>
                {t("trustTitle")}
              </h2>
            </FadeIn>
            
            <div className="flex flex-col gap-10">
              {trustPoints.map((point, idx) => (
                <FadeIn delay={0.2 + (idx * 0.15)} className="flex items-start gap-6 group" key={idx}>
                  <div className="flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-text-muted group-hover:text-text-main transition-colors duration-300">
                    {point}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex w-full flex-1 justify-center relative">
            <Trophy className="w-80 h-80 text-primary opacity-10 drop-shadow-[0_0_50px_var(--color-primary-08)]" strokeWidth={0.5} />
          </div>
        </div>
      </section>

      {/* 4. USE CASES TIMELINE: Fluid seamless reading flow */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-background-secondary">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="mb-20">
            <h2 className={`font-(--font-outfit) text-[clamp(3rem,6vw,4.5rem)] font-bold text-text-main tracking-tighter ${isRtl ? 'leading-[1.2]' : 'leading-tight'} mb-6`}>
              {t("useCaseTitle")}
            </h2>
            <p className="text-xl text-primary uppercase tracking-widest font-bold">
              {t("useCaseSubtitle")}
            </p>
          </FadeIn>
          
          <div className="relative">
            {/* Extremely subtle connection line */}
            <div className={`absolute top-0 bottom-0 w-[1px] bg-text-main/10 start-[23px] md:start-[31px]`} />
            
            <div className="flex flex-col gap-0">
              {useCaseFlow.map((step, index) => (
                <FadeIn
                  delay={index * 0.15}
                  distance={20}
                  className="group relative flex items-start gap-8 md:gap-16 py-8"
                  key={index}
                >
                  <div className="relative z-10 flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-background-main text-xl md:text-2xl font-light text-text-muted border border-text-main/5 group-hover:text-primary group-hover:border-primary/30 transition-all duration-500">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1 md:pt-3">
                    <p className="text-2xl md:text-3xl font-light leading-tight text-text-muted group-hover:text-text-main transition-colors duration-500">
                      {step}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION: Massive minimal block */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center py-32 px-6 md:px-12 bg-background-main overflow-hidden" id="join">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary-08)_0%,_var(--color-background-main)_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <FadeIn>
            <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-primary mb-10 opacity-80" strokeWidth={1} />
            
            <h2 className={`mb-8 font-(--font-outfit) text-[clamp(3.5rem,7vw,6rem)] ${isRtl ? 'leading-[1.2]' : 'leading-[1.05]'} font-black text-text-main text-balance tracking-tighter`}>
              {t("ctaTitle")}
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="mb-16 text-xl md:text-2xl font-light leading-relaxed text-text-muted text-balance max-w-2xl">
              {t("ctaLead")}
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4} className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
            <a className={ctaPrimaryClass} href="https://forms.gle/example-lawyers-network">
              <span className="text-background-main group-hover:text-background-main">{t("applyEarly")}</span>
            </a>
            <a
              className={ctaSecondaryClass}
              href="https://wa.me/201000000000?text=I%20want%20to%20join%20Egyptian%20Lawyers%20Network"
            >
              {t("contactWhatsApp")}
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Extremely Minimal Footer */}
      <footer className="w-full flex flex-col items-center justify-between gap-6 py-12 px-12 bg-background-main border-t border-text-main/5 text-[13px] md:flex-row uppercase tracking-widest text-text-muted font-bold font-sans">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-primary opacity-60" />
          <p>{t("brand")}</p>
        </div>
        <div>
           <p className="opacity-50">{t("footerMvp")}</p>
        </div>
      </footer>
    </div>
  );
}
