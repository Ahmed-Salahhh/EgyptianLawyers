"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const INTRO_R = 0.28;
const IMG_R = 0.46;

const services = [
  {
    tag: "Product Discovery",
    title: "PRODUCT\nDISCOVERY",
    desc: "Turn business ideas into clear, validated product roadmaps with measurable milestones.",
    image: "/service/product-discovery.png",
    num: "01",
  },
  {
    tag: "Custom Software",
    title: "CUSTOM\nSOFTWARE",
    desc: "Tailored software solutions built to solve your unique business challenges and requirements.",
    image: "/service/enterprise-integrations.png",
    num: "02",
  },
  {
    tag: "Web & Mobile Apps",
    title: "WEB &\nMOBILE APPS",
    desc: "Cross-platform applications with seamless, high-performance experiences for customers and teams.",
    image: "/service/web-mobile-engineering.png",
    num: "03",
  },
  {
    tag: "E-Commerce Solutions",
    title: "E-COMMERCE\nSOLUTIONS",
    desc: "Innovative e-commerce platforms that drive online business growth and increase conversions.",
    image: "/service/mobile-management.png",
    num: "04",
  },
  {
    tag: "Maintenance & Support",
    title: "MAINTENANCE\n& SUPPORT",
    desc: "Ongoing assistance and monitoring to keep your products secure, stable, and performing optimally.",
    image: "/service/software-support.png",
    num: "05",
  },
  {
    tag: "Team As A Service",
    title: "TEAM AS\nA SERVICE",
    desc: "Dedicated squads that plan, build, and continuously improve your product pipeline.",
    image: "/service/team-as-a-service.png",
    num: "06",
  },
];

export function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [winW, setWinW] = useState(0);

  useEffect(() => {
    setWinW(window.innerWidth);
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, (v) => {
    if (!winW) return 0;
    const introW = winW * INTRO_R;
    const imgW = winW * IMG_R;
    const totalTrack = introW + services.length * imgW + services.length * 20;
    const maxX = totalTrack - winW;
    return -(v * maxX);
  });

  return (
    <section
      id="services"
      ref={containerRef}
      className="relative bg-[var(--color-bg-main)]"
      style={{ minHeight: `${(services.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Top label */}
        <div className="absolute left-0 top-8 z-10 flex items-center gap-6 px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 text-[var(--color-text-brand)]">
            <span className="inline-flex h-3.5 w-3.5 rounded-[3px] bg-[var(--color-brand-blue)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Our Services</span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Scroll to explore →</span>
        </div>

        {/* Horizontal track */}
        <motion.div
          style={{ x }}
          className="flex h-full will-change-transform"
        >
          {/* Intro card */}
          <div
            className="flex h-full shrink-0 flex-col justify-center overflow-hidden pb-16 pl-8 pt-16 lg:pl-12"
            style={{ width: `${INTRO_R * 100}vw` }}
          >
            <h2 className="text-[clamp(1.8rem,3vw,4rem)] font-black leading-[1.1] tracking-tighter text-[var(--color-text-primary)]">
              WE PROVIDE
              <br />
              <span className="bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] bg-clip-text text-transparent">
                GREAT IT
              </span>
              <br />
              &amp; BUSINESS
              <br />
              SOLUTIONS
            </h2>
          </div>

          {/* Service image cards */}
          {services.map((s) => (
            <div
              key={s.title}
              className="group relative h-full shrink-0 overflow-hidden"
              style={{ width: `${IMG_R * 100}vw` }}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-black/10" />


              {/* Bottom content */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-blue)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-brand)]">
                    {s.tag}
                  </span>
                </div>
                <h3 className="whitespace-pre-line text-5xl font-black leading-[0.88] text-white lg:text-6xl xl:text-7xl">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">{s.desc}</p>
              </div>
            </div>
          ))}

          {/* Trailing spacer */}
          <div className="h-full w-[4vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}
