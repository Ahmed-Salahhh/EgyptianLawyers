"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const pillars = [
  {
    tag: "Core Strength",
    title: "Innovative Solutions",
    desc: "Cutting-edge technology tailored to each client's unique needs — from discovery workshops to production-ready systems built for scale.",
    short: "Custom-built tech for every challenge.",
    image: "/service/product-discovery.png",
    icon: "bulb",
  },
  {
    tag: "Business Impact",
    title: "Business Growth",
    desc: "Effective solutions engineered to move the needle — aligning product decisions directly with your core business objectives.",
    short: "Results that directly impact your revenue.",
    image: "/service/web-mobile-engineering.png",
    icon: "growth",
  },
  {
    tag: "Our Promise",
    title: "Quality Service",
    desc: "Built on years of consistent delivery. We don't just ship — we maintain, improve, and stand behind everything we build.",
    short: "Reliability and excellence, always.",
    image: "/service/software-support.png",
    icon: "star",
  },
  {
    tag: "Future-Ready",
    title: "Digital Transformation",
    desc: "Modernising legacy systems, digitising workflows, and embedding technology into the heart of your operations.",
    short: "From legacy to leading-edge.",
    image: "/service/team-as-a-service.png",
    icon: "transform",
  },
];

const stats = [
  { value: "2018", label: "Founded" },
  { value: "7+", label: "Years" },
  { value: "20+", label: "Projects" },
];

function PillarGlyph({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    bulb: "M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 12 2ZM9 21h6M10 17h4",
    growth: "M22 12h-4l-3 9L9 3l-3 9H2",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z",
    transform: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z",
  };
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[kind] ?? paths.bulb} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PillarTimelineItem({
  title, idx, total, progress,
}: {
  title: string; idx: number; total: number; progress: MotionValue<number>;
}) {
  const center = total <= 1 ? 0 : idx / (total - 1);
  const left = Math.max(0, center - 0.18);
  const right = Math.min(1, center + 0.18);
  const opacity = useTransform(progress, [left, center, right], [0.4, 1, 0.4]);
  const x = useTransform(progress, [left, center, right], [0, 10, 0]);
  const color = useTransform(progress, [left, center, right], ["var(--color-text-muted)", "var(--color-text-primary)", "var(--color-text-muted)"]);
  const dotScale = useTransform(progress, [left, center, right], [0.8, 1.25, 0.8]);
  const dotOpacity = useTransform(progress, [left, center, right], [0.3, 1, 0.3]);

  return (
    <li className="relative pl-7">
      <motion.span
        style={{ scale: dotScale, opacity: dotOpacity }}
        className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[var(--color-brand-blue)]"
      />
      <motion.p style={{ opacity, x, color }} className="py-3 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </motion.p>
    </li>
  );
}

function AboutImageLayer({ pillar, opacity = 1, y = 0, scale = 1 }: {
  pillar: typeof pillars[0]; opacity?: number; y?: number; scale?: number;
}) {
  return (
    <motion.article
      style={{ opacity, y, scale }}
      transition={{ duration: 0.2, ease: "linear" }}
      className="absolute inset-0"
    >
      <div className="relative h-full overflow-hidden bg-[var(--color-bg-main)]">
        <Image src={pillar.image} alt={pillar.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(3,10,24,0.12)_0%,rgba(3,10,24,0.4)_46%,rgba(3,10,24,0.85)_100%)] opacity-[0.95]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,var(--color-brand-blue-glow),transparent_30%)]" />
      </div>
    </motion.article>
  );
}

function AboutExperience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrub, setScrub] = useState({ from: 0, to: 0, t: 0 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const maxIndex = pillars.length - 1;
    const scaled = Math.max(0, Math.min(maxIndex, latest * maxIndex));
    const from = Math.floor(scaled);
    const to = Math.min(maxIndex, from + 1);
    const t = scaled - from;
    setScrub((prev) => {
      if (prev.from === from && prev.to === to && Math.abs(prev.t - t) < 0.01) return prev;
      return { from, to, t };
    });
  });

  const blend = scrub.t * scrub.t * (3 - 2 * scrub.t);
  const activeIndex = Math.round(scrub.from + scrub.t);
  const activePillar = pillars[activeIndex];

  return (
    <section id="about" ref={sectionRef} className="relative min-h-[280vh] w-full lg:min-h-[320vh]">
      <div
        style={{ "--header-offset": "73px" } as React.CSSProperties}
        className="sticky top-[var(--header-offset)] h-[calc(100vh-var(--header-offset))] overflow-hidden bg-[linear-gradient(180deg,var(--color-bg-main)_0%,var(--color-bg-card)_52%,var(--color-bg-main)_100%)]"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-brand-blue)] opacity-[0.2] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-[var(--color-brand-cyan)] opacity-[0.12] blur-3xl" />

        <div className="relative grid h-full gap-0 lg:grid-cols-[0.88fr_1.12fr]">
          {/* Left — fixed info + pillar list */}
          <aside className="border-b border-[var(--color-border-light)] px-6 py-8 pb-6 sm:px-10 lg:flex lg:h-full lg:flex-col lg:justify-center lg:border-b-0 lg:border-r lg:border-[var(--color-border-light)] lg:px-12 lg:py-12">
            <div className="w-full lg:mx-auto lg:max-w-[34rem]">
              <div className="inline-flex items-center gap-2 text-[var(--color-text-brand)]">
                <span className="inline-flex h-3.5 w-3.5 rounded-[3px] bg-[var(--color-brand-blue)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">About IKEN</span>
              </div>
              <h2 className="mt-4 max-w-[18ch] text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
                Empowering Businesses{" "}
                <span className="bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] bg-clip-text text-transparent">Since 2018</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                IKEN Technology pioneers cutting-edge solutions tailored for all business sizes. Backed by over 7 years of unparalleled expertise, we build long-term, reliable partnerships that deliver real results — from startups to enterprise.
              </p>

              {/* Pillar timeline list */}
              <ol className="relative mt-8 pl-5">
                <div className="absolute left-0 top-0 h-full w-px bg-[var(--color-bg-glass-strong)]" />
                <motion.div
                  style={{ height: progressHeight }}
                  className="absolute left-0 top-0 w-px origin-top bg-[linear-gradient(180deg,var(--color-brand-blue),var(--color-brand-cyan))]"
                />
                {pillars.map((p, idx) => (
                  <PillarTimelineItem
                    key={p.title}
                    title={p.title}
                    idx={idx}
                    total={pillars.length}
                    progress={scrollYProgress}
                  />
                ))}
              </ol>
            </div>
          </aside>

          {/* Right — image crossfade */}
          <div className="relative h-full p-4 lg:p-5">
            <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--color-border-light)]">
              {/* Counter */}
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 font-mono text-xs tracking-widest backdrop-blur-sm border border-white/10">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="inline-block text-white"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="text-white/40">/</span>
                <span className="text-white/40">{String(pillars.length).padStart(2, "0")}</span>
              </div>

              {/* Crossfade images */}
              <AboutImageLayer
                key={`${pillars[scrub.from].title}-from`}
                pillar={pillars[scrub.from]}
                opacity={1 - blend} y={-12 * blend} scale={1 - 0.018 * blend}
              />
              {scrub.to !== scrub.from && (
                <AboutImageLayer
                  key={`${pillars[scrub.to].title}-to`}
                  pillar={pillars[scrub.to]}
                  opacity={blend} y={20 - 20 * blend} scale={0.982 + 0.018 * blend}
                />
              )}

              {/* Text overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent_0%,rgba(6,12,24,0.85)_40%,var(--color-brand-deep)_100%)] px-6 pb-8 pt-20 lg:px-8 lg:pb-10">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activePillar.title}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                    className="max-w-3xl"
                  >
                    <div className="border-t border-[var(--color-border-light)] pt-5">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-brand)] bg-[linear-gradient(145deg,var(--color-brand-blue),var(--color-brand-cyan))] text-[var(--color-text-primary)]">
                          <PillarGlyph kind={activePillar.icon} />
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.85rem]">
                          {activePillar.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70">{activePillar.desc}</p>
                    </div>
                    <div className="mt-4 border-l-2 border-[var(--color-brand-blue)] pl-3">
                      <p className="text-xs font-medium uppercase tracking-[0.13em] text-white/50">{activePillar.short}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return <AboutExperience />;
}
