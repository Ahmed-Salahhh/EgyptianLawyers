"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { type CSSProperties, useRef, useState } from "react";

type ServiceItem = {
  title: string;
  desc: string;
  short: string;
  image: string;
  icon: string;
};

const services: ServiceItem[] = [
  {
    title: "Product Discovery",
    desc: "Turn business ideas into clear, validated product roadmaps with measurable milestones.",
    short: "Workshops, scope, and delivery blueprint.",
    image: "/service/product-discovery.png",
    icon: "discovery",
  },
  {
    title: "Web & Mobile Engineering",
    desc: "Design and build high-performance digital products for customers and internal teams.",
    short: "Production-ready apps with scalable architecture.",
    image: "/service/web-mobile-engineering.png",
    icon: "engineering",
  },
  {
    title: "Enterprise Integrations",
    desc: "Connect CRMs, payment systems, ERPs, and custom services into one reliable workflow.",
    short: "Unified systems and dependable data pipelines.",
    image: "/service/enterprise-integrations.png",
    icon: "enterprise",
  },
  {
    title: "Mobile Management",
    desc: "Design, deliver, and improve mobile experiences that users keep coming back to.",
    short: "Native-feel UX, speed, and continuous updates.",
    image: "/service/mobile-management.png",
    icon: "mobile",
  },
  {
    title: "Software Support",
    desc: "Ongoing maintenance and support to keep products secure, stable, and performant.",
    short: "Monitoring, fixes, and release reliability.",
    image: "/service/software-support.png",
    icon: "support",
  },
  {
    title: "Team As A Service",
    desc: "Dedicated squads that plan, build, and continuously improve your product pipeline.",
    short: "Flexible experts integrated with your business.",
    image: "/service/team-as-a-service.png",
    icon: "team",
  },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function ServiceGlyph({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    discovery: "M4 6h16M4 12h12M4 18h8M16 12l2 2 4-4",
    engineering: "M9 3 4 7v10l5 4 5-4V7L9 3Zm6 4 5-4m0 0v6m0-6h-6",
    enterprise: "M4 20h16M6 20V8h12v12M9 12h2m2 0h2m-6 4h2m2 0h2",
    mobile: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 15h.01",
    support: "M12 3a8 8 0 0 0-8 8v3l-1 3h6v-4H7v-2a5 5 0 1 1 10 0v2h-2v4h6l-1-3v-3a8 8 0 0 0-8-8Z",
    team: "M8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM3 20a5 5 0 0 1 10 0m-8 0h8m2 0a5 5 0 0 1 6-4.9",
  };

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[kind] ?? paths.discovery} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceTimelineItem({
  title,
  idx,
  total,
  progress,
}: {
  title: string;
  idx: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const center = total <= 1 ? 0 : idx / (total - 1);
  const left = Math.max(0, center - 0.14);
  const right = Math.min(1, center + 0.14);
  const opacity = useTransform(progress, [left, center, right], [0.46, 1, 0.5]);
  const x = useTransform(progress, [left, center, right], [0, 10, 0]);
  const color = useTransform(progress, [left, center, right], ["#7f96bc", "#f1f6ff", "#7f96bc"]);
  const dotScale = useTransform(progress, [left, center, right], [0.85, 1.2, 0.85]);
  const dotOpacity = useTransform(progress, [left, center, right], [0.35, 1, 0.35]);
  const lineOpacity = useTransform(progress, [left, center, right], [0, 1, 0]);

  return (
    <li className="relative pl-7">
      <motion.span
        style={{ scale: dotScale, opacity: dotOpacity }}
        className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#5eb8ff]"
      />
      <motion.span
        style={{ opacity: lineOpacity }}
        className="absolute left-0 top-1/2 h-[1px] w-4 -translate-y-1/2 bg-[linear-gradient(90deg,#5eb8ff,transparent)]"
      />
      <motion.p style={{ opacity, x, color }} className="py-3 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </motion.p>
    </li>
  );
}

function ServiceShowcaseImageLayer({
  service,
  opacity = 1,
  y = 0,
  scale = 1,
}: {
  service: ServiceItem;
  opacity?: number;
  y?: number;
  scale?: number;
}) {
  return (
    <motion.article
      style={{ opacity, y, scale }}
      transition={{ duration: 0.2, ease: "linear" }}
      className="absolute inset-0"
    >
      <div className="relative h-full overflow-hidden bg-[#081227]">
        <Image src={service.image} alt={service.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(3,10,24,0.08)_0%,rgba(3,10,24,0.32)_46%,rgba(3,10,24,0.76)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(79,170,255,0.18),transparent_30%)]" />
      </div>
    </motion.article>
  );
}

function ServicesExperience() {
  const shouldReduceMotion = useReducedMotion();
  const servicesRef = useRef<HTMLElement | null>(null);
  const [scrub, setScrub] = useState({ from: 0, to: 0, t: 0 });
  const stickyStyle = { "--header-offset": "73px" } as CSSProperties;
  const { scrollYProgress } = useScroll({
    target: servicesRef,
    offset: ["start start", "end end"],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const maxIndex = services.length - 1;
    const scaled = Math.max(0, Math.min(maxIndex, latest * maxIndex));
    const from = Math.floor(scaled);
    const to = Math.min(maxIndex, from + 1);
    const t = scaled - from;

    setScrub((prev) => {
      if (prev.from === from && prev.to === to && Math.abs(prev.t - t) < 0.01) {
        return prev;
      }
      return { from, to, t };
    });
  });

  const blend = scrub.t * scrub.t * (3 - 2 * scrub.t);
  const reduceMotionIndex = Math.round(scrub.from + scrub.t);
  const activeService = services[reduceMotionIndex];

  return (
    <section ref={servicesRef} className="relative min-h-[280vh] w-full lg:min-h-[320vh]">
      <div
        style={stickyStyle}
        className="sticky top-[var(--header-offset)] h-[calc(100vh-var(--header-offset))] overflow-hidden bg-[linear-gradient(180deg,#050f23_0%,#071734_52%,#061227_100%)]"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2f8fff]/24 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-[#0bb4ff]/16 blur-3xl" />

        <div className="relative grid h-full gap-0 lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="border-b border-white/10 px-6 py-8 sm:px-10 lg:flex lg:h-full lg:flex-col lg:justify-center lg:border-b-0 lg:border-r lg:border-white/10 lg:px-12 lg:py-12">
            <div className="w-full lg:mx-auto lg:max-w-[34rem]">
              <div className="inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3.5 w-3.5 rounded-[3px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Our Featured Services</span>
              </div>
              <h3 className="mt-4 max-w-[18ch] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                We Provide Great IT &amp; Business Solutions
              </h3>
              <ol className="mt-8 border-l border-white/15 pl-5">
                {services.map((service, idx) => (
                  <ServiceTimelineItem
                    key={service.title}
                    title={service.title}
                    idx={idx}
                    total={services.length}
                    progress={scrollYProgress}
                  />
                ))}
              </ol>
            </div>
          </aside>

          <div className="relative h-full p-4 lg:p-5">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/10">
              {shouldReduceMotion ? (
                <ServiceShowcaseImageLayer service={services[reduceMotionIndex]} />
              ) : (
                <>
                  <ServiceShowcaseImageLayer
                    key={`${services[scrub.from].title}-from`}
                    service={services[scrub.from]}
                    opacity={1 - blend}
                    y={-12 * blend}
                    scale={1 - 0.018 * blend}
                  />
                  {scrub.to !== scrub.from && (
                    <ServiceShowcaseImageLayer
                      key={`${services[scrub.to].title}-to`}
                      service={services[scrub.to]}
                      opacity={blend}
                      y={20 - 20 * blend}
                      scale={0.982 + 0.018 * blend}
                    />
                  )}
                </>
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 bg-[linear-gradient(180deg,rgba(6,17,37,0)_0%,rgba(6,17,37,0.76)_34%,#061125_100%)] px-6 pb-14 pt-20 lg:inset-x-5 lg:bottom-5 lg:px-8 lg:pb-16">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeService.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="max-w-3xl"
                >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#dbeafe] backdrop-blur-sm">
                    <span>Now Viewing</span>
                    <span>{activeService.title}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-5">
                    <div className="max-w-[38ch] space-y-2">
                      <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
                        {activeService.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#d5e3fa]">{activeService.desc}</p>
                    </div>
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-[#8bc9ff]/40 bg-[linear-gradient(145deg,#2166de,#40b1ff)] text-white">
                      <ServiceGlyph kind={activeService.icon} />
                    </div>
                  </div>
                  <div className="mt-4 max-w-[32rem] rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#dcedff]">{activeService.short}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-7 left-6 right-6 rounded-full bg-white/12 p-1 lg:bottom-9 lg:left-8 lg:right-8">
              <motion.div
                style={shouldReduceMotion ? undefined : { width: progressWidth }}
                className="h-1.5 rounded-full bg-[linear-gradient(90deg,#2b7dff,#5ed0ff)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <motion.section
      id="services"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ duration: 0.45 }}
      className="pb-14"
    >
      <ServicesExperience />
    </motion.section>
  );
}
